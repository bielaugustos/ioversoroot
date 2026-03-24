# Mapa de Navegação — Rootio

---

## Fluxo de Entrada

```
Abertura do app (qualquer acesso)
      │
      ▼
┌─────────────────┐
│   SplashScreen  │  animação de entrada (~1.35s)
│   pontos · logo │  exibido a cada carregamento/reload
└────────┬────────┘
         │ onDone()
         ▼
   AuthContext carrega sessão Supabase
         │
   isLoggedIn?
    /         \
  Sim          Não
   │            │
   │      ior_auth_skipped?
   │         /        \
   │        Sim        Não
   │         │          │
   ▼         ▼          ▼
 App      App        Login
          (guest)
```

---

## Fluxo de Autenticação

```
Tela de Login
      │
      ├── [Entrar com Google]  ──► OAuth Supabase → App (+ SplashScreen transição)
      ├── [Entrar com e-mail]  ──► Magic Link / senha → App
      └── [Continuar sem conta] ──► seta ior_auth_skipped=true → App (guest)

Após login bem-sucedido:
      │
      ▼
  INITIAL_SESSION (Supabase)
      │
  hasLocalData()?
    /         \
  Não          Sim
   │            │
   ▼            ▼
Carrega       Mantém dados locais
dados da      (migração pendente)
nuvem →
applyRemoteData()
+ reload
```

---

## Modais de Transição (sobrepostos ao app)

```
┌─────────────────────────────────────────────────┐
│  MigrationModal — modo "migrate"                │
│  Exibido UMA VEZ ao usuário logado com dados    │
│  locais não migrados (profile.migration_done=0) │
│                                                 │
│  [Sim, subir dados]  →  sobe tudo ao Supabase   │
│                         + seta migration_done   │
│                         + reload com SplashScreen│
│  [Agora não]         →  seta migration_done     │
│                         + fecha modal           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  MigrationModal — modo "paywall"                │
│  Exibido ao visitante (guest) que atingiu ≥60%  │
│  de qualquer limite free (reexibe após 7 dias)  │
│                                                 │
│  [Criar conta gratuita]  →  remove skipped flag │
│                             → reload → Login    │
│  [Continuar sem conta]   →  fecha por 7 dias    │
└─────────────────────────────────────────────────┘
```

Limites que disparam o paywall:
- ≥ 6 hábitos
- ≥ 6 leituras de carreira
- ≥ 2 projetos ativos (planejando/andamento)
- ≥ 30 transações financeiras no mês

---

## Layout por Dispositivo

```
MOBILE (< 768px)                    DESKTOP (≥ 768px)
┌──────────────────┐                ┌────────┬─────────────────┐
│     Header       │                │        │     Header      │
│  logo  streak    │                │        ├─────────────────┤
├──────────────────┤                │        │  OfflineBanner  │
│  OfflineBanner   │                │  Side  ├─────────────────┤
├──────────────────┤                │  Nav   │                 │
│                  │                │        │      <main>     │
│      <main>      │                │ logo   │   (página ativa)│
│  (página ativa)  │                │ links  │                 │
│                  │                │ perfil │                 │
├──────────────────┤                └────────┴─────────────────┘
│    BottomNav     │
│ Início Hábitos   │
│ Finanças Perfil  │
│ [desbloqueáveis] │
└──────────────────┘
```

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

---

## Telas e Seções

### / — Home (Dashboard)
```
┌──────────────────────────────────────┐
│  Card: Nível + Streak + Barra de XP  │
│  "Impulso" ·  io · próximo: Rastro   │
├──────────────────────────────────────┤
│  Card: Ação Principal                │
│  "Próximo hábito a fazer"            │
├──────────────────────────────────────┤
│  Card: Progresso do Dia              │
│  pips visuais · X/Y concluídos       │
├──────────────────────────────────────┤
│  Card: Calendário (últimos 7 dias)   │
│  mini heatmap de intensidade         │
├──────────────────────────────────────┤
│  Card: Insights  [PRO]               │
│  taxa 7d · tendência · melhor dia    │
│  trilha 14d · consistência 30d       │
└──────────────────────────────────────┘
```

---

### /habits — Hábitos
```
┌──────────────────────────────────────┐
│  Barra de resumo: X/Y hoje · pts     │
├──────────────────────────────────────┤
│  [+ Novo Hábito]  [Sugerir com IA]   │
├──────────────────────────────────────┤
│  Grid de cards por hábito:           │
│  ┌────────────────────────────────┐  │
│  │ □ Nome do Hábito   [alta] 20pt │  │
│  │ subtarefas · última vez: ontem │  │
│  │ ▪▪▪▪▪ barras 7 dias           │  │
│  │                   [⋯ opções]  │  │
│  └────────────────────────────────┘  │
│  (repete para cada hábito)           │
├──────────────────────────────────────┤
│  Formulário (expandível):            │
│  nome · ícone · pts · prioridade     │
│  frequência · dias da semana         │
│  subtarefas · notas · motivo · tags  │
│  estimativa · deadline · período     │
└──────────────────────────────────────┘
```

