// ══════════════════════════════════════
// SERVIÇO DE NÍVEIS — Rootio
//
// Determina o nível do usuário com base
// nos io (pontos) acumulados no histórico.
//
// ── Calibração dos limiares ──
// Assumindo ~5 hábitos × 20pts × 70% taxa:
//   ≈ 70 io/dia → 490 io/semana → 2.100 io/mês
//
//   Impulso   →  ponto de partida
//   Rastro    →  ~1 semana   (500 io)
//   Ritmo     →  ~2 meses    (4.000 io)
//   Forma     →  ~7 meses    (15.000 io)
//   Essência  →  ~2 anos     (50.000 io)
//   Raiz      →  ~8 anos     (200.000 io)
//
// Raiz é genuinamente raro — celebra dedicação
// de longo prazo, não quantidade de hábitos.
// ══════════════════════════════════════
import {
  PiLightningBold,
  PiPencilSimpleBold,
  PiArrowCounterClockwiseBold,
  PiFireBold,
  PiTrophyBold,
  PiLeafBold,
} from 'react-icons/pi'

// ── Tabela de níveis (ordem decrescente de limiar) ──
// A busca faz find() do primeiro nível cuja condição min ≤ io,
// portanto os mais altos devem vir primeiro.
const LEVELS = [
  {
    min:    200_000,
    name:   'Raiz',
    color:  '#1b5e20',
    Icon:   PiLeafBold,
    mantra: 'Impossível arrancar.',
  },
  {
    min:    50_000,
    name:   'Essência',
    color:  '#b71c1c',
    Icon:   PiTrophyBold,
    mantra: 'Difícil separar da pessoa.',
  },
  {
    min:    15_000,
    name:   'Forma',
    color:  '#6a1b9a',
    Icon:   PiFireBold,
    mantra: 'Isso é parte de você.',
  },
  {
    min:    4_000,
    name:   'Ritmo',
    color:  '#1565c0',
    Icon:   PiArrowCounterClockwiseBold,
    mantra: 'Previsível. Confiável.',
  },
  {
    min:    500,
    name:   'Rastro',
    color:  '#2e7d32',
    Icon:   PiPencilSimpleBold,
    mantra: 'Você está deixando marca.',
  },
  {
    min:    0,
    name:   'Impulso',
    color:  '#a0522d',
    Icon:   PiLightningBold,
    mantra: 'Algo começou.',
  },
]

// ══════════════════════════════════════
// calcLevel(earnedIo) → LevelResult
//
// Parâmetros:
//   earnedIo — total de io acumulados (número ≥ 0)
//
// Retorno:
//   name     — nome do nível atual
//   color    — cor de destaque do nível
//   Icon     — componente de ícone (react-icons)
//   mantra   — frase motivacional do nível
//   nextName — nome do próximo nível (null se já for Raiz)
//   next     — io necessário para o próximo nível
//   prog     — progresso em % até o próximo nível (0–100)
// ══════════════════════════════════════
export function calcLevel(earnedIo) {
  const io      = earnedIo ?? 0
  const current = LEVELS.find(l => io >= l.min) ?? LEVELS[LEVELS.length - 1]
  const idx     = LEVELS.indexOf(current)

  // Próximo nível está no índice anterior (limiares em ordem decrescente)
  const next = idx > 0 ? LEVELS[idx - 1] : null

  // Progresso: % entre o limiar atual e o próximo.
  // Limitado a 99 para não mostrar "100%" antes de alcançar o próximo nível.
  const prog = next
    ? Math.min(99, Math.round((io - current.min) / (next.min - current.min) * 100))
    : 100

  return {
    name:     current.name,
    color:    current.color,
    Icon:     current.Icon,
    mantra:   current.mantra,
    nextName: next?.name ?? null,
    next:     next?.min  ?? null,
    prog,
  }
}
