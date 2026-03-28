// ══════════════════════════════════════
// SERVIÇO DE ARMAZENAMENTO LOCAL
//
// Wrapper sobre localStorage com:
//   • Serialização / deserialização JSON segura
//   • Fallback silencioso sem quebrar o app
// ══════════════════════════════════════

// ══════════════════════════════════════
// LEITURA
// Retorna o valor parseado ou o fallback
// se a chave não existir ou o JSON for inválido.
// ══════════════════════════════════════
export function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

// ══════════════════════════════════════
// ESCRITA
// Serializa e persiste o valor.
// Em caso de erro, loga aviso sem derrubar a aplicação.
// ══════════════════════════════════════
export function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      console.warn('[Rootio] Storage cheio — dado não salvo:', key)
    } else {
      console.error('[Rootio] Erro ao salvar storage:', key, e)
    }
  }
}

// ══════════════════════════════════════
// REMOÇÃO DE UMA CHAVE
// ══════════════════════════════════════
export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('[Rootio] Erro ao remover storage:', key, e)
  }
}

// ══════════════════════════════════════
// LIMPEZA TOTAL
// Remove todos os dados do app.
// ══════════════════════════════════════
export function clearAllStorage() {
  try {
    localStorage.clear()
  } catch (e) {
    console.error('[Rootio] Erro ao limpar storage:', e)
  }
}

// ══════════════════════════════════════
// DISPONIBILIDADE
// Testa se o localStorage está acessível.
// ══════════════════════════════════════
export function isStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// ══════════════════════════════════════
// FUNÇÕES SÍNCRONAS (para compatibilidade)
// ══════════════════════════════════════
export function loadStorageSync(key, fallback) {
  return loadStorage(key, fallback)
}

export function saveStorageSync(key, value) {
  saveStorage(key, value)
}