---

### /finance — Finanças
```
┌──────────────────────────────────────┐
│  Tabs: Resumo │ Transações │ Metas   │
├──────────────────────────────────────┤
│  RESUMO                              │
│  ┌──────────┐ ┌──────────┐           │
│  │ Receitas │ │ Despesas │           │
│  └──────────┘ └──────────┘           │
│  Saldo atual · Taxa de economia      │
│  Fundo de emergência (barra %)       │
│  Meta mensal (barra %)               │
│                                      │
│  Gráfico 6 meses (colunas)           │
│  [clique para fixar tooltip]         │
├──────────────────────────────────────┤
│  TRANSAÇÕES                          │
│  [+ Adicionar] tipo · valor · data   │
│  Lista com editar/excluir            │
├──────────────────────────────────────┤
│  METAS DE ECONOMIA                   │
│  [+ Nova Meta] nome · alvo · ícone   │
│  Card por meta:                      │
│  barra progresso · aportes · desfazer│
└──────────────────────────────────────┘
```

---

### /progress — Experiência  ★ desbloqueável
```
┌──────────────────────────────────────┐
│  Tabs: Visão Geral │ Conquistas      │
├──────────────────────────────────────┤
│  VISÃO GERAL                         │
│  Barras semanais (7 dias)            │
│  Sequências por hábito               │
│  Detalhe por hábito:                 │
│    taxa de conclusão · streak        │
│                                      │
│  Heatmap 52 semanas                  │
│  (intensidade 0–4 por dia)           │
├──────────────────────────────────────┤
│  CONQUISTAS                          │
│  [Todas] [Minhas] [Em aberto]        │
│  Cards com:                          │
│    ícone · nome · critério           │
│    barra de progresso                │
│    dica de como desbloquear          │
│                                      │
│  Desafios Semanais (3):              │
│  20 conclusões / 3 dias perfeitos /  │
│  7 dias seguidos                     │
└──────────────────────────────────────┘
```

---

### /mentor — Mentor  ★ desbloqueável
```
┌──────────────────────────────────────┐
│  [Sem PIN]  ou  [PIN configurado]    │
│                                      │
│  ── Modo: Diário ──                  │
│  Registro de humor (5 opções)        │
│  Prompt de reflexão (30 rotativos)   │
│  Campo de texto livre                │
│  [Salvar entrada]                    │
│  Histórico de entradas               │
├──────────────────────────────────────┤
│  ── Modo: Chat com IA ──             │
│  Mensagens anteriores                │
│  [Campo de texto]  [Enviar]          │
│                                      │
│  Claude recebe contexto:             │
│  hábitos + histórico + taxa hoje     │
│  Respostas em streaming              │
└──────────────────────────────────────┘
│  Se PIN ativado:                     │
│  Tela de PIN (4 dígitos)             │
│  antes de acessar o diário           │
└──────────────────────────────────────┘
```

---

### /career — Carreira  ★ desbloqueável
```
┌──────────────────────────────────────┐
│  Tabs: Leituras │ Metas │ Projetos   │
├──────────────────────────────────────┤
│  LEITURAS                            │
│  [+ Adicionar] título · autor · tipo │
│  Status: Quero ler → Lendo →         │
│          Concluído / Pausado         │
│  Barra de progresso %                │
├──────────────────────────────────────┤
│  METAS PROFISSIONAIS                 │
│  [+ Nova Meta] objetivo · área       │
│  data-alvo · prioridade · status     │
├──────────────────────────────────────┤
│  PROJETOS                            │
│  [+ Novo] nome · categoria           │
│  deadline · prioridade · status      │
│  Lista de milestones (checklist)     │
└──────────────────────────────────────┘
```

---

### /projects — Projetos  ★ desbloqueável
```
┌──────────────────────────────────────┐
│  [+ Novo Projeto]                    │
├──────────────────────────────────────┤
│  Card por projeto:                   │
│  ┌────────────────────────────────┐  │
│  │ Nome  [Pessoal] [alta] ●       │  │
│  │ Descrição                      │  │
│  │ Deadline · Status              │  │
│  │ Milestones: □ □ ■              │  │
│  │ barra de progresso             │  │
│  └────────────────────────────────┘  │
│                                      │
│  Categorias:                         │
│  Pessoal · Saúde · Finanças          │
│  Aprendizado · Criativo · Social     │
│                                      │
│  Status: Planejando → Andamento →    │
│          Pausado → Concluído         │
└──────────────────────────────────────┘
```

---

