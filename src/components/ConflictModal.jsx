// src/components/ConflictModal.jsx
// ══════════════════════════════════════════════════════
// CONFLICT MODAL — Modal para resolver conflitos de sincronização
//
// Quando há conflitos entre dados locais e remotos, este modal
// permite que o usuário escolha qual versão manter.
//
// Estratégia:
//   - Detecta conflitos por tipo de dado (hábitos, histórico, etc.)
//   - Mostra visualmente as diferenças
//   - Permite escolha por tipo ou escolha global
// ══════════════════════════════════════════════════════
import { useState } from 'react'
import styles from './ConflictModal.module.css'

export default function ConflictModal({ conflicts, onResolve, onCancel }) {
  const [resolutions, setResolutions] = useState({})

  // ── Define a resolução para um tipo de dado ──
  const setResolution = (type, value) => {
    setResolutions(prev => ({
      ...prev,
      [type]: value
    }))
  }

  // ── Define a resolução para todos os conflitos ──
  const setAllResolutions = (value) => {
    const allResolutions = {}
    conflicts.forEach(conflict => {
      allResolutions[conflict.type] = value
    })
    setResolutions(allResolutions)
  }

  // ── Verifica se todos os conflitos foram resolvidos ──
  const allResolved = conflicts.every(conflict => resolutions[conflict.type] !== undefined)

  // ── Aplica as resoluções ──
  const handleResolve = () => {
    onResolve(resolutions)
  }

  // ── Formata o timestamp para exibição ──
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Desconhecido'
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ── Obtém o nome amigável do tipo de dado ──
  const getTypeName = (type) => {
    const names = {
      habits: 'Hábitos',
      history: 'Histórico',
      transactions: 'Transações',
      journal: 'Diário',
      career_readings: 'Leituras de Carreira',
      life_projects: 'Projetos de Vida',
      fin_goals: 'Metas Financeiras',
      fin_config: 'Configurações Financeiras',
      fin_emergency: 'Fundo de Emergência'
    }
    return names[type] || type
  }

  // ── Obtém a descrição do conflito ──
  const getConflictDescription = (conflict) => {
    const localCount = Array.isArray(conflict.local) ? conflict.local.length : 0
    const remoteCount = Array.isArray(conflict.remote) ? conflict.remote.length : 0
    
    if (localCount === 0 && remoteCount === 0) {
      return 'Ambos vazios'
    }
    
    if (localCount === 0) {
      return `Local: vazio | Remoto: ${remoteCount} itens`
    }
    
    if (remoteCount === 0) {
      return `Local: ${localCount} itens | Remoto: vazio`
    }
    
    return `Local: ${localCount} itens | Remoto: ${remoteCount} itens`
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Conflitos de Sincronização</h2>
          <p className={styles.subtitle}>
            Encontramos diferenças entre seus dados locais e os dados na nuvem.
            Escolha qual versão manter para cada tipo de dado.
          </p>
        </div>

        <div className={styles.conflictsList}>
          {conflicts.map((conflict, index) => (
            <div key={index} className={styles.conflictItem}>
              <div className={styles.conflictHeader}>
                <h3>{getTypeName(conflict.type)}</h3>
                <span className={styles.conflictDescription}>
                  {getConflictDescription(conflict)}
                </span>
              </div>

              <div className={styles.conflictDetails}>
                <div className={styles.side}>
                  <div className={styles.sideHeader}>
                    <strong>Versão Local</strong>
                    <small className={styles.timestamp}>
                      {formatTimestamp(conflict.localTimestamp)}
                    </small>
                  </div>
                  <div className={styles.sideContent}>
                    {Array.isArray(conflict.local) && conflict.local.length > 0 ? (
                      <ul className={styles.itemList}>
                        {conflict.local.slice(0, 3).map((item, i) => (
                          <li key={i}>{item.name || item.title || item.description || `Item ${i + 1}`}</li>
                        ))}
                        {conflict.local.length > 3 && (
                          <li className={styles.moreItems}>+ {conflict.local.length - 3} itens</li>
                        )}
                      </ul>
                    ) : (
                      <p className={styles.empty}>Nenhum dado</p>
                    )}
                  </div>
                </div>

                <div className={styles.divider}>VS</div>

                <div className={styles.side}>
                  <div className={styles.sideHeader}>
                    <strong>Versão Remota</strong>
                    <small className={styles.timestamp}>
                      {formatTimestamp(conflict.remoteTimestamp)}
                    </small>
                  </div>
                  <div className={styles.sideContent}>
                    {Array.isArray(conflict.remote) && conflict.remote.length > 0 ? (
                      <ul className={styles.itemList}>
                        {conflict.remote.slice(0, 3).map((item, i) => (
                          <li key={i}>{item.name || item.title || item.description || `Item ${i + 1}`}</li>
                        ))}
                        {conflict.remote.length > 3 && (
                          <li className={styles.moreItems}>+ {conflict.remote.length - 3} itens</li>
                        )}
                      </ul>
                    ) : (
                      <p className={styles.empty}>Nenhum dado</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.resolution}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`conflict-${conflict.type}`}
                    value="local"
                    checked={resolutions[conflict.type] === 'local'}
                    onChange={() => setResolution(conflict.type, 'local')}
                  />
                  <span>Manter versão local</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`conflict-${conflict.type}`}
                    value="remote"
                    checked={resolutions[conflict.type] === 'remote'}
                    onChange={() => setResolution(conflict.type, 'remote')}
                  />
                  <span>Manter versão remota</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.quickActions}>
            <button
              type="button"
              className={styles.quickButton}
              onClick={() => setAllResolutions('local')}
            >
              Manter tudo local
            </button>
            <button
              type="button"
              className={styles.quickButton}
              onClick={() => setAllResolutions('remote')}
            >
              Manter tudo remoto
            </button>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.resolveButton}
              onClick={handleResolve}
              disabled={!allResolved}
            >
              Aplicar Resoluções
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
