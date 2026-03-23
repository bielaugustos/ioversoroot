// ══════════════════════════════════════
// APP — raiz da aplicação
//
// Responsabilidades:
//   • SplashScreen (pula em reloads via sessionStorage)
//   • Roteamento com React Router v6
//   • Layout responsivo: SideNav (tablet+) / BottomNav (mobile)
//   • Lazy loading de todas as páginas (code splitting)
//   • ErrorBoundary global para evitar crash silencioso
//   • SoundSync: mantém flag global de áudio em sincronia com o contexto
// ══════════════════════════════════════
import { useState, useEffect, Suspense, lazy, Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppProvider }     from './context/AppContext'
import { useApp }          from './context/AppContext'
import { Header }          from './components/Header'
import { BottomNav }       from './components/BottomNav'
import { SideNav }         from './components/SideNav'
import { Toast }           from './components/Toast'
import { SplashScreen }    from './components/SplashScreen'
import { OfflineBanner }   from './components/OfflineBanner'
import { setSoundEnabled } from './hooks/useSound'
import './styles/global.css'

// ══════════════════════════════════════
// LAZY LOADING DAS PÁGINAS
// Cada página é um chunk separado no build.
// O navegador só carrega quando o usuário
// navega até aquela rota pela primeira vez.
// ══════════════════════════════════════
const Home     = lazy(() => import('./pages/Home'))
const Habits   = lazy(() => import('./pages/Habits'))
const Finance  = lazy(() => import('./pages/Finance'))
const Progress = lazy(() => import('./pages/Progress'))
const Mentor   = lazy(() => import('./pages/Mentor'))
const Profile  = lazy(() => import('./pages/Profile'))
const Career   = lazy(() => import('./pages/Career'))
const Projects = lazy(() => import('./pages/Projects'))

// ══════════════════════════════════════
// ERROR BOUNDARY GLOBAL
// Captura erros de renderização em qualquer
// filho e exibe uma tela de recuperação em
// vez de deixar o app em branco.
// Usa class component pois hooks não cobrem
// o ciclo componentDidCatch.
// ══════════════════════════════════════
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    // Em produção, este seria o ponto de integração com Sentry/LogRocket
    console.error('[Rootio] Erro não tratado:', erro, info.componentStack)
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div
        role="alert"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', padding: '24px',
          fontFamily: 'system-ui, sans-serif', textAlign: 'center',
          gap: '16px',
        }}
      >
        <p style={{ fontSize: '2rem' }}>⚠️</p>
        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Algo deu errado</p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          {this.state.erro?.message || 'Erro desconhecido'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '8px', padding: '10px 24px',
            background: '#f0c020', border: '2px solid #b08000',
            borderRadius: '4px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Recarregar
        </button>
      </div>
    )
  }
}

// ══════════════════════════════════════
// FALLBACK DE SUSPENSE
// Exibido enquanto o chunk da página carrega.
// Aria-busy informa leitores de tela que
// o conteúdo está sendo carregado.
// ══════════════════════════════════════
function PageLoader() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando página..."
      style={{ padding: '40px', textAlign: 'center', color: 'var(--ink3)' }}
    />
  )
}

// ══════════════════════════════════════
// SOUND SYNC
// Mantém a flag global _soundEnabled do
// useSound em sincronia com o contexto.
// Sem isso, funções diretas (playXDirect)
// ignorariam a preferência do usuário.
// ══════════════════════════════════════
function SoundSync() {
  const { soundOn } = useApp()
  useEffect(() => { setSoundEnabled(soundOn) }, [soundOn])
  return null
}

// ══════════════════════════════════════
// PROFILE WRAPPER
// Profile usa useNavigate internamente;
// esse wrapper o provê o contexto de router.
// ══════════════════════════════════════
function ProfileWrapper() {
  const navigate = useNavigate()
  return <Profile onNavigate={path => navigate(path)} />
}

// ══════════════════════════════════════
// LAYOUT PRINCIPAL
//
// Mobile  (< 768px):  Header + conteúdo + BottomNav
// Tablet+ (≥ 768px):  SideNav | Header + conteúdo
//
// O link "Pular para conteúdo" é o primeiro
// elemento focável — padrão WCAG 2.1 §2.4.1.
// Permite que usuários de teclado ignorem a nav.
// ══════════════════════════════════════
function Layout() {
  return (
    <div className="nex-app">
      {/* Sincroniza preferência de som com funções globais */}
      <SoundSync />

      {/* Notificações de toast — aria-live no próprio componente */}
      <Toast />

      {/* Sidebar — visível apenas em tablet/desktop (≥ 768px via CSS) */}
      <SideNav />

      {/* Coluna principal de conteúdo */}
      <div className="nex-content">
        <Header />
        <OfflineBanner />

        {/*
          id="main-content" — alvo do link "Pular para o conteúdo".
          role="main" é redundante com <main> mas explícito para
          compatibilidade com leitores de tela mais antigos.
        */}
        <main id="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"         element={<Home     />} />
              <Route path="/habits"   element={<Habits   />} />
              <Route path="/finance"  element={<Finance  />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/mentor"   element={<Mentor   />} />
              <Route path="/career"   element={<Career   />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/profile"  element={<ProfileWrapper />} />

              {/* Qualquer rota desconhecida volta para o início */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* BottomNav — visível apenas no mobile (< 768px via CSS) */}
      <BottomNav />
    </div>
  )
}

// ══════════════════════════════════════
// COMPONENTE RAIZ
// ══════════════════════════════════════
export default function App() {
  // Pula o SplashScreen em recarregamentos da mesma sessão.
  // sessionStorage sobrevive a reloads mas é limpo ao fechar a aba,
  // garantindo que o splash apareça em novas sessões.
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('nex_splash') === '1'
  )

  function handleSplashDone() {
    sessionStorage.setItem('nex_splash', '1')
    setSplashDone(true)
  }

  return (
    <ErrorBoundary>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}

      {/*
        Flags futuras do React Router v7 — silenciam avisos de migração
        sem alterar comportamento atual da aplicação.
      */}
      <BrowserRouter
        future={{
          v7_startTransition:   true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppProvider>
          <Layout />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
