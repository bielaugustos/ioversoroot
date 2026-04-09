import { useState, useMemo, useEffect } from 'react'
import {
  PiBriefcaseBold, PiBookOpenTextBold, PiTargetBold,
  PiPlusBold, PiXBold, PiCheckBold, PiTrashBold,
  PiPencilSimpleBold, PiFloppyDiskBold, PiCalendarBold,
  PiStarBold, PiArrowRightBold,
  PiCheckCircleBold, PiClockBold, PiLinkBold,
  PiCaretDownBold, PiCaretUpBold, PiLockSimpleBold, PiCrownBold,
  PiQuestionBold, PiCheckSquareBold,
  PiGraduationCapBold, PiBrainBold, PiWrenchBold,
} from 'react-icons/pi'
import styles from './Career.module.css'

const ONBOARDING_KEY = 'nex_career_onboarding'

const ONBOARDING_DEFAULT = {
  momento: null,
  area: null,
  cargo: null,
  objetivo: null,
  cvSections: {
    exp: null,
    edu: null,
    extra: null,
  },
  extraGoals: [],
  completude: 0,
}

const MOMENTOS = [
  { id: 'primeiro-emprego', label: 'Estou buscando meu primeiro emprego' },
  { id: 'mudar-area',       label: 'Quero mudar de área' },
  { id: 'crescer',          label: 'Já trabalho e quero crescer' },
  { id: 'freelance',        label: 'Quero trabalhar por conta própria' },
  { id: 'nao-sei',          label: 'Ainda não sei ao certo' },
]

const MSGS_AREA = {
  'primeiro-emprego': 'Entendido! Vamos construir seu primeiro currículo do zero. Em qual área você quer trabalhar?',
  'mudar-area':       'Ótimo momento para uma virada! Qual área te atrai agora?',
  'crescer':          'Perfeito. Em qual área você já atua ou quer crescer?',
  'freelance':        'Trabalhar por conta própria exige foco. Qual é a sua área de atuação?',
  'nao-sei':          'Sem problema — isso é mais comum do que parece! Qual área te despertou mais curiosidade?',
}

const AREAS = [
  'Tecnologia', 'Saúde', 'Educação', 'Comunicação',
  'Negócios', 'Direito', 'Arte & Design',
  'Engenharia', 'Ciências', 'Outro'
]

const CARGOS_POR_AREA = {
  'Tecnologia':   ['Desenvolvedor', 'Designer UX', 'Analista de Dados', 'QA', 'Product Manager'],
  'Saúde':        ['Enfermeiro', 'Técnico em Saúde', 'Psicólogo', 'Nutricionista', 'Fisioterapeuta'],
  'Educação':     ['Professor', 'Pedagogo', 'Instrutor', 'Tutor', 'Coordenador'],
  'Comunicação':  ['Jornalista', 'Redator', 'Social Media', 'Relações Públicas', 'Publicitário'],
  'Negócios':     ['Analista', 'Consultor', 'Gestor de Projetos', 'Empreendedor', 'Vendedor'],
  'Direito':      ['Advogado', 'Assistente Jurídico', 'Paralegal', 'Analista Jurídico', 'Consultor'],
  'Arte & Design':['Designer Gráfico', 'Ilustrador', 'Motion Designer', 'Art Director', 'Fotógrafo'],
  'Engenharia':   ['Engenheiro Civil', 'Eng. de Software', 'Eng. Mecânico', 'Técnico', 'Projetista'],
  'Ciências':     ['Pesquisador', 'Analista', 'Biólogo', 'Químico', 'Estatístico'],
  'Outro':        ['Profissional Autônomo', 'Assistente', 'Analista', 'Coordenador', 'Consultor'],
}

const DICAS = {
  'primeiro-emprego': 'Para o primeiro emprego, honestidade e entusiasmo valem mais que experiência. Projetos pessoais e cursos contam muito.',
  'mudar-area':       'Destaque habilidades transferíveis — o que você aprendeu numa área pode ser valioso em outra.',
  'crescer':          'Quantifique suas conquistas sempre que possível. Números são mais impactantes que descrições.',
  'freelance':        'Seu portfólio é mais importante que o currículo. Adicione projetos reais na seção Diferenciais.',
  'nao-sei':          'Comece preenchendo o que você tem. O agente vai ajudar a identificar seus pontos fortes.',
}

const EXTRA_GOALS = ['Certificação', 'Idioma', 'Portfólio', 'Networking', 'Liderança', 'Empreender']

