// ══════════════════════════════════════
// COMPONENTE: CheckBox
//
// Checkbox animado reutilizável para
// marcação de hábitos concluídos.
//
// ACESSIBILIDADE:
//   • Elemento <button> — nativo para teclado
//     (Enter e Space já funcionam por padrão)
//   • role="checkbox" + aria-checked comunicam
//     o estado para leitores de tela
//   • aria-label descreve a ação de forma
//     contextual ("Concluir Meditação" etc.)
//   • aria-disabled substitui disabled para
//     manter o foco visível no estado inativo
//   • SVG com aria-hidden — puramente decorativo
// ══════════════════════════════════════

export function CheckBox({ done, onClick, inactive = false, label = 'hábito' }) {
  // Texto anunciado pelo leitor de tela ao focar o checkbox
  const ariaLabel = inactive
    ? `${label} — não programado para hoje`
    : done
      ? `Desmarcar ${label}`
      : `Concluir ${label}`

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={ariaLabel}
      aria-disabled={inactive || undefined}
      onClick={inactive ? undefined : onClick}
      className={`hcheck ${done ? 'done' : ''} ${inactive ? 'inactive' : ''}`}
    >
      {done && (
        // aria-hidden — o estado já é comunicado por aria-checked
        <svg className="check-svg" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
          <path className="check-path" d="M2.5 7 L5.5 10.5 L11.5 4" />
        </svg>
      )}
    </button>
  )
}
