// ══════════════════════════════════════
// COMPONENTE: BottomNav
//
// Navegação inferior — visível apenas no
// mobile (< 768px via CSS). Em tablet/desktop
// o SideNav substitui este componente.
//
// ACESSIBILIDADE:
//   • <nav aria-label="Navegação principal"> —
//     landmark que leitores de tela listam
//   • aria-current="page" no link ativo —
//     anuncia "página atual" ao navegar
//   • Ícones com aria-hidden — o <span> com
//     o rótulo textual já comunica a destino
//   • newDot (badge "novo") com aria-label —
//     anuncia "Novo" antes de ser lido o nome
//
// ITENS DESBLOQUEÁVEIS:
//   Aparecem com animação ao comprar no shop.
//   O estado é lido do localStorage e sincronizado
//   via evento customizado "nex_shop_changed".
// ══════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  PiHouseBold,          PiHouseFill,
  PiCheckSquareBold,    PiCheckSquareFill,
  PiCurrencyDollarBold, PiCurrencyDollarFill,
  PiUserCircleBold,     PiUserCircleFill,
  PiChartBarBold,       PiChartBarFill,
  PiMedalBold,          PiMedalFill,
  PiBriefcaseBold,
  PiRocketLaunchBold,
  PiRobotBold,
} from 'react-icons/pi'
import styles from './BottomNav.module.css'

// ══════════════════════════════════════
// DEFINIÇÃO DOS ITENS DE NAVEGAÇÃO
// ══════════════════════════════════════

// Itens base — sempre visíveis
const BASE_NAV = [
  { to: '/',        label: 'Início',   Icon: PiHouseBold,          IconA: PiHouseFill          },
  { to: '/habits',  label: 'Hábitos',  Icon: PiCheckSquareBold,    IconA: PiCheckSquareFill    },
  { to: '/finance', label: 'Finanças', Icon: PiCurrencyDollarBold, IconA: PiCurrencyDollarFill },
  { to: '/profile', label: 'Perfil',   Icon: PiUserCircleBold,     IconA: PiUserCircleFill     },
]

// Itens desbloqueáveis — aparecem ao comprar no shop
const UNLOCKABLE = [
  { id: 'util_progress', to: '/progress', label: 'Experiência', Icon: PiChartBarBold,     IconA: PiChartBarFill     },
  { id: 'util_career',   to: '/career',   label: 'Carreira',    Icon: PiBriefcaseBold,    IconA: PiBriefcaseBold    },
  { id: 'util_projects', to: '/projects', label: 'Projetos',    Icon: PiRocketLaunchBold, IconA: PiRocketLaunchBold },
  { id: 'util_mentor',   to: '/mentor',   label: 'Mentor',      Icon: PiRobotBold,        IconA: PiRobotBold        },
]

// ══════════════════════════════════════
// HELPER — lê itens comprados do storage
// ══════════════════════════════════════
function getOwned() {
  try {
    return new Set(JSON.parse(localStorage.getItem('nex_shop_owned') || '[]'))
  } catch {
    return new Set()
  }
}

// ══════════════════════════════════════
// HOOK: useUnlockableItem
//
// Gerencia a visibilidade e classe de
// animação de um item desbloqueável.
//
// Estados de animação:
//   hidden   → oculto (não renderizado)
//   entering → aparecendo (550ms)
//   visible  → estável
//   leaving  → desaparecendo (420ms)
// ══════════════════════════════════════
function useUnlockableItem(id) {
  const [visible, setVisible] = useState(() => getOwned().has(id))
  const [animCls, setAnimCls] = useState(() => getOwned().has(id) ? 'visible' : 'hidden')
  const prevRef = useRef(visible)

  useEffect(() => {
    function verificar() {
      const comprados = getOwned()
      const desbloqueado = comprados.has(id)

      // Ignora se o estado não mudou
      if (desbloqueado === prevRef.current) return
      prevRef.current = desbloqueado

      if (desbloqueado) {
        setVisible(true)
        setAnimCls('entering')
        setTimeout(() => setAnimCls('visible'), 550)
      } else {
        setAnimCls('leaving')
        setTimeout(() => { setAnimCls('hidden'); setVisible(false) }, 420)
      }
    }

    window.addEventListener('nex_shop_changed', verificar)
    window.addEventListener('storage', e => {
      if (e.key === 'nex_shop_owned') verificar()
    })

    return () => window.removeEventListener('nex_shop_changed', verificar)
  }, [id])

  return { visible, animCls }
}

// ══════════════════════════════════════
// SUBCOMPONENTE: UnlockableNavBtn
// Item desbloqueável com animação de entrada
// ══════════════════════════════════════
function UnlockableNavBtn({ item }) {
  const { visible, animCls } = useUnlockableItem(item.id)
  const { pathname } = useLocation()

  // Não renderiza nada enquanto o item está oculto
  if (!visible && animCls === 'hidden') return null

  const isActive = pathname.startsWith(item.to)
  const cls = [
    styles.btn,
    isActive                ? styles.active      : '',
    animCls === 'entering'  ? styles.unlockEnter  : '',
    animCls === 'leaving'   ? styles.unlockLeave  : '',
    animCls === 'visible'   ? styles.unlockVisible : '',
  ].filter(Boolean).join(' ')

  return (
    <NavLink
      to={item.to}
      className={cls}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Ícone decorativo — rótulo textual abaixo é suficiente */}
      <span aria-hidden="true">
        {isActive ? <item.IconA size={21} /> : <item.Icon size={21} />}
      </span>
      <span>{item.label}</span>

      {/* Badge "Novo" — anunciado por leitores de tela */}
      {animCls === 'entering' && (
        <span className={styles.newDot} aria-label="Novo" />
      )}
    </NavLink>
  )
}

// ══════════════════════════════════════
// SUBCOMPONENTE: BottomNavBtn
// Botão de navegação base (sem animação)
// ══════════════════════════════════════
function BottomNavBtn({ to, label, Icon, IconA }) {
  const { pathname } = useLocation()
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      className={`${styles.btn} ${isActive ? styles.active : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Ícone decorativo — rótulo textual abaixo é suficiente */}
      <span aria-hidden="true">
        {isActive ? <IconA size={21} /> : <Icon size={21} />}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}

// ══════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════
export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {/* Itens base (Início, Hábitos, Finanças) */}
      {BASE_NAV.slice(0, 3).map(item => (
        <BottomNavBtn key={item.to} {...item} />
      ))}

      {/* Itens desbloqueáveis — inseridos entre Finanças e Perfil */}
      {UNLOCKABLE.map(item => (
        <UnlockableNavBtn key={item.id} item={item} />
      ))}

      {/* Perfil — sempre o último item */}
      <BottomNavBtn {...BASE_NAV[3]} />
    </nav>
  )
}