function gerarObjetivo(momento, cargo, area) {
  const templates = {
    'primeiro-emprego': `Profissional em início de carreira na área de ${area}, buscando oportunidade como ${cargo} para aplicar meu potencial, aprender na prática e contribuir com resultados reais desde o primeiro dia.`,
    'mudar-area':       `Profissional em transição de carreira com interesse em atuar como ${cargo} na área de ${area}, trazendo visão multidisciplinar e comprometimento com aprendizado contínuo.`,
    'crescer':          `Profissional com experiência em ${area}, buscando crescimento como ${cargo} em um ambiente que valorize desenvolvimento técnico, autonomia e impacto.`,
    'freelance':        `Profissional independente especializado em ${area}, oferecendo serviços como ${cargo} com foco em qualidade, pontualidade e resultados alinhados às necessidades do cliente.`,
    'nao-sei':          `Profissional em fase de descoberta, explorando oportunidades em ${area} com abertura para aprender, adaptar e contribuir como ${cargo}.`,
  }
  return templates[momento] || templates['nao-sei']
}

function loadOnboarding() {
  try {
    const r = localStorage.getItem(ONBOARDING_KEY)
    return r ? JSON.parse(r) : ONBOARDING_DEFAULT
  } catch {
    return ONBOARDING_DEFAULT
  }
}

function saveOnboarding(v) {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(v))
  } catch {}
}

function calcCompletude(onboarding) {
  let pts = 0
  if (onboarding.objetivo) pts += 20
  if (onboarding.cvSections?.exp) pts += 25
  if (onboarding.cvSections?.edu) pts += 25
  if (onboarding.cvSections?.extra) pts += 15
  if (onboarding.extraGoals?.length > 0) pts += 15
  return pts
}

