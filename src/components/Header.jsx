// ══════════════════════════════════════
// COMPONENTE: Header
//
// Barra superior fixa — visível apenas
// no mobile (< 768px). Em tablet/desktop
// o SideNav assume essa função.
//
// ACESSIBILIDADE:
//   • <header> tem role="banner" implícito —
//     leitores de tela announces como região
//   • Logo com aria-label descreve o app
//   • Streak com aria-label numérico explícito
//     ("Sequência de 12 dias") — melhor que
//     apenas "12d" que é ambíguo em voz
//   • PiFlameFill com aria-hidden — decorativo
// ══════════════════════════════════════
import { useState, useCallback } from 'react'
import { PiFlameFill } from 'react-icons/pi'
import { useApp }      from '../context/AppContext'
import { useStats }    from '../hooks/useStats'
import styles          from './Header.module.css'

const RAINBOW_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  '#E74C3C', '#F39C12', '#1ABC9C', '#3498DB', '#9B59B6', '#E91E63'
]

const STAR_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z"/>
  </svg>
)

const MENU_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,72H96a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm72,48H40a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"/>
  </svg>
)

export function Header() {
  const { history } = useApp()
  const { streak }  = useStats(history)
  const [menuClickCount, setMenuClickCount] = useState(0)
  const [isStarMode, setIsStarMode] = useState(false)
  const [rainbowIndex, setRainbowIndex] = useState(0)

  const handleLogoClick = useCallback(() => {
    if (isStarMode) {
      const newIndex = (rainbowIndex + 1) % RAINBOW_COLORS.length
      setRainbowIndex(newIndex)
      
      if (Math.random() < 0.1) {
        setIsStarMode(false)
        setMenuClickCount(0)
        setRainbowIndex(0)
      }
    } else {
      const newCount = menuClickCount + 1
      setMenuClickCount(newCount)
      
      if (newCount >= 5) {
        setIsStarMode(true)
      }
    }
  }, [menuClickCount, isStarMode, rainbowIndex])

  return (
    <header className={styles.header}>
      {/* Logo — aria-label nomeia o app para leitores de tela */}
      <span 
        className={styles.logo} 
        aria-label={isStarMode ? "Estrela" : "Menu"}
        onClick={handleLogoClick}
        style={isStarMode ? { color: RAINBOW_COLORS[rainbowIndex], transition: 'color 0.3s ease' } : undefined}
      >
        {isStarMode ? STAR_ICON : MENU_ICON}
      </span>

      {streak > 0 && (
        <div
          className={styles.streakPill}
          aria-label={`Sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'}`}
          title={`${streak} dias consecutivos`}
        >
          <PiFlameFill size={11} color="var(--gold-dk)" aria-hidden="true" />
          <span aria-hidden="true">{streak}d</span>
        </div>
      )}
    </header>
  )
}

