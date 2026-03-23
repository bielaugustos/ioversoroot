// ══════════════════════════════════════
// COMPONENTE: SplashScreen
//
// Tela de carregamento exibida na primeira
// abertura da sessão (1.35s no total).
// Em reloads da mesma aba é pulada via
// sessionStorage (ver App.jsx).
//
// ACESSIBILIDADE:
//   • role="status" + aria-label comunicam
//     ao leitor de tela que o app está carregando
//   • aria-live="polite" — não interrompe
//   • Pontos animados têm aria-hidden —
//     são puramente visuais/decorativos
//   • prefers-reduced-motion respeitado via CSS
// ══════════════════════════════════════
import { useState, useEffect } from 'react'
import styles from './SplashScreen.module.css'

export function SplashScreen({ onDone }) {
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    // Aos 1000ms inicia a animação de saída
    const t1 = setTimeout(() => setSaindo(true), 1000)
    // Aos 1350ms notifica o pai que o splash terminou
    const t2 = setTimeout(() => onDone(),         1350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`${styles.overlay} ${saindo ? styles.exit : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Carregando Rootio..."
      aria-busy="true"
    >
      {/* Animação visual — oculta para tecnologias assistivas */}
      <div className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
      </div>
    </div>
  )
}