function AgentTab() {
  const [onboarding, setOnboarding] = useState(loadOnboarding)
  const [etapa, setEtapa] = useState(() => {
    if (onboarding.cargo) return 3
    if (onboarding.area) return 2
    if (onboarding.momento) return 1
    return 0
  })
  const [cargoInput, setCargoInput] = useState('')
  const [expandedSections, setExpandedSections] = useState({})
  const [editandoObjetivo, setEditandoObjetivo] = useState(false)
  const [objetivoTemp, setObjetivoTemp] = useState('')

  useEffect(() => {
    const newCompletude = calcCompletude(onboarding)
    if (newCompletude !== onboarding.completude) {
      const updated = { ...onboarding, completude: newCompletude }
      setOnboarding(updated)
      saveOnboarding(updated)
    }
  }, [onboarding.objetivo, onboarding.cvSections, onboarding.extraGoals])

  function selectMomento(momento) {
    const updated = { ...onboarding, momento }
    setOnboarding(updated)
    saveOnboarding(updated)
    setEtapa(1)
  }

  function selectArea(area) {
    const updated = { ...onboarding, area }
    setOnboarding(updated)
    saveOnboarding(updated)
    setEtapa(2)
  }

  function confirmCargo(cargo) {
    const objetivo = gerarObjetivo(onboarding.momento, cargo, onboarding.area)
    const updated = { ...onboarding, cargo, objetivo }
    setOnboarding(updated)
    saveOnboarding(updated)
    setEtapa(3)
  }

  function restart() {
    setOnboarding(ONBOARDING_DEFAULT)
    saveOnboarding(ONBOARDING_DEFAULT)
    setEtapa(0)
    setCargoInput('')
  }

  function saveCvSection(key, value) {
    const updated = {
      ...onboarding,
      cvSections: { ...onboarding.cvSections, [key]: value },
    }
    setOnboarding(updated)
    saveOnboarding(updated)
    setExpandedSections(prev => ({ ...prev, [key]: false }))
  }

  function toggleSection(key) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleExtraGoal(goal) {
    const goals = onboarding.extraGoals.includes(goal)
      ? onboarding.extraGoals.filter(g => g !== goal)
      : [...onboarding.extraGoals, goal]
    const updated = { ...onboarding, extraGoals: goals }
    setOnboarding(updated)
    saveOnboarding(updated)
  }

  function saveObjetivo() {
    const updated = { ...onboarding, objetivo: objetivoTemp }
    setOnboarding(updated)
    saveOnboarding(updated)
    setEditandoObjetivo(false)
  }

  const cargossuggest = CARGOS_POR_AREA[onboarding.area] || []

  return (
    <div className={styles.agentTab}>
      {etapa === 0 && (
        <div className={styles.heroCard}>
          <div className={styles.heroLabel}>Agente de carreira</div>
          <div className={styles.heroTitle}>Vamos construir sua carreira juntos</div>
          <div className={styles.heroSub}>Do primeiro currículo à visão de longo prazo.</div>
        </div>
      )}

      {(etapa === 0 || etapa === 1) && (
        <div className={styles.agentBubble}>
         Olá! Antes de começar, me diz: qual é o seu momento profissional agora?
        </div>
      )}

      {(etapa === 0 || etapa === 1) && (
        <div className={styles.pillsRow}>
          {MOMENTOS.map(m => (
            <button
              key={m.id}
              type="button"
              className={`${styles.pill} ${onboarding.momento === m.id ? styles.pillActive : ''}`}
              onClick={() => selectMomento(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {(etapa === 1 || etapa === 2) && onboarding.momento && (
        <div className={styles.agentBubble}>
          {MSGS_AREA[onboarding.momento]}
        </div>
      )}

      {(etapa === 1 || etapa === 2) && onboarding.momento && (
        <div className={styles.pillsRow}>
          {AREAS.map(a => (
            <button
              key={a}
              type="button"
              className={`${styles.pill} ${onboarding.area === a ? styles.pillActive : ''}`}
              onClick={() => selectArea(a)}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {(etapa === 2 || etapa === 3) && onboarding.area && (
        <div className={styles.agentBubble}>
          Boa escolha! Na área de {onboarding.area}, qual cargo ou função você quer exercer?
        </div>
      )}

      {(etapa === 2 || etapa === 3) && onboarding.area && (
        <div className={styles.cargoInput}>
          <input
            type="text"
            className="input"
            placeholder="Digite o cargo..."
            value={cargoInput}
            onChange={e => setCargoInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cargoInput.trim() && confirmCargo(cargoInput.trim())}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!cargoInput.trim()}
            onClick={() => confirmCargo(cargoInput.trim())}
          >
            <PiCheckBold size={14} />
          </button>
        </div>
      )}

      {(etapa === 2 || etapa === 3) && onboarding.area && cargossuggest.length > 0 && (
        <div className={styles.suggestPills}>
          {cargossuggest.map(c => (
            <button
              key={c}
              type="button"
              className={styles.suggestPill}
              onClick={() => confirmCargo(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {etapa === 3 && onboarding.cargo && (
        <div className={styles.curriculoVivo}>
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressTitle}>Currículo vivo</span>
              <span className={styles.progressPct}>{onboarding.completude}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${onboarding.completude}%` }} />
            </div>
            <div className={styles.progressHint}>
              {!onboarding.objetivo ? 'Preencha seu objetivo profissional' :
               !onboarding.cvSections?.exp ? 'Adicione sua experiência profissional' :
               !onboarding.cvSections?.edu ? 'Adicione sua formação' :
               'Complete as seções restantes'}
            </div>
          </div>

          {onboarding.objetivo && (
            <div className={styles.objetivoCard}>
              <div className={styles.objetivoHeader}>
                <span className={styles.badgeGerado}>gerado</span>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => { setObjetivoTemp(onboarding.objetivo); setEditandoObjetivo(true) }}
                >
                  <PiPencilSimpleBold size={12} />
                </button>
              </div>
              {editandoObjetivo ? (
                <div className={styles.editObjetivo}>
                  <textarea
                    className="input"
                    value={objetivoTemp}
                    onChange={e => setObjetivoTemp(e.target.value)}
                    rows={3}
                  />
                  <button className="btn btn-primary" onClick={saveObjetivo}>
                    <PiCheckBold size={12} /> Salvar
                  </button>
                </div>
              ) : (
                <p className={styles.objetivoText}>{onboarding.objetivo}</p>
              )}
            </div>
          )}

          <div className={styles.sectionsCard}>
            <div className={styles.sectionRow}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('exp')}>
                <PiBriefcaseBold size={16} className={styles.iconExp} />
                <span className={styles.sectionTitle}>Experiência profissional</span>
                <span className={`${styles.indicator} ${onboarding.cvSections?.exp ? styles.indicatorGreen : styles.indicatorGold}`} />
                <PiCaretDownBold size={14} className={`${styles.chevron} ${expandedSections.exp ? styles.chevronUp : ''}`} />
              </div>
              {expandedSections.exp && (
                <div className={styles.sectionContent}>
                  <textarea
                    className="input"
                    placeholder="Descreva suas experiências profissionais..."
                    value={onboarding.cvSections?.exp || ''}
                    onChange={e => saveCvSection('exp', e.target.value)}
                    rows={4}
                  />
                  <button className="btn btn-primary" onClick={() => saveCvSection('exp', onboarding.cvSections?.exp)}>
                    <PiFloppyDiskBold size={12} /> Salvar
                  </button>
                </div>
              )}
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.sectionRow}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('edu')}>
                <PiGraduationCapBold size={16} className={styles.iconEdu} />
                <span className={styles.sectionTitle}>Formação</span>
                <span className={`${styles.indicator} ${onboarding.cvSections?.edu ? styles.indicatorGreen : styles.indicatorGold}`} />
                <PiCaretDownBold size={14} className={`${styles.chevron} ${expandedSections.edu ? styles.chevronUp : ''}`} />
              </div>
              {expandedSections.edu && (
                <div className={styles.sectionContent}>
                  <textarea
                    className="input"
                    placeholder="Descreva sua formação acadêmica..."
                    value={onboarding.cvSections?.edu || ''}
                    onChange={e => saveCvSection('edu', e.target.value)}
                    rows={4}
                  />
                  <button className="btn btn-primary" onClick={() => saveCvSection('edu', onboarding.cvSections?.edu)}>
                    <PiFloppyDiskBold size={12} /> Salvar
                  </button>
                </div>
              )}
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.sectionRow}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('extra')}>
                <PiStarBold size={16} className={styles.iconExtra} />
                <span className={styles.sectionTitle}>Diferenciais</span>
                <span className={`${styles.indicator} ${onboarding.cvSections?.extra ? styles.indicatorGreen : styles.indicatorGold}`} />
                <PiCaretDownBold size={14} className={`${styles.chevron} ${expandedSections.extra ? styles.chevronUp : ''}`} />
              </div>
              {expandedSections.extra && (
                <div className={styles.sectionContent}>
                  <textarea
                    className="input"
                    placeholder="Projetos, cursos extras, idiomas..."
                    value={onboarding.cvSections?.extra || ''}
                    onChange={e => saveCvSection('extra', e.target.value)}
                    rows={4}
                  />
                  <button className="btn btn-primary" onClick={() => saveCvSection('extra', onboarding.cvSections?.extra)}>
                    <PiFloppyDiskBold size={12} /> Salvar
                  </button>
                </div>
              )}
            </div>
          </div>

          {onboarding.momento && DICAS[onboarding.momento] && (
            <div className={styles.dicaCard}>
              <span className={styles.dicaLabel}>Dica do agente</span>
              <p>{DICAS[onboarding.momento]}</p>
            </div>
          )}

          <div className={styles.extraGoalsCard}>
            <div className={styles.extraGoalsTitle}>Objetivos adicionais</div>
            <div className={styles.extraGoalsPills}>
              {EXTRA_GOALS.map(g => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.extraGoalPill} ${onboarding.extraGoals.includes(g) ? styles.extraGoalActive : ''}`}
                  onClick={() => toggleExtraGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className={styles.restartBtn} onClick={restart}>
            <PiArrowRightBold size={12} /> Reiniciar
          </button>
        </div>
      )}
    </div>
  )
}

function AprendizadoTab() {
  return (
    <div className={styles.placeholderTab}>
      <PiBookOpenTextBold size={48} />
      <p>Aprendizado - Em breve</p>
    </div>
  )
}

function HabilidadesTab() {
  return (
    <div className={styles.placeholderTab}>
      <PiBrainBold size={48} />
      <p>Habilidades - Em breve</p>
    </div>
  )
}

export default function Career() {
  const [activeTab, setActiveTab] = useState('agente')
  const [onboarding, setOnboarding] = useState(loadOnboarding)

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLabel}>CARREIRA</div>
        <div className={styles.headerTitle}>Agente de carreira</div>
      </div>

      <div className={styles.navTabs}>
        <button
          type="button"
          className={`${styles.navTab} ${activeTab === 'agente' ? styles.navTabActive : ''}`}
          onClick={() => setActiveTab('agente')}
        >
          <PiBriefcaseBold size={14} /> Agente
        </button>
        <button
          type="button"
          className={`${styles.navTab} ${activeTab === 'aprendizado' ? styles.navTabActive : ''}`}
          onClick={() => setActiveTab('aprendizado')}
        >
          <PiBookOpenTextBold size={14} /> Aprendizado
        </button>
        <button
          type="button"
          className={`${styles.navTab} ${activeTab === 'habilidades' ? styles.navTabActive : ''}`}
          onClick={() => setActiveTab('habilidades')}
        >
          <PiBrainBold size={14} /> Habilidades
        </button>
      </div>

      {activeTab === 'agente' && <AgentTab />}
      {activeTab === 'aprendizado' && <AprendizadoTab />}
      {activeTab === 'habilidades' && <HabilidadesTab />}
    </main>
  )
}