### /profile — Perfil
```
┌──────────────────────────────────────┐
│  Avatar (emoji) · Nome de usuário    │
│  Nível atual · barra XP              │
├──────────────────────────────────────┤
│  Tabs: Preferências │ Plano │        │
│        Loja │ Dados                  │
├──────────────────────────────────────┤
│  PREFERÊNCIAS                        │
│  Temas (9 opções)                    │
│  Sons (toggle)                       │
│  Chave de API (campo texto)          │
├──────────────────────────────────────┤
│  PLANO                               │
│  Free (gratuito) vs Pro              │
│  Dois cards lado a lado:             │
│  Free: lista de recursos incluídos   │
│  Pro: "Tudo do Gratuito, mais:" +    │
│       extras destacados em dourado   │
├──────────────────────────────────────┤
│  LOJA                                │
│  Utilitários (4 páginas)             │
│  Avatares (4 emojis)                 │
│  Preço em io · [Comprar]             │
├──────────────────────────────────────┤
│  DADOS                               │
│  [Exportar JSON]  [Importar JSON]    │
│  [Resetar tudo]                      │
│  Informações de uso do armazenamento │
├──────────────────────────────────────┤
│  Footer: logo · tagline · redes      │
│  Termos · Privacidade · Cookies      │
│  (abrem em modal interno)            │
├──────────────────────────────────────┤
│  Se logado:                          │
│  [Migrar dados locais]  (se houver)  │
│  [Sair da conta]  →  modal confirm   │
│                       + reload       │
│                                      │
│  Se visitante (guest):               │
│  [Entrar na conta]  →  remove skip   │
│                        + reload      │
│  [Sair da conta]    →  modal confirm │
│                        + clearLocal  │
│                        + reload      │
└──────────────────────────────────────┘
```

---

## Fluxo de Logout

```
[Sair da conta]
      │
      ▼
Modal de confirmação
  "Tem certeza que deseja sair?"
      │
  Confirmar?
   /       \
  Sim        Não
   │          │
   ▼          ▼
signOut()   fecha modal
   │
   ▼
window.location.reload()
   │
   ▼
SplashScreen (animação)
   │
   ▼
App reinicia → tela de Login
```

---

## Fluxo de Desbloqueio (Loja)

```
Usuário acumula io
        │
        ▼
  Perfil → Loja
        │
  [Comprar item]
        │
   io suficientes?
     /       \
   Sim        Não
    │          │
    ▼          ▼
  Salva      Toast
  nex_shop_  "io
  owned[]    insuficiente"
    │
    ▼
Evento: nex_shop_changed
    │
    ▼
BottomNav / SideNav
  detectam mudança
    │
    ▼
Novo item aparece
  na navegação
  (animação 550ms)
```

---

## Fluxo de Reset Diário

```
App carrega
    │
    ▼
data atual == nex_last_reset?
    │
   Não
    │
    ▼
resetDay() — marca todos os hábitos
             com done: false
             salva nova data

Também agendado via setTimeout
para 00:00:01 do dia seguinte
(sem depender de reload)
```

---

## Fluxo de Autenticação do Diário

```
Acessa /mentor
      │
      ▼
PIN configurado?
   /       \
  Não      Sim
   │        │
   ▼        ▼
 Acesso   Tela PIN
 direto   4 dígitos
           │
      Correto?
      /       \
    Sim        Não
     │          │
     ▼          ▼
  Diário     som erro
  aberto     + shake
```

---

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

## Comunicação entre Componentes

```
AuthContext
    ├── session, user, profile, isLoggedIn, plan, isPro
    └── lido por: AppShell, AppContext, Profile, Header

AppContext (estado global)
    ├── habits, history, theme, soundOn, plan
    ├── toggleHabit, saveHabit, addHabit, deleteHabit, resetDay
    ├── setTheme, toggleTheme, setSoundOn, setPlan
    ├── lido por: Home, Habits, Progress, Mentor, SideNav
    └── sincroniza com Supabase em background quando logado

localStorage (persistência)
    ├── nex_habits / nex_history         → AppContext
    ├── nex_shop_owned                   → BottomNav, SideNav, Profile
    ├── nex_fin_* / nex_career_*         → Finance, Career
    ├── ior_auth_skipped                 → AppShell (modo guest)
    ├── ior_migration_offered_<userId>   → AppShell (flag local migração)
    └── nex_paywall_at                   → AppShell (cooldown paywall 7d)

Eventos customizados
    └── "nex_shop_changed"
        emitido por: Profile (loja)
        ouvido por:  BottomNav, SideNav
    └── "nex_plan_changed"
        emitido por: AppContext
        ouvido por:  componentes que reagem ao plano

Toast (singleton)
    └── chamado diretamente via toast("msg")
        de qualquer página ou componente
```
