// ══════════════════════════════════════
// SERVIÇO DE ARMAZENAMENTO LOCAL
//
// Wrapper sobre localStorage com:
//   • Serialização / deserialização JSON segura
//   • Tratamento de QuotaExceededError (storage cheio)
//   • Fallback silencioso sem quebrar o app
//   • Limpeza seletiva de chaves com prefixo "nex_"
//
// Todas as chaves do app usam o prefixo "nex_"
// para facilitar limpeza e evitar conflitos.
// ══════════════════════════════════════

// ── Prefixo padrão de todas as chaves ──
const PREFIX = 'nex_'

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
    // JSON inválido ou localStorage indisponível (modo privado bloqueado)
    return fallback
  }
}

// ══════════════════════════════════════
// ESCRITA
// Serializa e persiste o valor.
// Em caso de QuotaExceededError (disco cheio
// ou limite de 5MB do browser atingido),
// loga aviso sem derrubar a aplicação.
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
  } catch {
    // Silencioso — remoção falhar não quebra nada
  }
}

// ══════════════════════════════════════
// LIMPEZA TOTAL
// Remove todas as chaves com prefixo "nex_".
// Usado no reset de dados do Perfil.
// Não toca em chaves de outras aplicações.
// ══════════════════════════════════════
export function clearAllStorage() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
  } catch {
    // Silencioso — falha aqui não deve crashar o app
  }
}

// ══════════════════════════════════════
// DISPONIBILIDADE
// Testa se o localStorage está acessível.
// Em modo privado (Safari) ou ambientes
// restritos, pode lançar DOMException.
// ══════════════════════════════════════
export function isStorageAvailable() {
  try {
    const testKey = `${PREFIX}__test__`
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}
