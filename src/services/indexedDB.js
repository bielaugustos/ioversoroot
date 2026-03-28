// src/services/indexedDB.js
// ══════════════════════════════════════
// IndexedDB — Armazenamento local por usuário
//
// Permite múltiplos usuários no mesmo dispositivo:
//   • Cada usuário tem seus dados separados
//   • Modo offline usa userId = 'offline'
//   • Modo online usa userId = user.id do Supabase
//
// Funções exportadas:
//   - initDB()              — Inicializa o banco de dados
//   - loadFromDB(key, userId) — Carrega dados de um usuário
//   - saveToDB(key, data, userId) — Salva dados de um usuário
//   - deleteFromDB(key, userId) — Deleta dados de um usuário
//   - migrateFromLocalStorage(userId) — Migra dados do localStorage
//   - clearUserData(userId) — Limpa todos os dados de um usuário
//   - getAllUserIds() — Lista todos os userIds no banco
// ══════════════════════════════════════

const DB_NAME = 'ioversoroot_db'
const DB_VERSION = 1

// ── Chaves do banco de dados ──
const STORES = {
  habits: 'habits',
  history: 'history',
  transactions: 'transactions',
  goals: 'goals',
  emergency: 'emergency',
  finConfig: 'finConfig',
  careerReadings: 'careerReadings',
  careerGoals: 'careerGoals',
  careerProjects: 'careerProjects',
  lifeProjects: 'lifeProjects',
  journal: 'journal',
  lastReset: 'lastReset',
  sound: 'sound',
  theme: 'theme',
  plan: 'plan',
}

// ── Cache de conexão ──
let db = null

  // ── Inicializa o banco de dados ──
  export async function initDB() {
    if (db) return db
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        db = request.result
        
        // Verifica se todas as stores existem antes de tentar acessá-las
        const missingStores = Object.values(STORES).filter(storeName => 
          !db.objectStoreNames.contains(storeName)
        )
        
        if (missingStores.length > 0) {
          console.warn('[IndexedDB] Stores faltando:', missingStores)
          // Tenta criar as stores faltantes
          missingStores.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              try {
                const store = db.createObjectStore(storeName, { keyPath: ['userId', 'key'] })
                store.createIndex('userId', 'userId', { unique: false })
                store.createIndex('key', 'key', { unique: false })
              } catch (error) {
                console.error('[IndexedDB] Erro ao criar store:', storeName, error)
              }
            }
          })
        }
        
        resolve(db)
      }
      
      request.onupgradeneeded = (event) => {
        const database = event.target.result
        
        // Cria object stores para cada tipo de dado
        Object.values(STORES).forEach(storeName => {
          if (!database.objectStoreNames.contains(storeName)) {
            // Cada store tem userId como keyPath e key como índice
            const store = database.createObjectStore(storeName, { keyPath: ['userId', 'key'] })
            store.createIndex('userId', 'userId', { unique: false })
            store.createIndex('key', 'key', { unique: false })
          }
        })
      }
    })
  }

// ── Carrega dados do banco de dados ──
export async function loadFromDB(key, userId = 'offline') {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([key], 'readonly')
    const store = transaction.objectStore(key)
    const request = store.get([userId, key])

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.data : null)
    }
  })
}

// ── Salva dados no banco de dados ──
export async function saveToDB(key, data, userId = 'offline') {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([key], 'readwrite')
    const store = transaction.objectStore(key)
    const request = store.put({ userId, key, data })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// ── Deleta dados do banco de dados ──
export async function deleteFromDB(key, userId = 'offline') {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([key], 'readwrite')
    const store = transaction.objectStore(key)
    const request = store.delete([userId, key])

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// ── Limpa todos os dados de um usuário ──
export async function clearUserData(userId) {
  if (!db) await initDB()

  const promises = Object.values(STORES).map(storeName => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const index = store.index('userId')
      const request = index.openCursor(IDBKeyRange.only(userId))

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  })

  await Promise.all(promises)
}

// ── Lista todos os userIds no banco de dados ──
export async function getAllUserIds() {
  if (!db) await initDB()

  const userIds = new Set()

  for (const storeName of Object.values(STORES)) {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index('userId')
      const request = index.openKeyCursor()

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          userIds.add(cursor.primaryKey[0])
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  return Array.from(userIds)
}

// ── Migra dados do localStorage para IndexedDB ──
export async function migrateFromLocalStorage(userId) {
  const migrated = {}

  // Mapeamento de chaves localStorage para stores
  const keyMapping = {
    'nex_habits': 'habits',
    'nex_history': 'history',
    'nex_fin_transactions': 'transactions',
    'nex_fin_goals': 'goals',
    'nex_fin_emergency': 'emergency',
    'nex_fin_config': 'finConfig',
    'nex_career_readings': 'careerReadings',
    'nex_career_goals': 'careerGoals',
    'nex_career_projects': 'careerProjects',
    'nex_projects': 'lifeProjects',
    'nex_journal': 'journal',
    'nex_last_reset': 'lastReset',
    'nex_sound': 'sound',
    'nex_theme': 'theme',
    'nex_plan': 'plan',
  }

  for (const [localStorageKey, storeName] of Object.entries(keyMapping)) {
    const value = localStorage.getItem(localStorageKey)
    if (value) {
      try {
        const data = JSON.parse(value)
        await saveToDB(storeName, data, userId)
        migrated[storeName] = true
      } catch (error) {
        console.error(`[IndexedDB] Erro ao migrar ${localStorageKey}:`, error)
      }
    }
  }

  return migrated
}

// ── Verifica se há dados no localStorage ──
export function hasLocalStorageData() {
  const keys = [
    'nex_habits', 'nex_history', 'nex_fin_transactions', 'nex_fin_goals',
    'nex_fin_emergency', 'nex_fin_config', 'nex_career_readings',
    'nex_career_goals', 'nex_career_projects', 'nex_projects', 'nex_journal',
  ]

  return keys.some(key => {
    const value = localStorage.getItem(key)
    if (!value) return false
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.length > 0
      if (typeof parsed === 'object') return Object.keys(parsed).length > 0
      return false
    } catch {
      return false
    }
  })
}

// ── Limpa dados do localStorage após migração ──
export function clearLocalStorage() {
  const keys = [
    'nex_habits', 'nex_history', 'nex_fin_transactions', 'nex_fin_goals',
    'nex_fin_emergency', 'nex_fin_config', 'nex_career_readings',
    'nex_career_goals', 'nex_career_projects', 'nex_projects', 'nex_journal',
    'nex_last_reset', 'nex_sound', 'nex_theme', 'nex_plan', 'ior_auth_skipped',
  ]

  keys.forEach(key => localStorage.removeItem(key))
}

// ── Carrega dados com valor padrão ──
export async function loadFromDBWithDefault(key, defaultValue, userId = 'offline') {
  const data = await loadFromDB(key, userId)
  return data !== null ? data : defaultValue
}

// ── Salva múltiplos dados de uma vez ──
export async function saveMultipleToDB(dataMap, userId = 'offline') {
  const promises = Object.entries(dataMap).map(([key, data]) => {
    return saveToDB(key, data, userId)
  })

  await Promise.all(promises)
}

// ── Carrega múltiplos dados de uma vez ──
export async function loadMultipleFromDB(keys, userId = 'offline') {
  const promises = keys.map(key => loadFromDB(key, userId))
  const results = await Promise.all(promises)

  const dataMap = {}
  keys.forEach((key, index) => {
    dataMap[key] = results[index]
  })

  return dataMap
}
