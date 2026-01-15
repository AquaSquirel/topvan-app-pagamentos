# TopVan Manager 🚐

Sistema moderno de gestão para transporte escolar (Van), desenvolvido para facilitar o controle financeiro, gestão de alunos e manutenção do veículo.

![TopVan Manager Banner](public/icons/icon-512x512.png) <!-- Placeholder para logo se houver -->

## 🚀 Sobre o Projeto

O **TopVan Manager** é uma aplicação Web Progressive (PWA) construída para auxiliar motoristas e gestores de transporte escolar. O sistema permite o controle de mensalidades, gastos com combustível, manutenção e organização das rotas/viagens.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma stack moderna e robusta:

*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React 18](https://react.dev/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes:** [Shadcn/ui](https://ui.shadcn.com/) (Radix UI)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Gráficos:** [Recharts](https://recharts.org/)
*   **Backend / Banco de Dados:** [Firebase](https://firebase.google.com/)
*   **IA / Automação:** [Genkit](https://firebase.google.com/docs/genkit) (Google AI SDK)

## ✨ Funcionalidades Principais

*   **📊 Dashboard Interativo:**
    *   Visão geral de alunos totais.
    *   Resumo financeiro (Recebido vs. Pendente).
    *   Gráficos de desempenho.
    *   Modo de privacidade (ocultar valores).

*   **🎓 Gestão de Alunos:**
    *   Cadastro completo (Nome, Instituição, Endereço).
    *   Separação por turnos (Manhã / Noite / Tarde).
    *   Status de pagamento visual (Pago 🟢 / Pendente 🔴).
    *   Reset mensal de pagamentos.

*   **⛽ Controle de Combustível:**
    *   Registro de abastecimentos.
    *   Cálculo de médias e gastos.

*   **💸 Gestão de Gastos:**
    *   Registro de manutenções e despesas diversas.
    *   Categorização inteligente (via Genkit AI).

*   **🚌 Viagens e Rotas:**
    *   Organização de viagens esporádicas ou rotineiras.

*   **🏫 Instituições:**
    *   Gerenciamento de escolas/faculdades atendidas.

## ⚙️ Instalação e Configuração

### Pré-requisitos
*   Node.js (versão 20 ou superior recomendada)
*   npm ou yarn

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/topvan-app-pagamentos.git
    cd topvan-app-pagamentos
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuração do Ambiente (.env):**
    Crie um arquivo `.env` na raiz do projeto com as credenciais do Firebase e Genkit (se necessário):
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    # ... outras variáveis do Firebase
    GOOGLE_GENAI_API_KEY=...
    ```

4.  **Rodando o Projeto:**

    Para iniciar o servidor de desenvolvimento Next.js:
    ```bash
    npm run dev
    ```
    O app estará disponível em `http://localhost:9002`.

    Para iniciar as ferramentas de IA (Genkit):
    ```bash
    npm run genkit:dev
    ```

## 📁 Estrutura do Projeto

```
src/
├── ai/             # Fluxos e configurações de IA (Genkit)
├── app/            # Páginas e Rotas (Next.js App Router)
│   ├── alunos/     # Gestão de alunos
│   ├── combustivel/# Gestão de combustível
│   ├── gastos/     # Gestão de despesas
│   └── viagens/    # Gestão de viagens
├── components/     # Componentes React reutilizáveis
│   └── ui/         # Componentes base (Shadcn)
├── hooks/          # Custom React Hooks
└── lib/            # Utilitários e configurações (Firebase, Utils)
```

## 📱 PWA (Progressive Web App)

Este projeto está configurado como PWA, permitindo que seja instalado em dispositivos móveis (Android e iOS) e Desktop, oferecendo uma experiência nativa.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`).
3.  Faça o Commit (`git commit -m 'Adicionando nova feature'`).
4.  Faça o Push (`git push origin feature/MinhaFeature`).
5.  Abra um Pull Request.

---
Desenvolvido com ❤️ para facilitar a vida dos transportadores escolares.