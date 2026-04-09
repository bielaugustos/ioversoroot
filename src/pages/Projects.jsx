import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlan } from '../hooks/usePlan'
import { PlanLimitModal } from '../components/PlanLimitModal'
import {
  PiRocketLaunchBold, PiTargetBold, PiPlusBold, PiXBold,
  PiCheckBold, PiTrashBold, PiPencilSimpleBold, PiFloppyDiskBold,
  PiCalendarBold, PiCalendarCheckBold, PiCaretDownBold, PiCaretUpBold,
  PiFlagBold, PiArrowUpBold, PiArrowRightBold, PiArrowDownBold,
  PiCircleDashedBold, PiSpinnerBold, PiCheckCircleBold, PiPauseBold,
  PiLockSimpleBold, PiCrownBold, PiQuestionBold, PiArrowLeftBold,
  PiHeartBold, PiGlobeBold, PiPaintBrushBold, PiCurrencyDollarBold, PiBookOpenBold,
  PiListBulletsBold, PiPlayBold, PiClockBold, PiCheckSquareBold,
  PiPushPinBold, PiListDashesBold, PiSquaresFourBold, PiMagnifyingGlassBold,
} from 'react-icons/pi'
import { toast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { upsertRows, fetchRows, deleteRow } from '../services/supabase'
import styles from './Projects.module.css'

// ══════════════════════════════════════
// PILAR 4 — PROJETOS & METAS PESSOAIS
// Objetivos de médio prazo com marcos,
// prazo e progresso visual.
// Dados: nex_projects, nex_personal_goals
// ══════════════════════════════════════

const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } }
const save = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// ── Constantes ──
function todayISO() { return new Date().toISOString().slice(0, 10) }

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day:'numeric', month:'short', year:'numeric' })
}

function deadlineBadge(iso) {
  if (!iso) return null
  const diff = Math.round((new Date(iso + 'T00:00:00') - new Date()) / 86_400_000)
  if (diff < 0)   return { txt: `Venceu há ${Math.abs(diff)}d`, color: '#c0392b' }
  if (diff === 0) return { txt: 'Vence hoje',                    color: '#e67e22' }
  if (diff <= 7)  return { txt: `${diff}d restantes`,           color: '#e67e22' }
  if (diff <= 30) return { txt: `${diff}d restantes`,           color: '#2980b9' }
  return               { txt: `${diff}d restantes`,             color: 'var(--ink3)' }
}

const PRIORITY_OPTS = [
  { id: 'alta',  label: 'Alta',  Icon: PiArrowUpBold,    color: '#e74c3c' },
  { id: 'media', label: 'Média', Icon: PiArrowRightBold, color: '#e67e22' },
  { id: 'baixa', label: 'Baixa', Icon: PiArrowDownBold,  color: '#27ae60' },
]

const STATUS_OPTS = [
  { id: 'planejando', label: 'Planejando',   Icon: PiCircleDashedBold, color: '#95a5a6' },
  { id: 'andamento',  label: 'Em andamento', Icon: PiSpinnerBold,      color: '#2980b9' },
  { id: 'pausado',    label: 'Pausado',      Icon: PiPauseBold,        color: '#e67e22' },
  { id: 'concluido',  label: 'Concluído',    Icon: PiCheckCircleBold,  color: '#27ae60' },
]

const CATEGORIES = ['Pessoal', 'Saúde', 'Finanças', 'Aprendizado', 'Criativo', 'Social', 'Outro']

const FREE_PROJECTS_LIMIT = 3
const PROJ_FREE_ITEMS  = ['Até 3 projetos ativos', 'Marcos com progresso']
const PROJ_PRO_ITEMS   = ['Projetos ilimitados', 'Marcos ilimitados', 'Suporte prioritário']

// ── Helpers UI ──
function PriorityDot({ priority, size = 10 }) {
  const p = PRIORITY_OPTS.find(x => x.id === priority) || PRIORITY_OPTS[1]
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
}

function StatusBadge({ status }) {
  const s = STATUS_OPTS.find(x => x.id === status) || STATUS_OPTS[0]
  return (
    <span className={styles.statusBadge} style={{ color: s.color, borderColor: s.color }}>
      <s.Icon size={10}/> {s.label}
    </span>
  )
}

