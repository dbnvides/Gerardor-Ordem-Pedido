'use client';

import React, { useState, useRef } from 'react';
import { AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { 
  Trash2, 
  FileDown, 
  Layout, 
  GripVertical, 
  Type, 
  PlusCircle,
  Calendar, 
  Minus,
  Columns2,
  Columns3,
  UploadCloud,
  Loader2,
  Monitor,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type FieldType = 'title' | 'text' | 'number' | 'date' | 'divider' | 'line' | 'grid-2' | 'grid-3';

interface Column {
  label: string;
  value: string;
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  value: string;
  columns?: Column[];
  fontSize?: number;
}

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'title', label: 'Título', value: 'ORDEM DE PEDIDO', fontSize: 32 },
    { id: '2', type: 'divider', label: 'INFORMAÇÕES GERAIS', value: '', fontSize: 12 },
    { id: '3', type: 'grid-2', label: '', value: '', fontSize: 13, columns: [
      { label: 'CLIENTE', value: '' },
      { label: 'DATA', value: new Date().toLocaleDateString() }
    ]},
  ]);
  const [isPreview, setIsPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const baseUploadRef = useRef<HTMLInputElement>(null);

  const addField = (type: FieldType) => {
    let defaultSize = 13;
    if (type === 'title') defaultSize = 32;
    if (type === 'divider') defaultSize = 12;

    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'title' ? 'TÍTULO' : 'CAMPO',
      value: '',
      fontSize: defaultSize
    };

    if (type === 'grid-2') newField.columns = [{ label: 'CAMPO 1', value: '' }, { label: 'CAMPO 2', value: '' }];
    if (type === 'grid-3') newField.columns = [{ label: 'COL 1', value: '' }, { label: 'COL 2', value: '' }, { label: 'COL 3', value: '' }];

    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const updateColumn = (id: string, colIndex: number, updates: Partial<Column>) => {
    setFields(fields.map(f => {
      if (f.id === id && f.columns) {
        const newCols = [...f.columns];
        newCols[colIndex] = { ...newCols[colIndex], ...updates };
        return { ...f, columns: newCols };
      }
      return f;
    }));
  };

  const removeField = (id: string) => setFields(fields.filter(f => f.id !== id));

  const handleBaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const pdfjs = await import('pdfjs-dist') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const typedarray = new Uint8Array(ev.target?.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: unknown) => (item as { str: string }).str).join(" ");
        }

        const extractedFields: FormField[] = [
          { id: 'base-title', type: 'title', label: 'Título', value: 'ORDEM IMPORTADA', fontSize: 32 },
          { id: 'base-divider', type: 'divider', label: 'DADOS EXTRAÍDOS', value: '', fontSize: 12 }
        ];

        if (fullText.toLowerCase().includes("cliente")) {
          extractedFields.push({ id: 'ex-1', type: 'text', label: 'CLIENTE ENCONTRADO', value: 'Verificar no PDF', fontSize: 13 });
        }
        
        extractedFields.push({ id: 'ex-raw', type: 'text', label: 'TEXTO BRUTO', value: fullText.substring(0, 100) + "...", fontSize: 13 });

        setFields(extractedFields);
        alert("Texto extraído com sucesso! Campos gerados na base.");
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Erro ao ler PDF:", err);
      alert("Erro ao ler PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setIsPreview(true);
    
    setTimeout(async () => {
      try {
        const [html2canvas, { jsPDF }] = await Promise.all([
          import('html2canvas').then(m => (m.default || m) as any), // eslint-disable-line @typescript-eslint/no-explicit-any
          import('jspdf') as Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
        ]);

        const element = pdfRef.current!;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          windowWidth: 794,
          onclone: (clonedDoc: Document) => {
            const container = clonedDoc.getElementById('pdf-content');
            if (container) {
              container.style.boxShadow = 'none';
              container.style.border = 'none';
              container.style.width = '794px';
              container.style.padding = '25mm';
            }

            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.transform = 'none';
              htmlEl.style.transition = 'none';
              htmlEl.style.animation = 'none';
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(`FlexOrder-${new Date().getTime()}.pdf`);
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
      } finally {
        setIsPreview(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20 overflow-x-hidden">
      
      <header className="bg-white border-b border-slate-200 py-3 px-10 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-indigo-200 shadow-lg">
            <Monitor size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter uppercase leading-none text-slate-900">FlexOrder</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">A4 Document Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <input type="file" ref={baseUploadRef} className="hidden" accept=".pdf" onChange={handleBaseUpload} />
          <button 
            onClick={() => baseUploadRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all text-slate-600"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            IMPORTAR PDF
          </button>
          
          <div className="h-6 w-px bg-slate-200 mx-1" />

          <button 
            onClick={() => setIsPreview(!isPreview)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${isPreview ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {isPreview ? 'Editar Documento' : 'Visualizar A4'}
          </button>
          
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg active:scale-95"
          >
            BAIXAR PDF <FileDown size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {!isPreview && (
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Componentes</p>
              <div className="grid grid-cols-1 gap-2.5">
                <ToolButton icon={<Type size={18} />} label="Título" onClick={() => addField('title')} />
                <ToolButton icon={<Layout size={18} />} label="Seção" onClick={() => addField('divider')} />
                <ToolButton icon={<PlusCircle size={18} />} label="Campo" onClick={() => addField('text')} />
                <ToolButton icon={<Columns2 size={18} />} label="2 Colunas" onClick={() => addField('grid-2')} />
                <ToolButton icon={<Columns3 size={18} />} label="3 Colunas" onClick={() => addField('grid-3')} />
                <ToolButton icon={<Calendar size={18} />} label="Data" onClick={() => addField('date')} />
                <ToolButton icon={<Minus size={18} />} label="Linha" onClick={() => addField('line')} />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[9px] font-bold text-slate-300 uppercase leading-relaxed">
                  Dica: Arraste os itens no documento para reordenar.
                </p>
              </div>
            </div>
          </aside>
        )}

        <div className={`${isPreview ? 'lg:col-span-12' : 'lg:col-span-9'} flex justify-center`}>
          <div 
            ref={pdfRef}
            id="pdf-content"
            className="bg-white relative transition-all duration-500 origin-top"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: isPreview ? '25mm' : '20mm',
              boxShadow: isPreview ? 'none' : '0 10px 50px -10px rgba(0,0,0,0.1)',
              boxSizing: 'border-box'
            }}
          >
            <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
              <AnimatePresence>
                {fields.map((field) => (
                  <Item 
                    key={field.id} 
                    field={field} 
                    isPreview={isPreview} 
                    updateField={updateField} 
                    updateColumn={updateColumn}
                    removeField={removeField} 
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 opacity-10">
                <p className="font-black text-xl uppercase tracking-widest">Arraste componentes para começar</p>
              </div>
            )}

            {!isPreview && (
              <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-200 pointer-events-none uppercase">Área Segura A4 (210x297mm)</div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
}

function Item({ field, isPreview, updateField, updateColumn, removeField }: {
  field: FormField;
  isPreview: boolean;
  updateField: (id: string, updates: Partial<FormField>) => void;
  updateColumn: (id: string, colIndex: number, updates: Partial<Column>) => void;
  removeField: (id: string) => void;
}) {
  const dragControls = useDragControls();

  const handleFontSize = (delta: number) => {
    const currentSize = field.fontSize || 13;
    updateField(field.id, { fontSize: Math.max(8, currentSize + delta) });
  };

  const contentFontSize = field.fontSize || 13;
  const labelFontSize = Math.max(7, contentFontSize - 5);

  return (
    <Reorder.Item 
      value={field}
      id={field.id}
      dragListener={false}
      dragControls={dragControls}
      className={`pdf-item group relative bg-white transition-none ${isPreview ? 'border-none mb-0 w-full' : 'mb-3'}`}
    >
      <div className="flex items-start gap-4">
        {!isPreview && (
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-500 transition-colors flex-shrink-0"
          >
            <GripVertical size={20} />
          </div>
        )}
        
        <div className="flex-1 w-full min-w-0">
          {field.type === 'title' && (
            isPreview ? (
              <div className="w-full text-center mb-12 py-6 border-none">
                <h1 
                  className="font-black text-slate-900 uppercase tracking-tighter"
                  style={{ fontSize: `${contentFontSize}px` }}
                >
                  {field.value || 'ORDEM DE SERVIÇO'}
                </h1>
              </div>
            ) : (
              <input 
                type="text"
                value={field.value}
                placeholder="TÍTULO DO DOCUMENTO"
                style={{ fontSize: `${contentFontSize}px` }}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                className="w-full font-black text-slate-900 border-none outline-none bg-slate-50 rounded-lg p-2 focus:bg-indigo-50 transition-all"
              />
            )
          )}

          {field.type === 'divider' && (
            <div className={`mt-8 mb-4 border-b-[1.5pt] border-slate-900 pb-1 ${isPreview ? 'mt-4' : ''}`}>
               {isPreview ? (
                 <span 
                   className="font-black uppercase tracking-[0.25em] text-slate-900 block"
                   style={{ fontSize: `${contentFontSize}px` }}
                 >
                   {field.label}
                 </span>
               ) : (
                 <input 
                  type="text"
                  value={field.label}
                  style={{ fontSize: `${contentFontSize}px` }}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  className="w-full font-black text-sm uppercase tracking-widest text-slate-900 border-none outline-none bg-transparent focus:bg-slate-50 rounded p-1"
                />
               )}
            </div>
          )}

          {field.columns ? (
            <div 
              className={`grid ${isPreview ? 'py-2' : 'gap-6 p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200'}`} 
              style={isPreview ? { 
                display: 'grid', 
                gridTemplateColumns: field.columns.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr',
                gap: '15px' 
              } : {}}
            >
              {field.columns.map((col: Column, idx: number) => (
                <div key={idx} className={`overflow-hidden ${isPreview ? 'border-b border-slate-50 pb-1' : 'flex flex-col gap-1'}`}>
                  {isPreview ? (
                    // LAYOUT VERTICAL PARA COLUNAS NO PREVIEW (Label em cima, Valor embaixo)
                    <div className="flex flex-col">
                      <span 
                        className="font-black text-slate-400 uppercase tracking-widest leading-tight"
                        style={{ fontSize: `${labelFontSize}px` }}
                      >
                        {col.label}
                      </span>
                      <span 
                        className="font-bold text-slate-800 break-words mt-0.5"
                        style={{ fontSize: `${contentFontSize}px` }}
                      >
                        {col.value || '—'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="text"
                        value={col.label}
                        style={{ fontSize: `${labelFontSize}px` }}
                        onChange={(e) => updateColumn(field.id, idx, { label: e.target.value })}
                        className="font-black text-slate-400 uppercase tracking-widest truncate border-none outline-none bg-transparent focus:bg-white rounded transition-all w-full"
                      />
                      <input 
                        type="text"
                        value={col.value}
                        style={{ fontSize: `${contentFontSize}px` }}
                        onChange={(e) => updateColumn(field.id, idx, { value: e.target.value })}
                        className="font-bold text-slate-800 border-none outline-none bg-white px-2 py-1.5 rounded border border-slate-100 focus:border-indigo-200 transition-all shadow-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            (field.type === 'text' || field.type === 'number' || field.type === 'date') && (
              isPreview ? (
                // LAYOUT HORIZONTAL JUSTO PARA LINHA ÚNICA (Label ao lado do Valor)
                <div className="flex items-baseline gap-2 py-2 border-b-[0.5pt] border-slate-100">
                   <span 
                     className="font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                     style={{ fontSize: `${labelFontSize}px` }}
                   >
                     {field.label}:
                   </span>
                   <span 
                     className="font-bold text-slate-800 break-words"
                     style={{ fontSize: `${contentFontSize}px` }}
                   >
                      {field.type === 'date' && field.value ? new Date(field.value).toLocaleDateString('pt-BR') : (field.value || '—')}
                   </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                   <input 
                    type="text"
                    value={field.label}
                    style={{ fontSize: `${labelFontSize + 2}px` }}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="font-bold text-slate-400 uppercase tracking-tighter border-none outline-none bg-transparent focus:bg-white rounded p-1 w-auto min-w-[60px]"
                  />
                  <div className="h-4 w-px bg-slate-200" />
                  <input 
                    type={field.type === 'date' ? 'date' : 'text'}
                    value={field.value}
                    style={{ fontSize: `${contentFontSize}px` }}
                    onChange={(e) => updateField(field.id, { value: e.target.value })}
                    className="flex-1 font-bold text-slate-800 border-none outline-none bg-white px-3 py-1.5 rounded border border-slate-100 focus:border-indigo-200 transition-all shadow-sm"
                  />
                </div>
              )
            )
          )}

          {field.type === 'line' && (
            <div className="py-4 border-none">
              <div className="border-t border-slate-200 w-full" />
            </div>
          )}
        </div>

        {!isPreview && (
          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button 
              onClick={() => handleFontSize(2)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
            >
              <ChevronUp size={16} />
            </button>
            <div className="text-[9px] font-bold text-slate-300">{contentFontSize}</div>
            <button 
              onClick={() => handleFontSize(-2)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
            >
              <ChevronDown size={16} />
            </button>
            <div className="h-4 w-px bg-slate-100 my-1" />
            <button 
              onClick={() => removeField(field.id)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

function ToolButton({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest text-slate-500 border border-transparent shadow-sm group"
    >
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:text-indigo-600 transition-all">
        {icon}
      </div>
      {label}
    </button>
  );
}
