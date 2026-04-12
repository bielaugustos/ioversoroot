# Rootio - Documentação de Componentes e Telas

Este documento serve como referência para integração com sistemas de design como shadcn/ui, Radix UI, ou qualquer biblioteca de componentes baseada em React.

---

## Tabela de Conteúdo
1. [Estrutura de Arquivos](#estrutura-de-arquivos)
2. [Componentes Base](#componentes-base)
3. [Telas do Aplicativo](#telas)
4. [Navegação](#navegação)
5. [Sistema de Temas](#sistema-de-temas)

---

## Estrutura de Arquivos

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Header.jsx       # Header mobile
│   ├── BottomNav.jsx     # Navegação inferior mobile
│   ├── SideNav.jsx       # Navegação lateral desktop
│   ├── Toast.jsx         # Notificações toast
│   ├── ThemeSelector.jsx # Seletor de temas
│   └── ...
│
├── pages/                # Páginas do app (rotas)
│   ├── Login.jsx         # /login
│   ├── Home.jsx          # /
│   ├── Habits.jsx        # /habits
│   ├── Finance.jsx       # /finance
│   ├── Progress.jsx      # /progress
│   ├── Mentor.jsx        # /mentor
│   ├── Career.jsx        # /career
│   ├── Projects.jsx      # /projects
│   ├── Rewards.jsx       # /rewards
│   ├── Profile.jsx       # /profile
│   └── Stats.jsx         # /stats
│
├── pages/                # Estilos CSS Modules
│   ├── *.module.css      # Um arquivo por página
│
├── context/              # React Context
│   ├── AuthContext.jsx   # Autenticação
│   └── AppContext.jsx    # Estado global
│
├── hooks/                # Custom hooks
│   ├── useTheme.js       # Gerenciamento de tema
│   ├── useSound.js       # Feedback sonoro
│   ├── usePlan.js        # Plano Pro/grátis
│   └── ...
│
├── services/
│   ├── themes.js         # Definição de temas
│   └── supabase.js       # Backend/supabase
│
├── constants/
│   └── themeConstants.js # Lista de temas disponíveis
│
└── styles/
    └── global.css        # Estilos globais e utilitários
```

### CSS Modules vs Global CSS

O app usa uma combinação de:
- **CSS Modules** (`*.module.css`): Estilos específicos de cada página/componente
- **Global CSS** (`global.css`): Estilos utilitários compartilhados (`.btn`, `.card`, `.input`, etc.)

**Importante**: Para migrar para shadcn/ui, você precisará:
1. Substituir os CSS Modules por componentes da biblioteca
2. Manter as CSS variables do global.css para suportar temas

---

## Componentes Base

### Button (Botão)
```jsx
// Variantes disponíveis
<button className="btn">Default</button>
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Danger</button>
<button className="btn" disabled>Disabled</button>

// Props
- onClick?: () => void
- disabled?: boolean
- children: ReactNode
- type?: 'button' | 'submit' | 'reset'
- className?: string
```

### Input (Campo de texto)
```jsx
<input className="input" type="text" placeholder="Texto" />
<input className="input" type="email" />
<input className="input" type="password" />
<input className="input" type="date" />
<input className="input" type="number" />
<input className="input" inputMode="decimal" />

// Props
- value?: string
- onChange?: (e: ChangeEvent) => void
- placeholder?: string
- type?: string
- inputMode?: 'text' | 'decimal' | 'numeric' | 'email'
- className?: string
```

### Checkbox (Caixa de seleção)
```jsx
<button className="hcheck" aria-label="Marcar">
  <svg className="check-svg">...</svg>
</button>

// Props
- checked?: boolean
- onChange?: () => void
- disabled?: boolean
- aria-label?: string
```

### Card (Cartão)
```jsx
<div className="card">
  <div className="card-title">Título</div>
  {/* Conteúdo */}
</div>
```

### Progress Bar (Barra de progresso)
```jsx
<div className="pbar-wrap">
  <div className="pbar-fill" style={{ width: '60%' }} />
  <span className="pbar-label">60%</span>
</div>
```

### Toast (Notificação)
```jsx
// O toast é controlado globalmente via contexto
import { toast } from '../components/Toast'
toast('Mensagem')
```

### Badge (Etiqueta de prioridade)
```jsx
<span className="pri-dot" style={{ background: cor }} />
<span className="pri-lbl pri-alta">Alta</span>
<span className="pri-lbl pri-media">Média</span>
<span className="pri-lbl pri-baixa">Baixa</span>
```

---

## Telas

### 1. Login (/login)
**Arquivo:** `src/pages/Login.jsx`

**Componentes:**
- Logo (imagem)
- Toggle (Login / Cadastro)
- Formulário de login:
  - Input email
  - Input password (com toggle visibilidade)
  - Button submit ("Entrar")
- Link "Esqueci minha senha"
- Divider "ou"
- Button "Continuar sem conta" (skip)
- Nota de privacidade

**Estado:**
- mode: 'login' | 'register'
- email: string
- password: string
- error: string | null

---

### 2. Home (/)
**Arquivo:** `src/pages/Home.jsx`

**Blocos:**

#### 2.1 Pontos & Nível (Stats)
- Total de pontos (número grande)
- Nome do nível atual
- Barra de progresso para próximo nível
- Mantra/mensagem motivational

#### 2.2 Ação Principal (Hero Card)
- Label "Ação Principal do Dia"
- Nome do hábito
- Badges: Prioridade, Tempo estimado, Tags
- Botão "Começar" → inicia timer
- Botão "Pular" → pula para próximo
- Estado "Concluído" quando finish

#### 2.3 Calendário Semanal
- 7 colunas (dias da semana)
- Cells de intensidade (0-4)
- Dia atual destacado

#### 2.4 Insights
- Porcentagem de conclusão
- Trend (aumentando/diminuindo)
- Grid de 3 chips (streak, média, melhor dia)
- Trilha de 14 dias

---

### 3. Habits (/habits)
**Arquivo:** `src/pages/Habits.jsx`

**Componentes:**
- Header com busca e filtros
- Lista de hábitos
- Cada hábito:
  - Checkbox (concluir/não)
  - Nome do hábito
  - Badges (prioridade, dias)
  - Categoria/cor
  - Edit/Delete actions
- FAB "+" para adicionar
- Modal de criação/edição

**Estados:**
- habits: Habit[]
- filter: 'all' | 'active' | 'completed'
- search: string

---

### 4. Finance (/finance)
**Arquivo:** `src/pages/Finance.jsx`

**Abas:**
- Resumo
- Transações
- Metas
- Emergencia

#### Aba Resumo
- Saldo do mês (hero)
- Botões: + Entrada, + Saída
- Insight
- Resumo: Entradas | Saídas
- Gráfico 6 meses (barras)

#### Aba Transações
- Filtros: Todas, Entradas, Saídas
- Lista de transações:
  - Ícone (entrada/saida)
  - Descrição
  - Categoria
  - Valor
  - Data
- Inline edit/delete

#### Aba Metas
- Criar meta (nome, valor, prazo, ícone)
- Lista de metas:
  - Progress bar
  - Valor salvo / valor alvo
  - Botão aportar
  - Botão desfazer

#### Aba Reserva de Emergência
- Meta (6 meses de despesas)
- Valor atual
- Progress bar
- Histórico de depósitos

---

### 5. Progress (/progress)
**Arquivo:** `src/pages/Progress.jsx`

**Abas:**
- Hoje
- Histórico
- Estatísticas
- Conquistas

#### Aba Hoje
- Pontos do dia
- Hábitos concluídos / total
- Gráfico de atividades

#### Aba Histórico
- Calendário mensal
- Filtrar por período
- Lista de dias com detalhes

#### Aba Estatísticas
- Total de pontos
- Dias de streak atual
- Maior streak
- Total de dias perfeitos
- Gráfico de evolução

#### Aba Conquistas
- Lista de conquistas
- Status: conquistada / não conquistada
- Progresso para próxima

---

### 6. Mentor (/mentor)
**Arquivo:** `src/pages/Mentor.jsx`

**Componentes:**
- Chat/ interface
- Lista de mensagens
- Input de mensagem
- Botões de sugestão
- Typing indicator

---

### 7. Career (/career)
**Arquivo:** `src/pages/Career.jsx`

**Seções:**
- Currículo/Perfil
- Experiências
- Formações
- Skills
- Projetos
- Metas profissionais

---

### 8. Projects (/projects)
**Arquivo:** `src/pages/Projects.jsx`

**Componentes:**
- Grid de projetos
- Card de projeto:
  - Título
  - Descrição
  - Tags/Tech stack
  - Status (ativo/concluído)
  - Link
- Modal de criar/editar

---

### 9. Rewards (/rewards)
**Arquivo:** `src/pages/Rewards.jsx`

**Seções:**
- Pontos disponíveis
- Histórico de pontos
- Loja de recompensas
- Recompensas disponíveis:
  - Imagem
  - Nome
  - Custo em pontos
  - Button "Resgatar"

---

### 10. Profile (/profile)
**Arquivo:** `src/pages/Profile.jsx`

**Seções:**
- Avatar
- Nome
- Email
- Configurações:
  - Tema (lista de temas)
  - Notificações
  - Som/feedback
  - Idioma
- estatisticas Pessoais
- Dados de conta
- Sair/Logout

---

## Navegação

### Header (Mobile)
```jsx
<header className="header">
  <button className="logo">Logo</button>
  {streak > 0 && <span className="streakPill">🔥 {streak}</span>}
</header>
```

### BottomNav (Mobile)
```jsx
<nav className="nav">
  <NavLink to="/" icon={PiHouseBold}>Home</NavLink>
  <NavLink to="/habits" icon={PiCheckSquareBold}>Habits</NavLink>
  <NavLink to="/finance" icon={PiWalletBold}>Finance</NavLink>
  <NavLink to="/progress" icon={PiChartBarBold}>Stats</NavLink>
  <NavLink to="/profile" icon={PiUserBold}>Perfil</NavLink>
</nav>
```

### SideNav (Desktop)
```jsx
<aside className="sidenav">
  <NavLink>Home</NavLink>
  <NavLink>Habits</NavLink>
  <NavLink>Finance</NavLink>
  <NavLink>Progress</NavLink>
  <NavLink>Mentor</NavLink>
  <NavLink>Career</NavLink>
  <NavLink>Projects</NavLink>
  <NavLink>Rewards</NavLink>
  <NavLink>Profile</NavLink>
</aside>
```

---

## Sistema de Temas

### Estrutura de Temas
```javascript
// src/services/themes.js
{
  id: 'light',
  name: 'Padrão',
  emoji: '☀️',
  dark: false,
  vars: {
    '--bg': '#ffffff',
    '--surface': '#f5f5f5',
    '--white': '#fff',
    '--ink': '#111111',
    '--ink2': '#333333',
    '--ink3': '#555555',
    '--border': '#e0e0e0',
    '--shadow': '#cccccc',
    '--gold': '#F0C020',
    '--gold-dk': '#b08000',
    '--radius': '4px'
  }
}
```

### CSS Variables Usadas
| Variable | Uso |
|----------|-----|
| --bg | Background principal |
| --bg2 | Background secundário |
| --surface | Background de cards |
| --white | Fundo branco |
| --ink | Texto principal |
| --ink2 | Texto secundário |
| --ink3 | Texto terciário/muted |
| --border | Cor de bordas |
| --shadow | Cor de sombras |
| --gold | Cor dourada principal |
| --gold-dk | Cor dourada escura |
| --radius | Border radius |

### Criando Novo Tema

Para adicionar um novo tema compatível com shadcn/ui:

1. Adicionar em `src/constants/themeConstants.js`:
```javascript
{ id:'nome_tema', name:'Nome', emoji:'🎨', free:true }
```

2. Adicionar variáveis em `src/services/themes.js`:
```javascript
nome_tema: {
  id: 'nome_tema',
  name: 'Nome',
  emoji: '🎨',
  dark: false,
  vars: {
    '--bg': '#valor',
    '--surface': '#valor',
    // ... outras vars
  }
}
```

3. Adicionar CSS overrides se necessário em `global.css`:
```css
[data-theme='nome_tema'] .btn { /* custom styles */ }
[data-theme='nome_tema'] .card { /* custom styles */ }
```

---

## Integração com shadcn/ui

Para migrar para shadcn/ui ou similar:

1. **Instalar dependências:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input checkbox card badge progress avatar dialog dropdown-menu
```

2. **Substituir classes:**
| Original | shadcn/ui |
|----------|-----------|
| className="btn" | className={button()} |
| className="btn btn-primary" | variant="primary" |
| className="input" | className={input()} |
| className="card" | className={card()} |
| className="hcheck" | Checkbox component |
| className="pri-dot" | Badge component |

3. **Manter temas:** As CSS variables do app podem ser usadas no Tailwind config para manter compatibilidade com os temas existentes.

---

## Icons (Phosphor Icons)

O app usa Phosphor Icons (react-icons/pi):

```javascript
import { PiHouseBold, PiCheckSquareBold, PiWalletBold, PiChartBarBold, PiUserBold } from 'react-icons/pi'
```

Lista completa: https://phosphoricons.com/

---

## Hooks Importantes

- `useTheme()` - Gerencia tema atual
- `useAuth()` - Autenticação
- `useApp()` - Estado global do app
- `useSound()` - Feedback sonoro
- `usePlan()` - Plano Pro/grátis

---

## Estrutura de Diretórios

```
src/
├── components/
│   ├── Header.jsx
│   ├── BottomNav.jsx
│   ├── SideNav.jsx
│   ├── Toast.jsx
│   └── ...
├── pages/
│   ├── Login.jsx
│   ├── Home.jsx
│   ├── Habits.jsx
│   ├── Finance.jsx
│   ├── Progress.jsx
│   └── ...
├── context/
│   ├── AuthContext.jsx
│   └── AppContext.jsx
├── hooks/
│   ├── useTheme.js
│   ├── useSound.js
│   └── ...
├── services/
│   ├── themes.js
│   └── ...
└── styles/
    └── global.css
```

---

*Última atualização: Abril 2026*
*Versão: 2.0.0*