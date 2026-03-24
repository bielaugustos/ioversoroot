// src/services/syncService.js
// ══════════════════════════════════════
// Sincronização bidirecional: localStorage ↔ Supabase.
//
// Funções exportadas:
//   hasLocalData()           — detecta dados locais
//   migrateLocalToSupabase() — sobe dados locais para a nuvem
//   applyRemoteData()        — aplica dados da nuvem no localStorage
//   clearLocalData()         — limpa localStorage após migração
//   loadFromSupabase()       — carrega todos os dados do Supabase
// ══════════════════════════════════════
import { supabase, upsertRows, fetchRows } from './supabase'
import { loadStorage, saveStorage } from './storage'

// ── Mapeamento de chaves localStorage ──
const LOCAL_KEYS = {
  habits:         'nex_habits',
  history:        'nex_history',
  transactions:   'nex_fin_transactions',
  goals:          'nex_fin_goals',
  emergency:      'nex_fin_emergency',
  finConfig:      'nex_fin_config',
  careerReadings: 'nex_career_readings',
  careerGoals:    'nex_career_goals',
  careerProjects: 'nex_career_projects',
  lifeProjects:   'nex_projects',
  journal:        'nex_journal',
}

// ── Detecção de dados locais ──

export function hasLocalData() {
  return Object.values(LOCAL_KEYS).some(key => {
    const val = localStorage.getItem(key)
    if (!val) return false
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed))        return parsed.length > 0
      if (typeof parsed === 'object')   return Object.keys(parsed).length > 0
      return false
    } catch { return false }
  })
}

// ── Migração localStorage → Supabase ──

export async function migrateLocalToSupabase(userId) {
  const errors = []

  async function upsert(table, rows, options) {
    if (!rows?.length) return
    const { error } = await upsertRows(table, rows, options)
    if (error) errors.push(`${table}: ${error.message}`)
  }

  // Hábitos
  const habits = loadStorage('nex_habits', [])
  await upsert('habits', habits.map(h => ({ ...h, user_id: userId })))

  // Histórico (objeto → array de linhas)
  const history    = loadStorage('nex_history', {})
  const historyRows = Object.entries(history).map(([date, val]) => ({
    user_id: userId, date,
    done: val.done ?? 0, total: val.total ?? 0, habits: val.habits ?? {},
  }))
  await upsert('habit_history', historyRows, { onConflict: 'user_id,date' })

  // Transações financeiras
  const transactions = loadStorage('nex_fin_transactions', [])
  await upsert('transactions', transactions.map(t => ({
    id: t.id, user_id: userId, type: t.type,
    amount: t.amount, description: t.desc,
    category: t.category, date: t.date,
  })))

  // Metas financeiras
  const finGoals = loadStorage('nex_fin_goals', [])
  await upsert('financial_goals', finGoals.map(g => ({ ...g, user_id: userId })))

  // Reserva de emergência
  const emergency = loadStorage('nex_fin_emergency', null)
  if (emergency) {
    await upsert('emergency_fund', [{
      user_id: userId, target: emergency.target ?? 0, current: emergency.current ?? 0,
    }])
  }

  // Carreira
  const readings      = loadStorage('nex_career_readings',  [])
  const careerGoals   = loadStorage('nex_career_goals',     [])
  const careerProjects = loadStorage('nex_career_projects', [])
  await upsert('career_readings',  readings.map(r      => ({ ...r, user_id: userId })))
  await upsert('career_goals',     careerGoals.map(g   => ({ ...g, user_id: userId })))
  await upsert('career_projects',  careerProjects.map(p => ({ ...p, user_id: userId })))

  // Projetos de vida
  const lifeProjects = loadStorage('nex_projects', [])
  await upsert('life_projects', lifeProjects.map(p => ({ ...p, user_id: userId })))

  // Diário
  const journal = loadStorage('nex_journal', [])
  await upsert('journal', journal.map(j => ({ ...j, user_id: userId })))

  return { success: errors.length === 0, errors }
}

// ── Aplicar dados remotos no localStorage ──

export function applyRemoteData(data) {
  if (data.habits?.length)                                      saveStorage('nex_habits',           data.habits)
  if (data.history && Object.keys(data.history).length > 0)    saveStorage('nex_history',          data.history)
  if (data.transactions?.length)                                saveStorage('nex_fin_transactions', data.transactions)
  if (data.financial_goals?.length)                             saveStorage('nex_fin_goals',        data.financial_goals)
  if (data.emergency)                                           saveStorage('nex_fin_emergency',    data.emergency)
  if (data.career_readings?.length)                             saveStorage('nex_career_readings',  data.career_readings)
  if (data.career_goals?.length)                                saveStorage('nex_career_goals',     data.career_goals)
  if (data.career_projects?.length)                             saveStorage('nex_career_projects',  data.career_projects)
  if (data.life_projects?.length)                               saveStorage('nex_projects',         data.life_projects)
  if (data.journal?.length)                                     saveStorage('nex_journal',          data.journal)
}

// ── Limpeza após migração confirmada ──

export function clearLocalData() {
  Object.values(LOCAL_KEYS).forEach(key => localStorage.removeItem(key))
  localStorage.removeItem('nex_last_reset')
  localStorage.removeItem('ior_auth_skipped')
}

// ── Carrega todos os dados do Supabase ──

export async function loadFromSupabase(userId) {
  const results = {}

  const tables = [
    { key: 'habits',          table: 'habits'          },
    { key: 'career_readings', table: 'career_readings' },
    { key: 'career_goals',    table: 'career_goals'    },
    { key: 'career_projects', table: 'career_projects' },
    { key: 'life_projects',   table: 'life_projects'   },
    { key: 'transactions',    table: 'transactions'    },
    { key: 'financial_goals', table: 'financial_goals' },
    { key: 'journal',         table: 'journal'         },
  ]

  for (const { key, table } of tables) {
    const { data } = await fetchRows(table, userId)
    results[key] = data
  }

  // Histórico — array de linhas → objeto indexado por data
  const { data: histRows } = await fetchRows('habit_history', userId)
  results.history = Object.fromEntries(
    (histRows ?? []).map(r => [r.date, { done: r.done, total: r.total, habits: r.habits }])
  )

  // Reserva de emergência — linha única
  const { data: emFund } = await supabase
    .from('emergency_fund')
    .select('*')
    .eq('user_id', userId)
    .single()
  results.emergency = emFund ?? null

  return results
}
