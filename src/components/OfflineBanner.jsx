// ══════════════════════════════════════
// COMPONENTE: OfflineBanner
//
// Detecta perda/restauração de conexão
// e exibe um banner temporário.
//
// ACESSIBILIDADE:
//   • Offline → role="alert" + aria-live="assertive"
//     Interrompe o leitor de tela imediatamente —
//     perda de conexão é urgente.
//   • Online  → role="status" + aria-live="polite"
//     Anuncia quando conveniente — é informativo.
//   • Ícones com aria-hidden — o texto já comunica
//     o estado com clareza suficiente.
//
// Estado interno:
//   null       → banner oculto
//   'offline'  → sem conexão
//   'online'   → conexão restaurada (auto-oculta em 2.5s)
// ══════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { PiWifiSlashBold, PiWifiHighBold } from 'react-icons/pi'
import styles from './OfflineBanner.module.css'

export function OfflineBanner() {
  const [estado, setEstado] = useState(
    !navigator.onLine ? 'offline' : null
  )
  const timerOcultar = useRef(null)

  // Exibe o banner por `ms` milissegundos, depois oculta
  function mostrarPor(tipo, ms) {
    clearTimeout(timerOcultar.current)
    setEstado(tipo)
    timerOcultar.current = setTimeout(() => setEstado(null), ms)
  }

  useEffect(() => {
    const aoOffline = () => mostrarPor('offline', 4000)
    const aoOnline  = () => mostrarPor('online',  2500)

    window.addEventListener('offline', aoOffline)
    window.addEventListener('online',  aoOnline)

    // Se já começou sem conexão, exibe imediatamente
    if (!navigator.onLine) mostrarPor('offline', 4000)

    return () => {
      clearTimeout(timerOcultar.current)
      window.removeEventListener('offline', aoOffline)
      window.removeEventListener('online',  aoOnline)
    }
  }, [])

  if (!estado) return null

  const eOffline = estado === 'offline'

  return (
    <div
      className={`${styles.banner} ${eOffline ? '' : styles.online}`}
      role={eOffline ? 'alert' : 'status'}
      aria-live={eOffline ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {eOffline
        ? <><PiWifiSlashBold size={13} aria-hidden="true" /><span>Sem conexão · dados salvos localmente</span></>
        : <><PiWifiHighBold  size={13} aria-hidden="true" /><span>Conexão restabelecida</span></>
      }
    </div>
  )
}
