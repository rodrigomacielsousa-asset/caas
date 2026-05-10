# MicroCaaS - Ecossistema de microsoluções contábeis

Projeto oficial do portal **microcaas.com.br**, focado na divulgação e catálogo de microsoluções contábeis (CaaS - Accounting as a Service).

## 🚀 Tecnologias
- **Frontend:** React 19 + Vite + TypeScript
- **Estilização:** Tailwind CSS (Modern SaaS UI)
- **Animações:** Motion
- **Roteamento:** React Router 7
- **Database:** LocalStorage (Padrão) / Firebase (Opcional)

## 📦 Como Rodar Localmente

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`
4. Acesse: `http://localhost:3000`

## ☁️ Configurações e API Keys (Firebase e IA)
Para ativar a persistência em nuvem (Firestore e Auth) e funcionalidades de Inteligência Artificial:
1. Copie o conteúdo de `.env.example` para um novo arquivo `.env`
2. **Firebase**: Configure `VITE_USE_FIREBASE=true` e preencha as credenciais.
3. **Gemini IA**: Para habilitar os recursos de inteligência artificial (analisador de notas, classificação inteligente), você precisa de uma chave de API do Gemini.
   - Crie ou entre com uma conta Google (ex: `rodrigomaciel.sousa@gmail.com`) no [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Gere uma nova API Key.
   - Adicione sua chave: `VITE_GEMINI_API_KEY=sua_chave_aqui`
   - **Aviso de Segurança**: Em ambiente de desenvolvimento local isso é seguro para prototipagem. Para **produção real**, a chave nunca deve ficar no `.env` do frontend. O ideal é criar uma Firebase Cloud Function ou Backend Node.js que comunique com a API da IA.
4. O `storageService.ts` e o `geminiService.ts` cuidarão do resto automaticamente.

## 🚢 Deploy (GitHub Pages)
O projeto já inclui um workflow de GitHub Actions em `.github/workflows/deploy.yml`.

### Configuração de Domínio Personalizado
1. **Registro.br:**
   - Aponte os registros **A** para os IPs do GitHub Pages (185.199.108.153, etc).
   - Crie um registro **CNAME** para `www` apontando para `seu-usuario.github.io`.
2. **GitHub Settings:** 
   - Vá em Settings > Pages.
   - **Build and deployment > Source**: Selecione **"GitHub Actions"** (Obrigatório para que o deploy funcione via workflow).
   - **Custom domain**: Insira `microcaas.com.br`.
3. **Roteamento SPA**: O build gera um arquivo `404.html` (cópia do `index.html`) para permitir que rotas diretas funcionem corretamente sem Erro 404 do GitHub.

## 📂 Estrutura de Conteúdo
- `src/data/solucoes.json`: Soluções Oficiais controladas pelo time CaaS.
- `src/data/microcaas.json`: Catálogo de microsoluções da comunidade.
- `src/pages/Reforma.tsx`: Hub e Simulador da Reforma Tributária.

---
Feito com ❤️ pela Comunidade CaaS Contábil.
