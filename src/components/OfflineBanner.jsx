// src/components/OfflineBanner.jsx
// ══════════════════════════════════════
// Detecta perda/restauração de conexão.
//
// Comportamento:
//   Offline → banner persiste até reconectar
//   Online  → exibe "Conexão restabelecida" por 2.5s
//
// ACESSIBILIDADE:
//   • Offline → role="alert" + aria-live="assertive"
//   • Online  → role="status" + aria-live="polite"
//   • Ícones com aria-hidden
// ══════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { PiWifiSlashBold, PiWifiHighBold } from 'react-icons/pi'
import styles from './OfflineBanner.module.css'

export function OfflineBanner() {
  const [estado, setEstado] = useState(
    !navigator.onLine ? 'offline' : null
  )
  const timerOcultar = useRef(null)

  useEffect(() => {
    function aoOffline() {
      clearTimeout(timerOcultar.current)
      setEstado('offline')       // persiste até voltar a conexão
    }

    function aoOnline() {
      clearTimeout(timerOcultar.current)
      setEstado('online')
      timerOcultar.current = setTimeout(() => setEstado(null), 2500)
    }

    window.addEventListener('offline', aoOffline)
    window.addEventListener('online',  aoOnline)

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
