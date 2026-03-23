// ══════════════════════════════════════
// COMPONENTE: Toast
//
// Sistema global de notificações leves.
// Singleton: qualquer parte do app pode
// chamar toast("mensagem") sem props.
//
// ACESSIBILIDADE:
//   • role="status" + aria-live="polite" —
//     o leitor de tela anuncia a mensagem
//     sem interromper o que o usuário está
//     fazendo (polite = aguarda a fala atual)
//   • aria-atomic="true" — anuncia o conteúdo
//     completo, não apenas o diff
//   • aria-relevant="additions text" — só
//     anuncia quando texto é adicionado
//
// Nota: role="alert" seria mais urgente,
// mas toasts são informativos, não críticos.
// ══════════════════════════════════════
import { useEffect, useRef }      from 'react'
import { playNotifyDirect }       from '../hooks/useSound'

// ── Referência singleton para a função de exibição ──
let _show = null

// ── API pública: toast("mensagem") ──
export function toast(msg) {
  playNotifyDirect()
  if (_show) _show(msg)
}

// ══════════════════════════════════════
// COMPONENTE (montado uma única vez em App)
// ══════════════════════════════════════
export function Toast() {
  const ref      = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    // Registra a função de exibição no singleton
    _show = (msg) => {
      if (!ref.current) return
      ref.current.textContent = msg
      ref.current.classList.add('show')

      // Remove automaticamente após 2s
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        ref.current?.classList.remove('show')
      }, 2000)
    }

    return () => { _show = null }
  }, [])

  return (
    <div
      ref={ref}
      className="toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="additions text"
    />
  )
}
