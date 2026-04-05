# 📑 FlexOrder | A4 Document Engine

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

> **FlexOrder** é um gerador dinâmico de documentos e ordens de serviço em formato A4. Construído para ser flexível, ele permite que usuários montem layouts complexos através de uma interface visual intuitiva, com exportação de PDF de alta fidelidade.

---

## ✨ Funcionalidades Principais

- 🖱️ **Drag-and-Drop Real-Time**: Reordene campos instantaneamente usando a tecnologia do Framer Motion.
- 🖋️ **Editor de Fontes Individual**: Controle o tamanho da letra (`+` / `-`) de cada campo de forma independente.
- 📐 **Layouts Multi-Coluna**: Suporte para campos em 2 ou 3 colunas com alinhamento automático.
- 📄 **Motor de PDF Otimizado**: Exportação em A4 (210x297mm) com renderização limpa, eliminando artefatos de inputs e botões.
- 🧪 **Extração Inteligente (Beta)**: Importe um PDF existente e tente extrair textos para usar como base para novos campos.
- 🎨 **Preview A4 Realista**: Visualize exatamente como o documento será impresso antes de exportar.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **Next.js 15** | Framework React para performance e roteamento. |
| **Tailwind CSS** | Estilização utilitária para uma UI moderna e responsiva. |
| **Framer Motion** | Animações fluidas e sistema de reordenação (Drag). |
| **html2canvas** | Captura de elementos do DOM para conversão em imagem. |
| **jsPDF** | Geração e manipulação de documentos PDF. |
| **PDF.js** | Motor para leitura e extração de dados de arquivos PDF. |
| **Lucide React** | Pacote de ícones minimalistas e consistentes. |

---

## 🚀 Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/flex-order-generator.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   `http://localhost:3000`

---

## 📖 Como Usar

1. **Adicionar Campos**: Use a barra lateral esquerda para arrastar ou clicar nos componentes (Título, Seção, 2 Colunas, etc).
2. **Editar Conteúdo**: Clique em qualquer label (nome do campo) ou valor para alterar o texto.
3. **Personalizar**: Use os controles de `+` e `-` que aparecem ao passar o mouse sobre um item para ajustar o tamanho da fonte.
4. **Organizar**: Arraste os itens pelo ícone de "grip" (vertical) para mudar a ordem.
5. **Exportar**: Clique em **"Visualizar A4"** para conferir o layout final e depois em **"Exportar PDF"**.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-github)
