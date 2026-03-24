# Rootio — Evolução Pessoal com IA

Aplicativo de desenvolvimento pessoal que une rastreamento de hábitos, finanças, carreira e mentoramento com IA — tudo armazenado localmente, sem conta obrigatória.

---

## Visão Geral

| Área | O que faz |
|---|---|
| **Hábitos** | CRUD completo com subtarefas, prioridades, frequência personalizada e histórico |
| **Finanças** | Lança receitas/despesas, define metas de economia e fundo de emergência |
| **Progresso** | Dashboard analytics com heatmap 52 semanas, sequências e badges |
| **Carreira** | Rastreia leituras, metas profissionais e projetos |
| **Projetos** | Gerencia projetos pessoais com milestones |
| **Mentor** | Chat em tempo real com Claude + diário com PIN e registro de humor |
| **Perfil** | Temas, avatar, plano free/pro, loja de desbloqueáveis e gestão de dados |

---

## Tech Stack

- **React 18** + **Vite 5** — build e dev server
- **React Router v6** — navegação client-side com lazy loading
- **Context API** — estado global (hábitos, histórico, tema, som)
- **CSS Modules** — estilos escopados por componente
- **Web Audio API** — sons procedurais sem arquivos de áudio
- **localStorage** — persistência local-first, offline por padrão
- **Anthropic Claude API** — IA com streaming para mentor e sugestões

---

# Mapa de Navegação — Rootio
---

## Estrutura de Rotas

```
/                   → Home (dashboard)
/habits             → Hábitos
/finance            → Finanças
/progress           → Experiência        ★ requer compra na loja
/mentor             → Mentor             ★ requer compra na loja
/career             → Carreira           ★ requer compra na loja
/projects           → Projetos           ★ requer compra na loja
/profile            → Perfil
/*                  → redireciona para /
```

## Sincronização de Dados

```
Arquitetura: offline-first
  localStorage → fonte primária (sempre disponível)
  Supabase     → sincronização em background (quando logado)

Fluxo de escrita (hábitos):
  toggleHabit / saveHabit / addHabit / deleteHabit
      │
      ▼
  setHabits (atualiza React state)
      │
      ├── saveStorage('nex_habits', ...)  ← imediato
      │
      └── upsertRows('habits', ...)       ← background (.catch warn)
          (só se isLoggedIn && userId)

Fluxo de leitura no login:
  INITIAL_SESSION + !hasLocalData()
      │
      ▼
  loadFromSupabase(userId)
      │
      ▼
  applyRemoteData(data)  → salva em localStorage
      │
      ▼
  window.location.reload()

Tabelas sincronizadas:
  habits · habit_history · transactions
  financial_goals · emergency_fund
  career_readings · career_goals · career_projects
  life_projects · journal
```

---


## Acessibilidade

- Landmarks semânticos: `<nav>`, `<main>`, `<aside>`, `<header>`
- `aria-current="page"` nos links ativos
- `aria-live="polite"` nas notificações toast
- `aria-hidden` em ícones decorativos
- `role="checkbox"` com `aria-checked` no componente CheckBox
- Navegação por teclado em todos os elementos interativos
- Contraste conforme WCAG 2.1

---

## Licença

Projeto pessoal — todos os direitos reservados.
