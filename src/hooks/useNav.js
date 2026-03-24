// src/hooks/useNav.js
// ══════════════════════════════════════
// HOOK: useUnlockableItem
// Gerencia visibilidade e animação de itens
// de navegação desbloqueáveis via shop.
//
// Estados de animação:
//   hidden   → oculto (não renderizado)
//   entering → aparecendo (550ms)
//   visible  → estável
//   leaving  → desaparecendo (420ms)
//
// Compartilhado por SideNav e BottomNav.
// ══════════════════════════════════════
import { useState, useEffect, useRef } from 'react'

// ── Helper — lê itens comprados do storage ──
export function getOwned() {
  try {
    return new Set(JSON.parse(localStorage.getItem('nex_shop_owned') || '[]'))
  } catch {
    return new Set()
  }
}

// ── Hook principal ──
export function useUnlockableItem(id) {
  const [visible, setVisible] = useState(() => getOwned().has(id))
  const [animCls, setAnimCls] = useState(() => getOwned().has(id) ? 'visible' : 'hidden')
  const prevRef = useRef(visible)

  useEffect(() => {
    function verificar() {
      const desbloqueado = getOwned().has(id)
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
