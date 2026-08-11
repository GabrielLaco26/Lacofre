# Lacofre

Controle financeiro pessoal — Node.js/Express + SQLite no back-end, HTML/CSS/JS puro no front-end.

## Rodando o projeto

```bash
cd backend
npm install
npm start
```

Abre em `http://localhost:3000/login.html`. O banco (`backend/coinflow.db`) é criado automaticamente e não é versionado (contém dados reais de usuários — veja `.gitignore`).

## Fluxo de trabalho: Issues e Pull Requests

Este projeto usa GitHub Issues e PRs de forma **seletiva**, não para toda e qualquer mudança. Não existe pipeline de deploy/CI configurado ainda — hoje um merge na `main` não dispara nada automaticamente, então PRs servem para revisão e histórico, não para "gerenciar deploy".

**Abra uma Issue + PR quando for:**
- Uma funcionalidade nova (ex: nova tela, novo recurso no dashboard)
- Uma mudança que muda comportamento existente de forma perceptível
- Algo que vale documentar o "porquê" para o futuro

**Pode commitar direto na `main`, sem Issue/PR, quando for:**
- Correção pequena de bug (CSS, lógica pontual, ajuste visual)
- Tweak de estilo, copy, ou responsividade
- Qualquer coisa testada na hora e sem ambiguidade sobre o que fazer

Quando **abrir Issue**: título curto e imperativo (ex: "Adicionar exportação em PDF"), descrição com o contexto/motivação. Tipo (correção, melhoria, feature) como label se fizer sentido.

Quando **abrir PR**: branch a partir da `main` (`feature/nome-curto` ou `fix/nome-curto`), e a descrição do PR **sempre menciona a Issue relacionada** (`Closes #N` ou `Relacionado à #N`) quando existir uma. Testar a mudança rodando o app localmente antes de marcar como pronto pra merge.

Essa convenção vale para qualquer agente de IA ou pessoa contribuindo no repositório, independente da ferramenta usada.
