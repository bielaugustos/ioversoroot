

const THEME_LIST = [
  { id:'light',         name:'Padrão',       emoji:'☀️',  free:true  },
  { id:'dark',          name:'Escuro',       emoji:'🌙',  free:true  },
  { id:'glass_dark',    name:'Vidro Dark',   emoji:'🌑', free:true, shopId:'theme_glass_dark' },
  { id:'glass',         name:'Vidro',        emoji:'🪟', free:true, shopId:'theme_glass'    },
  { id:'high_contrast', name:'Alto Contraste',emoji:'⬛',  free:false, shopId:'theme_high_contrast' },
  { id:'midnight',      name:'Midnight',     emoji:'🌌', free:false, shopId:'theme_midnight' },
  { id:'forest',        name:'Forest',       emoji:'🌿',  free:false, shopId:'theme_forest'   },
  { id:'sakura',        name:'Sakura',       emoji:'🌸',  free:false, shopId:'theme_sakura'   },
  { id:'desert',        name:'Desert',       emoji:'🏜️', free:false, shopId:'theme_desert'   },
  { id:'dracula',       name:'Dracula',      emoji:'🧛',  free:false, shopId:'theme_dracula'  },
  { id:'nord',          name:'Nord',         emoji:'🏔️',  free:false, shopId:'theme_nord'     },
  { id:'macintosh',     name:'Macintosh',    emoji:'🍎',  free:false, shopId:'theme_macintosh'    },
  { id:'windows98',     name:'Windows 98',   emoji:'🪟',  free:false, shopId:'theme_windows98'    },
  { id:'linux',         name:'Linux',        emoji:'🐧',  free:false, shopId:'theme_linux'        },
]

export function ThemeSelector({ currentTheme, onChangeTheme, ownedItems }) {
  function handleThemeSelect(themeId) {
    const theme = THEME_LIST.find(t => t.id === themeId)
    if (theme && (theme.free || ownedItems.has(theme.shopId))) {
      onChangeTheme(themeId)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {THEME_LIST.map(theme => {
          const unlocked = theme.free || ownedItems.has(theme.shopId)
          const active = currentTheme === theme.id

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleThemeSelect(theme.id)}
              disabled={!unlocked}
              title={!unlocked ? 'Desbloquear na loja' : theme.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '8px 4px',
                background: active ? 'var(--gold)' : 'var(--white)',
                border: active ? '1.5px solid var(--gold-dk)' : '0.5px solid var(--border)',
                borderRadius: 6,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.5,
                transition: 'transform 0.1s',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{theme.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? '#111' : 'var(--ink)', textAlign: 'center', lineHeight: 1.2 }}>{theme.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}