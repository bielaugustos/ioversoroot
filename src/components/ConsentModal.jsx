// src/components/ConsentModal.jsx
// ══════════════════════════════════════
// Modal de consentimento LGPD — exibe
// lista clara dos dados que serão enviados
// para a nuvem antes da migração.
// ══════════════════════════════════════
import { PiCheckBold, PiCloudArrowUpBold, PiXBold } from 'react-icons/pi'
import styles from './ConsentModal.module.css'

export function ConsentModal({ onConfirm, onCancel, dataSummary }) {
  // Monta lista de itens com contagens
  const items = [
    { 
      label: 'Hábitos e histórico', 
      count: (dataSummary.habits || 0) + (dataSummary.history || 0),
    },
    { 
      label: 'Dados financeiros', 
      count: (dataSummary.transactions || 0) + (dataSummary.goals || 0),
    },
    { 
      label: 'Entradas do diário', 
      count: dataSummary.journal || 0,
    },
    { 
      label: 'Carreira e projetos', 
      count: (dataSummary.readings || 0) + (dataSummary.projects || 0),
    },
  ].filter(i => i.count > 0)

  // Total de itens
  const total = items.reduce((sum, i) => sum + i.count, 0)

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Ícone principal */}
        <div className={styles.icon}>
          <PiCloudArrowUpBold size={28} />
        </div>
        
        {/* Título */}
        <h2 className={styles.title}>O que será enviado</h2>
        
        {/* Descrição */}
        <p className={styles.desc}>
          Revise os dados que serão transferidos para sua conta na nuvem:
        </p>
        
        {/* Lista de dados */}
        <ul className={styles.list}>
          {items.map(item => (
            <li key={item.label} className={styles.listItem}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemCount}>{item.count}</span>
            </li>
          ))}
        </ul>

        {/* Total */}
        <div className={styles.total}>
          <span>Total de itens</span>
          <span className={styles.totalCount}>{total}</span>
        </div>
        
        {/* Nota LGPD */}
        <p className={styles.note}>
          Seus dados ficam protegidos na sua conta e nunca são compartilhados.
          Você pode apagar tudo a qualquer momento nas configurações.
        </p>
        
        {/* Ações */}
        <div className={styles.actions}>
          <button 
            type="button"
            className={`btn btn-primary ${styles.confirmBtn}`}
            onClick={onConfirm}
          >
            <PiCheckBold size={14} />
            Confirmar migração
          </button>
          <button 
            type="button"
            className={`btn ${styles.cancelBtn}`}
            onClick={onCancel}
          >
            <PiXBold size={14} />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