// ══════════════════════════════════════
// MILESTONE — marco de progresso
// ══════════════════════════════════════
function MilestoneList({ milestones, onChange }) {
  const [newText, setNewText] = useState('')

  function add() {
    const t = newText.trim()
    if (!t) return
    onChange([...(milestones||[]), { id: Date.now(), text: t, done: false, date: todayISO() }])
    setNewText('')
  }

  function toggle(id) {
    onChange(milestones.map(m => m.id === id ? { ...m, done: !m.done } : m))
  }

  function remove(id) {
    onChange(milestones.filter(m => m.id !== id))
  }

  const done  = (milestones||[]).filter(m => m.done).length
  const total = (milestones||[]).length

  return (
    <div className={styles.milestones}>
      {total > 0 && (
        <div className={styles.msHeader}>
          <span className={styles.msLabel}>Marcos de progresso</span>
          <span className={styles.msCount}>{done}/{total}</span>
        </div>
      )}
      <div className={styles.msList}>
        {(milestones||[]).map(m => (
          <div key={m.id} className={`${styles.msRow} ${m.done ? styles.msDone : ''}`}>
            <button type="button" className={`${styles.msCheck} ${m.done ? styles.msCheckDone : ''}`}
              onClick={() => toggle(m.id)}>
              {m.done && <PiCheckBold size={9} color="#fff"/>}
            </button>
            <span className={styles.msText}>{m.text}</span>
            <button type="button" className={styles.msDel} onClick={() => remove(m.id)}>
              <PiXBold size={10}/>
            </button>
          </div>
        ))}
      </div>
      <div className={styles.msAdd}>
        <input className={`input ${styles.msInput}`} placeholder="Adicionar marco..."
          value={newText} onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <button type="button" className={`btn btn-primary ${styles.msAddBtn}`}
          onClick={add} disabled={!newText.trim()}>
          <PiPlusBold size={12}/>
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════
// FORM — NOVO PROJETO / META
// ══════════════════════════════════════
function ProjectForm({ onSave, onClose, initial, preselectedCategory }) {
  const [title,    setTitle]    = useState(initial?.title    || '')
  const [desc,     setDesc]     = useState(initial?.desc     || '')
  const [category, setCategory]  = useState(initial?.category || preselectedCategory || 'Pessoal')
  const [priority, setPriority] = useState(initial?.priority || 'media')
  const [deadline, setDeadline] = useState(initial?.deadline || '')
  const [status,   setStatus]   = useState(initial?.status   || 'planejando')

  function submit() {
    if (!title.trim()) { toast('Informe o título do projeto'); return }
    onSave({
      id:         initial?.id || Date.now(),
      title:      title.trim(),
      desc:       desc.trim(),
      category,
      priority,
      deadline:   deadline || null,
      status,
      milestones: initial?.milestones || [],
      notes:      initial?.notes || '',
      createdAt:  initial?.createdAt || todayISO(),
    })
  }

  return (
    <div className={styles.form}>
      <div className={styles.formHeader}>
        <span className={styles.formTitle}>{initial ? 'Editar projeto' : 'Novo projeto'}</span>
        <button type="button" className={styles.closeBtn} onClick={onClose}><PiXBold size={15}/></button>
      </div>

      <input className="input" placeholder="Título *" value={title} autoFocus
        onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()} />

      <textarea className={`input ${styles.descArea}`} placeholder="Descrição, motivação, contexto..." rows={2}
        value={desc} onChange={e => setDesc(e.target.value)} />

      {/* Categoria */}
      <div className={styles.chipRow}>
        {CATEGORIES.map(c => (
          <button key={c} type="button"
            className={`${styles.chip} ${category===c ? styles.chipSel : ''}`}
            onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Status */}
      <div className={styles.fieldRow}>
        <span className={styles.fieldLbl}>Status</span>
        <div className={styles.chipRow}>
          {STATUS_OPTS.map(s => (
            <button key={s.id} type="button"
              className={`${styles.chip} ${status===s.id ? styles.chipSel : ''}`}
              style={status===s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : { borderColor: s.color, color: s.color }}
              onClick={() => setStatus(s.id)}>
              <s.Icon size={11}/> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prazo */}
      <div className={styles.dateField}>
        <div className={styles.dateIcon}>
          <PiCalendarBold size={16} color="var(--ink3)"/>
        </div>
        <input 
          className={styles.dateInput} 
          type="date" 
          value={deadline} 
          min={todayISO()} 
          onChange={e => setDeadline(e.target.value)} 
        />
        {deadline && (
          <button type="button" className={styles.clearBtn} onClick={() => setDeadline('')}>
            <PiXBold size={11}/>
          </button>
        )}
      </div>

      <button type="button" className="btn btn-primary"
        style={{ justifyContent:'center', width:'100%' }} onClick={submit}>
        <PiFloppyDiskBold size={14}/> {initial ? 'Salvar alterações' : 'Criar projeto'}
      </button>
    </div>
  )
}

// ══════════════════════════════════════
// PROJECT CARD — expansível
// ══════════════════════════════════════
function ProjectCard({ project, onUpdate, onDelete, swipedId, setSwipedId, touchStart, setTouchStart, togglePin }) {
  const [expanded, setExpanded] = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [notes,    setNotes]    = useState(project.notes || '')

  const cardSwiped = swipedId === project.id
  
  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX)
  }
  
  function handleTouchEnd(e) {
    if (!touchStart) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (diff > 50) setSwipedId(project.id)
    else if (diff < -50) setSwipedId(null)
    setTouchStart(null)
  }

  function handleCardClick() {
    if (cardSwiped) {
      setSwipedId(null)
    } else if (expanded) {
      setExpanded(false)
    } else {
      setExpanded(true)
    }
  }

  const ms    = project.milestones || []
  const done  = ms.filter(m => m.done).length
  const total = ms.length
  const pct   = total > 0 ? Math.round(done / total * 100) : 0
  const dl    = deadlineBadge(project.deadline)
  const pri   = PRIORITY_OPTS.find(p => p.id === project.priority) || PRIORITY_OPTS[1]

  function cycleStatus() {
    const idx  = STATUS_OPTS.findIndex(s => s.id === project.status)
    const next = STATUS_OPTS[(idx + 1) % STATUS_OPTS.length]
    onUpdate({ ...project, status: next.id })
    toast(`→ ${next.label}`)
  }

  function saveEdit(updated) {
    onUpdate({ ...project, ...updated, milestones: project.milestones, notes })
    setEditing(false)
    toast('Projeto atualizado!')
  }

  function saveNotes() {
    onUpdate({ ...project, notes })
    toast('Notas salvas!')
  }

  if (editing) {
    return (
      <div className={styles.cardWrap}>
        <ProjectForm initial={project} onSave={saveEdit} onClose={() => setEditing(false)}/>
      </div>
    )
  }

  const isDone = project.status === 'concluido'
  const statusColor = STATUS_OPTS.find(s => s.id === project.status)?.color || '#f0c020'

  return (
    <div 
      className={`${styles.card} ${isDone ? styles.cardDone : ''}`}
      style={{ '--status-color': statusColor }}
    >

      {/* Header clicável */}
      <div className={styles.cardHeader} onClick={() => setExpanded(e => !e)}
        role="button" tabIndex={0} onKeyDown={e => e.key==='Enter' && setExpanded(p=>!p)}>
        <div className={styles.cardLeft}>
          <div className={styles.cardInfo}>
            <span className={styles.cardTitle}>{project.title}</span>
            <div className={styles.cardMeta}>
              <StatusBadge status={project.status}/>
              <span className={styles.catTag}>{project.category}</span>
              {dl && <span className={styles.dlTag} style={{ color:dl.color }}>{dl.txt}</span>}
              {total > 0 && (
                <span className={styles.msTag}>{pct}% · {done}/{total} marcos</span>
              )}
            </div>
          </div>
        </div>
        <PiCaretDownBold size={13} color="var(--ink3)" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
      </div>

      {/* Corpo expandido */}
      {expanded && (
        <div className={styles.cardBody}>
          {project.desc && <p className={styles.cardDesc}>{project.desc}</p>}

          {/* Marcos */}
          <MilestoneList
            milestones={project.milestones}
            onChange={ms => {
              onUpdate({ ...project, milestones: ms })
            }}
          />

          {/* Notas */}
          <div className={styles.notesWrap}>
            <textarea className={`input ${styles.notesArea}`} rows={2}
              placeholder="Notas, links, referências..."
              value={notes} onChange={e => setNotes(e.target.value)}/>
            {notes !== (project.notes || '') && (
              <button type="button" className={`btn btn-primary ${styles.saveNotesBtn}`}
                onClick={saveNotes}>
                <PiFloppyDiskBold size={12}/> Salvar notas
              </button>
            )}
          </div>

          {/* Ações */}
          <div className={styles.cardActions}>
            <button type="button" className={`btn ${styles.actionBtn}`}
              onClick={cycleStatus} title="Avançar status">
              <PiArrowRightBold size={12}/> Avançar status
            </button>
            <button type="button" className={`btn ${styles.actionBtn}`}
              onClick={() => setEditing(true)}>
              <PiPencilSimpleBold size={12}/> Editar
            </button>
            <button type="button" className={styles.deleteBtn}
              onClick={() => { if (window.confirm(`Remover "${project.title}"?`)) onDelete(project.id) }}>
              <PiTrashBold size={12}/>
            </button>
          </div>
        </div>
      )}

      {/* Barra de progresso na base */}
      {total > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill}
            style={{ width: `${pct}%`, background: isDone ? '#27ae60' : 'var(--gold)' }}/>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════
// PAINEL DE RESUMO
// ══════════════════════════════════════
function Summary({ projects }) {
  if (!projects.length) return null

  const active   = projects.filter(p => p.status === 'andamento').length
  const done     = projects.filter(p => p.status === 'concluido').length
  const overdue  = projects.filter(p => {
    if (!p.deadline || p.status === 'concluido') return false
    return new Date(p.deadline + 'T00:00:00') < new Date()
  }).length

  const allMs    = projects.flatMap(p => p.milestones || [])
  const msDone   = allMs.filter(m => m.done).length
  const msTotal  = allMs.length
  const msPct    = msTotal > 0 ? Math.round(msDone / msTotal * 100) : 0

  return (
    <div className="card">
      <div className="card-title"><PiRocketLaunchBold size={15}/> Visão Geral</div>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.sumVal}>{active}</span>
          <span className={styles.sumLbl}>em andamento</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.sumVal}>{done}</span>
          <span className={styles.sumLbl}>concluídos</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.sumVal} style={{ color: overdue > 0 ? '#e74c3c' : 'var(--ink)' }}>
            {overdue}
          </span>
          <span className={styles.sumLbl}>vencidos</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.sumVal}>{msTotal > 0 ? `${msPct}%` : '—'}</span>
          <span className={styles.sumLbl}>marcos feitos</span>
        </div>
      </div>
      {msTotal > 0 && (
        <div className={styles.globalBar}>
          <div className={styles.globalFill} style={{ width:`${msPct}%` }}/>
          <span className={styles.globalLbl}>{msDone}/{msTotal} marcos concluídos</span>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════
// PROJECTS — PÁGINA PRINCIPAL
// ══════════════════════════════════════

export default function Projects() {
  const [projects,     setProjects]     = useState(() => load('nex_projects', []))
  const { isLoggedIn, user } = useAuth()
  const userId = user?.id ?? null

  const [showForm,     setShowForm]     = useState(false)
  const [preselectedCategory, setPreselectedCategory] = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const [limitDecided, setLimitDecided] = useState(() => localStorage.getItem('nex_proj_limit_decided') === 'true')
  const [showHelp,     setShowHelp]     = useState(false)
  const { isPro } = usePlan()
  const navigate  = useNavigate()

  const activeCount = projects.filter(x => x.status === 'andamento' || x.status === 'planejando').length
  const atLimit     = !isPro && activeCount >= FREE_PROJECTS_LIMIT

  useEffect(() => {
    if (!isLoggedIn || !userId) return

    async function loadFromDB() {
      const { data } = await fetchRows('life_projects', userId)
      if (data?.length > 0) {
        setProjects(data)
        save('nex_projects', data)
      }
    }

    loadFromDB()
  }, [isLoggedIn, userId])

  function upd(list) {
    setProjects(list)
    save('nex_projects', list)
    if (isLoggedIn && userId) {
      const rows = list.map(p => ({ ...p, user_id: userId }))
      if (rows.length > 0) {
        upsertRows('life_projects', rows)
          .catch(e => console.warn('[Sync] life_projects:', e))
      }
    }
  }

  function add(p) {
    if (atLimit) { setShowModal(true); return }
    const newProject = { ...p, category: p.category || preselectedCategory || 'Pessoal' }
    upd([newProject, ...projects]); setShowForm(false); setPreselectedCategory(null); toast(`"${p.title}" criado!`)
  }

  function handleOpenForm(category = null) {
    if (atLimit) { setShowModal(true); return }
    if (category) {
      setPreselectedCategory(category)
    } else {
      setPreselectedCategory(null)
    }
    setShowForm(true)
  }

  function handleUpgrade() { setShowModal(false); navigate('/profile') }
  function handleStay()    { localStorage.setItem('nex_proj_limit_decided', 'true'); setLimitDecided(true); setShowModal(false) }
  function update(p) { upd(projects.map(x => x.id === p.id ? p : x)) }
  function del(id) {
    upd(projects.filter(p => p.id !== id))
    if (isLoggedIn && userId) {
      deleteRow('life_projects', id, userId)
        .catch(e => console.warn('[Sync] deleteProject:', e))
    }
    toast('Projeto removido.')
  }

  const shown = useMemo(() => {
    let list = [...projects]
    list.sort((a,b) => b.id - a.id)
    return list
  }, [projects])

  const [pinnedProjects, setPinnedProjects] = useState(() => load('nex_pinned_projects', []))
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const [swipedId, setSwipedId] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showSwipeGuide, setShowSwipeGuide] = useState(() => {
    const seen = localStorage.getItem('nex_swipe_guide_seen')
    return !seen && pinnedProjects.length > 0
  })
  const [viewMode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [displayLimit, setDisplayLimit] = useState(3)
  const [bannerOpen, setBannerOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return shown
    const q = searchQuery.toLowerCase()
    return shown.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q) ||
      p.desc?.toLowerCase().includes(q)
    )
  }, [shown, searchQuery])

  const pinnedProjectsList = useMemo(() => {
    return pinnedProjects.map(id => projects.find(p => p.id === id)).filter(Boolean)
  }, [projects, pinnedProjects])

  function togglePin(id) {
    if (pinnedProjects.includes(id)) {
      const newPinned = pinnedProjects.filter(pid => pid !== id)
      setPinnedProjects(newPinned)
      save('nex_pinned_projects', newPinned)
    } else {
      const newPinned = [...pinnedProjects, id]
      setPinnedProjects(newPinned)
      save('nex_pinned_projects', newPinned)
      if (!localStorage.getItem('nex_swipe_guide_seen')) {
        localStorage.setItem('nex_swipe_guide_seen', 'true')
        setShowSwipeGuide(false)
      }
    }
  }

  return (
    <main className={styles.page}>
      
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerLabel}>PROJETOS & METAS</div>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>O que você quer realizar?</div>
          <div className={styles.headerSub}>Defina objetivos de médio e longo prazo</div>
        </div>
        <button className={styles.headerAction} onClick={() => handleOpenForm()}>
          <PiPlusBold size={14}/> CRIAR
        </button>
      </div>
      
      {/* Banner - always visible */}
      <div className={styles.banner}>
        <div className={styles.bannerHeader} onClick={() => setBannerOpen(!bannerOpen)}>
          <div className={styles.bannerTitle}>
            <PiCrownBold size={16} color="var(--gold)"/>
            <span>Projetos & Metas de Vida</span>
          </div>
          <span className={`${styles.bannerChevron} ${bannerOpen ? styles.bannerChevronOpen : ''}`}>
            <PiCaretDownBold size={16}/>
          </span>
        </div>
        {bannerOpen && (
          <div className={styles.bannerContent}>
          <p className={styles.bannerDesc}>
            Defina objetivos de médio e longo prazo. Diferente de Carreira, aqui é sobre quem você quer se tornar.
          </p>
          <div className={styles.bannerExamples}>
            <button className={styles.bannerTag} onClick={() => handleOpenForm('Saúde')}><PiHeartBold size={14}/> Saúde</button>
            <button className={styles.bannerTag} onClick={() => handleOpenForm('Idioma')}><PiGlobeBold size={14}/> Idioma</button>
            <button className={styles.bannerTag} onClick={() => handleOpenForm('Arte')}><PiPaintBrushBold size={14}/> Arte</button>
            <button className={styles.bannerTag} onClick={() => handleOpenForm('Finanças')}><PiCurrencyDollarBold size={14}/> Finanças</button>
            <button className={styles.bannerTag} onClick={() => handleOpenForm('Aprendizado')}><PiBookOpenBold size={14}/> Aprendizado</button>
          </div>
          <p className={styles.bannerHint2}>Dica: Use marcos para acompanhar seu progresso!</p>
          <div className={styles.helpContent}>
            <div className={styles.helpSteps}>
              {[
                { n: 1, text: 'Crie um projeto com título, prazo e categoria' },
                { n: 2, text: 'Adicione marcos para dividir o objetivo em etapas' },
                { n: 3, text: 'Atualize o status conforme avança (Planejando → Em andamento → Concluído)' },
              ].map(s => (
                <div key={s.n} className={styles.helpStep}>
                  <span className={styles.helpNumber}>{s.n}</span>
                  <span className={styles.helpText}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
      
      {/* Pinned Projects */}
      {projects.length > 0 && pinnedProjectsList.length > 0 && (
        <div className={styles.pinnedSection}>
          <div className={styles.pinnedHeader} onClick={() => setPinnedOpen(!pinnedOpen)}>
            <div className={styles.pinnedTitle}>
              <PiPushPinBold size={14} color="var(--gold)"/>
              Fixados
              <span className={styles.pinnedCount}>{pinnedProjectsList.length}</span>
            </div>
            <span className={`${styles.pinnedChevron} ${pinnedOpen ? styles.pinnedChevronOpen : ''}`}>
              <PiCaretDownBold size={16}/>
            </span>
          </div>
          {pinnedOpen && (
            <div className={styles.pinnedList}>
              {pinnedProjectsList.map(p => (
                <div 
                  key={p.id} 
                  className={`${styles.pinnedItem} ${swipedId === `pinned_${p.id}` ? styles.pinnedItemSwiped : ''}`}
                  onClick={() => swipedId === `pinned_${p.id}` ? setSwipedId(null) : setEditing(p.id)}
                  onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    if (!touchStart) return
                    const diff = e.changedTouches[0].clientX - touchStart
                    if (diff > 50) setSwipedId(`pinned_${p.id}`)
                    else if (diff < -50) setSwipedId(null)
                    setTouchStart(null)
                  }}
                >
                  <div className={styles.pinnedItemLeft}>
                    <span className={styles.pinnedItemTitle}>{p.title}</span>
                  </div>
                  {swipedId === `pinned_${p.id}` && (
                    <div className={styles.pinnedSwipeActions}>
                      <button className={styles.pinnedSwipeAction} onClick={(e) => { e.stopPropagation(); togglePin(p.id); setSwipedId(null) }}>
                        <PiPushPinBold size={18}/>
                      </button>
                      <button className={styles.pinnedSwipeActionDelete} onClick={(e) => { e.stopPropagation(); setSwipedId(null); setConfirmDeleteId(p.id) }}>
                        <PiTrashBold size={18}/>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Swipe Guide Overlay */}
      {showSwipeGuide && (
        <div className={styles.swipeGuideOverlay} onClick={() => { setShowSwipeGuide(false); localStorage.setItem('nex_swipe_guide_seen', 'true') }}>
          <div className={styles.swipeGuide}>
            <div className={styles.swipeGuideArrow}>👉</div>
            <div className={styles.swipeGuideText}>
              <strong>Deslize para a direita</strong> nos projetos para ver ações rápidas!
            </div>
            <div className={styles.swipeGuideHint}>Toque em qualquer lugar para fechar</div>
          </div>
        </div>
      )}

      {/* Lista de projetos */}
      <div className="card" style={{ padding: 0 }}>
        <div className={styles.projectsHeader}>
          <span className={styles.projectsTitle}>
            <PiRocketLaunchBold size={15}/> Meus Projetos
          </span>
        </div>

        {showModal && (
          <PlanLimitModal
            description={`Você atingiu o limite de ${FREE_PROJECTS_LIMIT} projetos ativos do plano gratuito.`}
            freeItems={PROJ_FREE_ITEMS}
            proItems={PROJ_PRO_ITEMS}
            stayFreeLabel={`Continuar com ${FREE_PROJECTS_LIMIT} projetos`}
            onUpgrade={handleUpgrade}
            onClose={handleStay}
          />
        )}

        {/* Campo de busca */}
        <div className={styles.searchField}>
          <PiMagnifyingGlassBold size={16} color="var(--ink3)"/>
          <input 
            type="text" 
            placeholder="Buscar projetos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button type="button" className={styles.searchClear} onClick={() => setSearchQuery('')}>
              <PiXBold size={12}/>
            </button>
          )}
        </div>

        {/* Lista de projetos */}
        {projects.length > 0 && (
          <div className={styles.cardList} style={{ padding: '0 16px 16px' }}>
            {filteredProjects.slice(0, displayLimit).map(p => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                onUpdate={update} 
                onDelete={del}
                swipedId={swipedId}
                setSwipedId={setSwipedId}
                touchStart={touchStart}
                setTouchStart={setTouchStart}
                togglePin={togglePin}
              />
            ))}
            {displayLimit < filteredProjects.length && (
              <button className={styles.showMoreBtn} onClick={() => setDisplayLimit(d => d + 10)}>
                <PiCaretDownBold size={13}/> Mostrar mais ({filteredProjects.length - displayLimit} restantes)
              </button>
            )}
          </div>
        )}

        {/* Quick Start - Grid de opções */}
        {(!showForm || projects.length > 0) && (
          <div className={styles.quickStartGrid}>
            <button className={styles.quickStartCard} onClick={() => handleOpenForm('Saúde')}>
              <div className={styles.quickStartIcon} style={{ color: '#e74c3c' }}>
                <PiHeartBold size={28}/>
              </div>
              <div className={styles.quickStartLabel}>Saúde</div>
              <div className={styles.quickStartDesc}>Exercício, dieta, sono...</div>
            </button>
            <button className={styles.quickStartCard} onClick={() => handleOpenForm('Idioma')}>
              <div className={styles.quickStartIcon} style={{ color: '#3498db' }}>
                <PiGlobeBold size={28}/>
              </div>
              <div className={styles.quickStartLabel}>Idioma</div>
              <div className={styles.quickStartDesc}>Inglês, espanhol, japonês...</div>
            </button>
            <button className={styles.quickStartCard} onClick={() => handleOpenForm('Arte')}>
              <div className={styles.quickStartIcon} style={{ color: '#9b59b6' }}>
                <PiPaintBrushBold size={28}/>
              </div>
              <div className={styles.quickStartLabel}>Arte</div>
              <div className={styles.quickStartDesc}>Pintura, música, redação...</div>
            </button>
            <button className={styles.quickStartCard} onClick={() => handleOpenForm('Finanças')}>
              <div className={styles.quickStartIcon} style={{ color: '#27ae60' }}>
                <PiCurrencyDollarBold size={28}/>
              </div>
              <div className={styles.quickStartLabel}>Finanças</div>
              <div className={styles.quickStartDesc}>Investimento, orçamento...</div>
            </button>
            <button className={`${styles.quickStartCard} ${styles.quickStartCustom}`} onClick={() => handleOpenForm()}>
              <div className={styles.quickStartIcon} style={{ color: 'var(--gold)' }}>
                <PiPlusBold size={28}/>
              </div>
              <div className={styles.quickStartLabel}>Criar Projeto Personalizado</div>
            </button>
          </div>
        )}

        {/* Formulário de criar projeto */}
        {showForm && (
          <ProjectForm onSave={add} onClose={() => { setShowForm(false); setPreselectedCategory(null) }} preselectedCategory={preselectedCategory}/>
        )}
      </div>

    </main>
  )
}
