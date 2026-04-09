import { useState, useRef, useEffect, useMemo } from "react";
import {
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
} from "../services/supabase";
import { MigrationModal } from "../components/MigrationModal";
import {
  hasLocalData,
  clearLocalData,
  deleteAllData,
} from "../services/syncService";
import {
  PiDownloadSimpleBold,
  PiUploadSimpleBold,
  PiArrowCounterClockwiseBold,
  PiCodeBold,
  PiSpeakerHighBold,
  PiSpeakerSlashBold,
  PiPencilSimpleBold,
  PiCheckBold,
  PiStorefrontBold,
  PiInfoBold,
  PiPaletteBold,
  PiChartBarBold,
  PiMedalBold,
  PiBriefcaseBold,
  PiCaretDownBold,
  PiRocketLaunchBold,
  PiStarBold,
  PiCheckCircleBold,
  PiCalendarBold,
  PiLockSimpleBold,
  PiKeyBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiCrownBold,
  PiSparkleBold,
  PiTrashBold,
  PiEnvelopeBold,
  PiInstagramLogoFill,
  PiLinkedinLogoFill,
  PiYoutubeLogoFill,
  PiWhatsappLogoFill,
  PiUserCircleBold,
} from "react-icons/pi";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useHabits } from "../hooks/useHabits";
import { useStats } from "../hooks/useStats";
import { calcLevel } from "../services/levels";
import { loadStorage, saveStorage } from "../services/storage";
import { THEMES, applyTheme } from "../services/themes";
import { LegalModal, useLegal } from "../components/LegalModal";
import { ThemeSelector } from "../components/ThemeSelector";
import { ThemePersonalizer } from "../components/ThemePersonalizer";
import { toast } from "../components/Toast";
import { playPurchaseDirect, playClickDirect } from "../hooks/useSound";
import { usePlan } from "../hooks/usePlan";
import styles from "./Profile.module.css";

// Constantes importadas
import { SHOP_ITEMS, CAT_LABELS, CAT_DESC } from "../constants/shopConstants";
import { THEME_LIST } from "../constants/themeConstants";
import {
  BASE_AVATARS,
  SHOP_AVATAR_MAP,
  getAvailableAvatars,
} from "../constants/avatarConstants";
import { FREE_FEATURES, PRO_EXTRAS } from "../constants/planConstants";

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

// ══════════════════════════════════════
// TOGGLE
// ══════════════════════════════════════
function Toggle({ on, onToggle, label }) {
  return (
    <div
      className={`${styles.toggleTrack} ${on ? styles.toggleOn : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      <div className={`${styles.toggleThumb} ${on ? styles.thumbOn : ""}`} />
    </div>
  );
}

// ══════════════════════════════════════
// HERO CARD
// ══════════════════════════════════════
function HeroCard({ allPoints, streak, daysActive }) {
  const level = calcLevel(allPoints);
  const { user, profile, reloadProfile } = useAuth();
  const [userName, setUserName] = useState(() =>
    loadStorage("nex_username", "../"),
  );
  const [userAvatar, setUserAvatar] = useState(() =>
    loadStorage("nex_avatar", "🧑"),
  );
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showPicker, setShowPicker] = useState(false);
  const [avatarList, setAvatarList] = useState(getAvailableAvatars);

  // Sincroniza nome e avatar do Supabase ao carregar o perfil
  useEffect(() => {
    if (profile?.username) {
      setUserName(profile.username);
      setTempName(profile.username);
      saveStorage("nex_username", profile.username);
    }
    if (profile?.avatar_emoji) {
      setUserAvatar(profile.avatar_emoji);
      saveStorage("nex_avatar", profile.avatar_emoji);
    }
  }, [profile?.username, profile?.avatar_emoji]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const refresh = () => setAvatarList(getAvailableAvatars());
    window.addEventListener("nex_shop_changed", refresh);
    return () => window.removeEventListener("nex_shop_changed", refresh);
  }, []);

  async function handleSave() {
    const name = tempName.trim() || "../";
    setUserName(name);
    saveStorage("nex_username", name);
    setEditing(false);
    setShowPicker(false);
    if (user?.id) {
      await updateProfile(user.id, { username: name });
      reloadProfile();
    }
    toast("Perfil atualizado!");
  }

  async function pickAvatar(emoji) {
    setUserAvatar(emoji);
    saveStorage("nex_avatar", emoji);
    setShowPicker(false);
    if (user?.id) {
      await updateProfile(user.id, { avatar_emoji: emoji });
      reloadProfile();
    }
    toast("Avatar atualizado!");
  }

  return (
    <div className="card">
      <div className={styles.hero}>
        <div className={styles.avatarWrap}>
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={() => setShowPicker((p) => !p)}
            aria-label="Trocar avatar"
          >
            <span className={styles.avatarEmoji}>{userAvatar}</span>
          </button>
          {showPicker && (
            <div className={styles.avatarPicker}>
              {avatarList.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`${styles.emojiOpt} ${userAvatar === e ? styles.emojiSel : ""}`}
                  onClick={() => pickAvatar(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {editing ? (
          <div className={styles.nameEdit}>
            <input
              autoFocus
              className={`input ${styles.nameInput}`}
              value={tempName}
              maxLength={24}
              placeholder="Seu nome"
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <button
              type="button"
              className={`btn btn-primary ${styles.saveNameBtn}`}
              onClick={handleSave}
            >
              <PiCheckBold size={13} />
            </button>
          </div>
        ) : (
          <div className={styles.nameRow}>
            <span className={styles.heroName}>{userName}</span>
            <button
              type="button"
              className={styles.editNameBtn}
              onClick={() => {
                setTempName(userName);
                setEditing(true);
              }}
            >
              <PiPencilSimpleBold size={13} />
            </button>
          </div>
        )}

        <div className={styles.heroLevel} style={{ color: level.color }}>
          <level.Icon size={14} /> {level.name}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// LOJA — dropdown animado que expande
// ao clicar no botão da seção de configs.
// Fica escondida por padrão para não
// poluir o layout do Profile.
// ══════════════════════════════════════
function RewardsShop({
  allPoints,
  onItemBought,
  isOpen,
  onToggle,
  theme,
  setTheme,
}) {
  const [cat, setCat] = useState("all");
  const [owned, setOwned] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("nex_shop_owned") || "[]"),
      );
    } catch {
      return new Set();
    }
  });
  const [calVisible, setCalVisible] = useState(() =>
    loadStorage("nex_cal_visible", true),
  );

  function buy(item) {
    if (owned.has(item.id)) return;
    if (item.cost > 0 && allPoints < item.cost) return;
    const next = new Set(owned);
    next.add(item.id);
    setOwned(next);
    localStorage.setItem("nex_shop_owned", JSON.stringify([...next]));
    if (item.cat === "avatar") localStorage.setItem("nex_avatar", item.icon);
    if (onItemBought) onItemBought(item.id);
    window.dispatchEvent(new Event("nex_shop_changed"));
    playPurchaseDirect();
    const msg = {
      util_calendar: "CalendárIO desbloqueado! Visível na tela de hábitos.",
      util_freeze: "Streak Freeze ativado!",
      util_challenge: "DesafIO extra adicionado em Rewards.",
      util_insight: "Insight Financeiro ativado.",
    };
    toast(msg[item.id] || `"${item.name}" desbloqueado!`);
  }

  function toggleCal() {
    const next = !calVisible;
    setCalVisible(next);
    saveStorage("nex_cal_visible", next);
    window.dispatchEvent(new Event("nex_shop_changed"));
    playClickDirect();
  }

  const ownedCount = SHOP_ITEMS.filter((i) => owned.has(i.id)).length;
  const list = (
    cat === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.cat === cat)
  )
    .slice()
    .sort((a, b) => a.cost - b.cost);

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Lista de itens */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {list.map((item) => {
          const isOwned = owned.has(item.id);
          const canAfford = allPoints >= item.cost;
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: isOwned ? "var(--surface)" : "var(--white)",
                border: "0.5px solid var(--border)",
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: "var(--ink)" }}>
                  {item.desc}
                </span>
              </div>
              <div>
                {isOwned && item.toggle ? (
                  <Toggle
                    on={item.id === "util_calendar" ? calVisible : true}
                    onToggle={
                      item.id === "util_calendar" ? toggleCal : undefined
                    }
                    label={item.name}
                  />
                ) : isOwned ? (
                  <span
                    style={{ fontSize: 11, color: "#27ae60", fontWeight: 700 }}
                  >
                    ✓
                  </span>
                ) : item.cost === 0 ? (
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                    onClick={() => buy(item)}
                  >
                    Grátis
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                    onClick={() => buy(item)}
                    disabled={!canAfford}
                  >
                    {item.cost} IO
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// CHAVE API — configuração pelo usuárIO
// ══════════════════════════════════════
function ApiKeyCard() {
  const [key, setKey] = useState(
    () => localStorage.getItem("nex_apikey") || "",
  );
  const [input, setInput] = useState(
    () => localStorage.getItem("nex_apikey") || "",
  );
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const hasSaved = key && key.startsWith("sk-ant-");

  function save() {
    const trimmed = input.trim();
    if (!trimmed) {
      toast("Cole sua chave API antes de salvar.");
      return;
    }
    if (!trimmed.startsWith("sk-ant-")) {
      toast("Chave inválida — deve começar com sk-ant-");
      return;
    }
    localStorage.setItem("nex_apikey", trimmed);
    setKey(trimmed);
    setEditing(false);
    toast("Chave API salva!");
  }

  function remove() {
    if (!window.confirm("Remover a chave API? O Mentor IA ficará desativado."))
      return;
    localStorage.removeItem("nex_apikey");
    setKey("");
    setInput("");
    setEditing(false);
    toast("Chave removida.");
  }

  const masked = key ? key.slice(0, 10) + "••••••••••••" + key.slice(-4) : "";

  return (
    <div className={styles.shopWrapper}>
      <div
        className={styles.shopTrigger}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
      >
        <span className={styles.settingIcon}>
          <PiKeyBold size={16} />
        </span>
        <div style={{ flex: 1 }}>
          <span className={styles.settingLabel}>Chave API Claude</span>
          <p className={styles.settingDesc}>
            {hasSaved
              ? "Chave configurada — Mentor IA ativo"
              : "Necessária para usar o Mentor IA"}
          </p>
        </div>
        {hasSaved && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#27ae60",
              marginRight: 6,
              background: "#27ae6022",
              border: "1px solid #27ae6044",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            Ativa
          </span>
        )}
        <span
          className={`${styles.shopArrow} ${open ? styles.shopArrowOpen : ""}`}
        >
          <PiCaretDownBold size={14} />
        </span>
      </div>

      <div
        className={`${styles.shopDrawer} ${open ? styles.shopDrawerOpen : ""}`}
      >
        <div
          className={styles.shopDrawerInner}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {/* Passo a passo */}
          <div
            style={{
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              borderRadius: 4,
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink2)",
                margin: 0,
              }}
            >
              Como obter sua chave:
            </p>
            {[
              {
                n: 1,
                text: "Acesse",
                link: "console.anthropic.com",
                href: "https://console.anthropic.com",
              },
              { n: 2, text: "Vá em API Keys → Create Key", link: null },
              { n: 3, text: "Copie e cole abaixo", link: null },
            ].map((s) => (
              <div
                key={s.n}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "var(--ink)",
                    fontSize: 10,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.n}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink2)" }}>
                  {s.text}{" "}
                  {s.link && (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--gold-dk)", fontWeight: 700 }}
                    >
                      {s.link}
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Input ou display da chave */}
          {hasSaved && !editing ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div
                style={{
                  flex: 1,
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 4,
                  padding: "8px 10px",
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "var(--ink2)",
                }}
              >
                {show ? key : masked}
              </div>
              <button
                type="button"
                className="btn"
                style={{ padding: "6px 8px" }}
                onClick={() => setShow((s) => !s)}
              >
                {show ? <PiEyeSlashBold size={14} /> : <PiEyeBold size={14} />}
              </button>
              <button
                type="button"
                className="btn"
                style={{ padding: "6px 10px", fontSize: 11 }}
                onClick={() => {
                  setInput(key);
                  setEditing(true);
                }}
              >
                Trocar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: "6px 10px", fontSize: 11 }}
                onClick={remove}
              >
                Remover
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="input"
                type={show ? "text" : "password"}
                placeholder="sk-ant-api03-..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, fontFamily: "monospace", fontSize: 12 }}
              />
              <button
                type="button"
                className="btn"
                style={{ padding: "6px 8px" }}
                onClick={() => setShow((s) => !s)}
              >
                {show ? <PiEyeSlashBold size={14} /> : <PiEyeBold size={14} />}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: "6px 12px", fontSize: 12 }}
                onClick={save}
              >
                <PiCheckBold size={13} /> Salvar
              </button>
            </div>
          )}

          <div
            style={{
              background: "#fffbf0",
              border: "1.5px solid var(--gold-dk)",
              borderRadius: 4,
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              💡 Chave API é independente do plano Pro
            </p>
            <p
              style={{
                fontSize: 10,
                color: "var(--ink2)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Ter sua própria chave API da Anthropic é suficiente para usar o
              Mentor IA — <strong>sem precisar do plano Pro do Rootio</strong>.
              A chave é cobrada diretamente pela Anthropic conforme o uso
              (pay-as-you-go), e fica salva apenas no seu dispositivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// CONFIGURAÇÕES DE CONTA
// ══════════════════════════════════════
function AccountSettingsCard() {
  const { user, profile, reloadProfile, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const legal = useLegal();

  // Estados para trocar email
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Estados para trocar senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Estados para editar data de nascimento
  const [birthdate, setBirthdate] = useState("");
  const [birthdateLoading, setBirthdateLoading] = useState(false);
  const [showBirthdateForm, setShowBirthdateForm] = useState(false);

  const currentEmail = user?.email || "";
  const currentBirthdate = profile?.birthdate || null;

  // Formatar data para exibição (DD/MM/AAAA)
  const formatBirthdate = (dateStr) => {
    if (!dateStr) return "Não informada";
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Não informada";
    }
  };

  // Calcular idade a partir da data de nascimento
  const calculateAge = (dateStr) => {
    if (!dateStr) return null;
    try {
      const today = new Date();
      const birth = new Date(dateStr + "T00:00:00");
      const age =
        today.getFullYear() -
        birth.getFullYear() -
        (today.getMonth() < birth.getMonth() ? 1 : 0) -
        (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate()
          ? 1
          : 0);
      return age;
    } catch {
      return null;
    }
  };

  // Sincronizar birthdate do profile ao carregar
  useEffect(() => {
    if (profile?.birthdate) {
      setBirthdate(profile.birthdate);
    }
  }, [profile?.birthdate]);

  // Recarregar perfil quando os pontos são atualizados
  useEffect(() => {
    const handlePointsUpdated = (e) => {
      if (reloadProfile) {
        reloadProfile();
      }
    };

    window.addEventListener("profile-points-updated", handlePointsUpdated);
    return () =>
      window.removeEventListener("profile-points-updated", handlePointsUpdated);
  }, [reloadProfile]);

  async function handleEmailChange(e) {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast("Digite o novo e-mail.");
      return;
    }
    if (newEmail === currentEmail) {
      toast("O novo e-mail é igual ao atual.");
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await updateEmail(newEmail);
      if (error) {
        toast("Erro ao atualizar e-mail: " + error.message);
        return;
      }
      toast(
        "E-mail atualizado! Verifique sua caixa de entrada para confirmar.",
      );
      setShowEmailForm(false);
      setNewEmail("");
    } catch (err) {
      toast("Erro ao atualizar e-mail. Tente novamente.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!currentPassword) {
      toast("Digite a senha atual.");
      return;
    }
    if (newPassword.length < 6) {
      toast("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("As senhas não coincidem.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast("Senha atual incorreta.");
        } else {
          toast("Erro ao atualizar senha: " + error.message);
        }
        return;
      }
      toast("Senha atualizada com sucesso!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast("Erro ao atualizar senha. Tente novamente.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleBirthdateChange(e) {
    e.preventDefault();
    if (!birthdate) {
      toast("Selecione uma data de nascimento.");
      return;
    }

    // Validar idade - usuárIO deve ter pelo menos 13 anos (COPPA)
    const today = new Date();
    const birth = new Date(birthdate);
    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ? 1 : 0) -
      (today.getMonth() === birth.getMonth() &&
      today.getDate() < birth.getDate()
        ? 1
        : 0);

    if (age < 13) {
      toast("Você deve ter pelo menos 13 anos para usar o app.");
      return;
    }

    if (age > 150) {
      toast("Data de nascimento inválida.");
      return;
    }

    setBirthdateLoading(true);
    try {
      const { error } = await updateProfile(user.id, { birthdate });
      if (error) {
        toast("Erro ao atualizar data de nascimento: " + error.message);
        return;
      }
      toast("Data de nascimento atualizada com sucesso!");
      setShowBirthdateForm(false);
      reloadProfile();
    } catch (err) {
      toast("Erro ao atualizar data de nascimento. Tente novamente.");
    } finally {
      setBirthdateLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* E-mail atual */}
      <div
        style={{
          background: "var(--white)",
          border: "0.5px solid var(--border)",
          borderRadius: 8,
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--ink2)",
            margin: "0 0 4px 0",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          E-mail
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink)",
            margin: 0,
            wordBreak: "break-all",
          }}
        >
          {currentEmail || "Não conectado"}
        </p>
      </div>

      {/* Trocar e-mail */}
      {!showEmailForm ? (
        <button
          type="button"
          className="btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
            fontSize: 12,
            width: "100%",
          }}
          onClick={() => setShowEmailForm(true)}
        >
          <PiPencilSimpleBold size={14} /> Trocar e-mail
        </button>
      ) : (
        <div
          style={{
            background: "var(--white)",
            border: "0.5px solid var(--border)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <form
            onSubmit={handleEmailChange}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Novo e-mail
              </label>
              <input
                className="input"
                type="email"
                placeholder="novo@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
                style={{ fontSize: 12 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={emailLoading}
                style={{ flex: 1, fontSize: 12 }}
              >
                {emailLoading ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowEmailForm(false);
                  setNewEmail("");
                }}
                style={{ fontSize: 12 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data de nascimento */}
      <div
        style={{
          background: "var(--white)",
          border: "0.5px solid var(--border)",
          borderRadius: 8,
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--ink2)",
            margin: "0 0 4px 0",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Nascimento
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <p style={{ fontSize: 13, color: "var(--ink)", margin: 0 }}>
              {formatBirthdate(currentBirthdate)}
            </p>
            {calculateAge(currentBirthdate) && (
              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink2)",
                  margin: "2px 0 0 0",
                }}
              >
                {calculateAge(currentBirthdate)} anos
              </p>
            )}
          </div>
          {!showBirthdateForm ? (
            <button
              type="button"
              className="btn"
              style={{ padding: "6px 10px", fontSize: 11 }}
              onClick={() => {
                setBirthdate(currentBirthdate || "");
                setShowBirthdateForm(true);
              }}
            >
              <PiPencilSimpleBold size={13} />
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              style={{ padding: "6px 10px", fontSize: 11 }}
              onClick={() => {
                setShowBirthdateForm(false);
                setBirthdate(currentBirthdate || "");
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {showBirthdateForm && (
        <div
          style={{
            background: "var(--white)",
            border: "0.5px solid var(--border)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <form
            onSubmit={handleBirthdateChange}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Nova data
              </label>
              <input
                className="input"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                autoComplete="bday"
                max={new Date().toISOString().split("T")[0]}
                style={{ fontSize: 12 }}
              />
              <p
                style={{
                  fontSize: 10,
                  color: "var(--ink3)",
                  margin: "4px 0 0 0",
                  lineHeight: 1.4,
                }}
              >
                Mínimo 13 anos
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={birthdateLoading}
                style={{ flex: 1, fontSize: 12 }}
              >
                {birthdateLoading ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowBirthdateForm(false);
                  setBirthdate(currentBirthdate || "");
                }}
                style={{ fontSize: 12 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pontos IO */}
      {isLoggedIn && (
        <div
          style={{
            background: "var(--white)",
            border: "0.5px solid var(--border)",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--ink2)",
              margin: "0 0 4px 0",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Pontos IO
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--gold-dk)",
              margin: 0,
            }}
          >
            {profile?.points ?? 0} IO
          </p>
        </div>
      )}

      {/* Trocar senha */}
      {!showPasswordForm ? (
        <button
          type="button"
          className="btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
            fontSize: 12,
            width: "100%",
          }}
          onClick={() => setShowPasswordForm(true)}
        >
          <PiLockSimpleBold size={14} /> Trocar senha
        </button>
      ) : (
        <div
          style={{
            background: "var(--white)",
            border: "0.5px solid var(--border)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <form
            onSubmit={handlePasswordChange}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div
              style={{
                background: "#fffbf0",
                border: "1px solid var(--gold-dk)",
                borderRadius: 6,
                padding: "8px 10px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                💡 Use "Esqueceu a senha?" no login para redefinir sem precisar
                da atual.
              </p>
            </div>

            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Senha atual
              </label>
              <input
                className="input"
                type={showPasswords ? "text" : "password"}
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                style={{ fontSize: 12 }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Nova senha
              </label>
              <input
                className="input"
                type={showPasswords ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                style={{ fontSize: 12 }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Confirmar senha
              </label>
              <input
                className="input"
                type={showPasswords ? "text" : "password"}
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{ fontSize: 12 }}
              />
            </div>
            <button
              type="button"
              className="btn"
              style={{
                fontSize: 11,
                color: "var(--ink2)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onClick={() => setShowPasswords((v) => !v)}
            >
              {showPasswords ? (
                <PiEyeSlashBold size={12} />
              ) : (
                <PiEyeBold size={12} />
              )}
              {showPasswords ? "Ocultar" : "Mostrar"}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
                style={{ flex: 1, fontSize: 12 }}
              >
                {passwordLoading ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={{ fontSize: 12 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Legal */}
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button
          type="button"
          className="btn"
          style={{
            flex: 1,
            fontSize: 11,
            justifyContent: "center",
            padding: "8px 4px",
          }}
          onClick={legal.openTermos}
        >
          Termos
        </button>
        <button
          type="button"
          className="btn"
          style={{
            flex: 1,
            fontSize: 11,
            justifyContent: "center",
            padding: "8px 4px",
          }}
          onClick={legal.openPrivacidade}
        >
          Privacidade
        </button>
        <button
          type="button"
          className="btn"
          style={{
            flex: 1,
            fontSize: 11,
            justifyContent: "center",
            padding: "8px 4px",
          }}
          onClick={legal.openCookies}
        >
          Cookies
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// SELETOR DE TEMAS — lista horizontal compacta
// Aparência integrada diretamente nas configs,
// sem card separado visualmente pesado.
// ══════════════════════════════════════

function ThemePicker({ currentTheme, onChangeTheme, ownedItems }) {
  const [open, setOpen] = useState(false);
  const current =
    THEME_LIST.find((t) => t.id === currentTheme) || THEME_LIST[0];

  return (
    <div className={styles.themeDropdown}>
      {/* Trigger */}
      <button
        type="button"
        className={styles.themeDropTrigger}
        onClick={() => setOpen((o) => !o)}
      >
        <PiPaletteBold
          size={15}
          color="var(--ink2)"
          style={{ flexShrink: 0 }}
        />
        <span className={styles.themeDropEmoji}>{current.emoji}</span>
        <span className={styles.themeDropName}>{current.name}</span>
        <PiCheckCircleBold
          size={12}
          color="var(--gold-dk)"
          style={{ marginLeft: "auto", marginRight: 4 }}
        />
        <PiCaretDownBold
          size={12}
          className={open ? styles.themeDropArrowOpen : ""}
          style={{
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {/* Lista */}
      {open && (
        <div className={styles.themeDropList}>
          {THEME_LIST.map((t) => {
            const unlocked = t.free || ownedItems.has(t.shopId);
            const active = currentTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={[
                  styles.themeDropItem,
                  active && styles.themeDropItemActive,
                  !unlocked && styles.themeDropItemLocked,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (unlocked) {
                    onChangeTheme(t.id);
                    setOpen(false);
                  }
                }}
                title={!unlocked ? "Desbloquear na loja" : t.name}
              >
                <span className={styles.themeDropEmoji}>{t.emoji}</span>
                <span className={styles.themeDropItemName}>{t.name}</span>
                {active && (
                  <PiCheckCircleBold
                    size={13}
                    color="var(--gold-dk)"
                    style={{ marginLeft: "auto" }}
                  />
                )}
                {!unlocked && (
                  <span className={styles.themeDropLock}>
                    <PiLockSimpleBold size={11} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// PLANOS — cartão de upgrade
// ══════════════════════════════════════
function PlansCard() {
  const { isPro, cancelPro } = usePlan();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Grade de planos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* Gratuito */}
        <div
          style={{
            background: "var(--white)",
            border: "0.5px solid var(--border)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: isPro ? "var(--ink3)" : "#27ae60",
                background: isPro ? "var(--surface)" : "#e8f8ef",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {isPro ? "GRATUITO" : "ATUAL"}
            </span>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: 8,
            }}
          >
            Gratuito
          </div>
          <div style={{ fontSize: 11, color: "var(--ink2)", marginBottom: 8 }}>
            R$ 0<span style={{ fontSize: 10 }}>/mês</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {FREE_FEATURES.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  color: "var(--ink2)",
                }}
              >
                <PiCheckBold size={9} color="#27ae60" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div
          style={{
            background: "var(--white)",
            border: "0.5px solid var(--gold-dk)",
            borderRadius: 8,
            padding: 12,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -1,
              right: 8,
              background: "var(--gold)",
              padding: "2px 6px",
              borderRadius: "0 0 4px 4px",
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 700, color: "#111" }}>
              PRO
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: isPro ? "#27ae60" : "#f39c12",
                background: isPro ? "#e8f8ef" : "#fef5e7",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {isPro ? "ATUAL" : "推荐"}
            </span>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--gold-dk)",
              marginBottom: 8,
            }}
          >
            Pro
          </div>
          <div style={{ fontSize: 11, color: "var(--ink)", marginBottom: 8 }}>
            R$ 9,90<span style={{ fontSize: 10 }}>/mês</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 12,
            }}
          >
            {PRO_EXTRAS.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  color: "var(--ink2)",
                }}
              >
                <PiCheckBold size={9} color="#f39c12" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          {/* Botão Stripe dentro do card Pro */}
          {isPro ? (
            <div
              style={{
                fontSize: 11,
                color: "#27ae60",
                textAlign: "center",
                fontWeight: 700,
                padding: "8px 0",
                borderTop: "0.5px solid var(--border)",
              }}
            >
              ✓ Plano Pro ativo
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: "center",
              }}
            >
              <stripe-buy-button
                buy-button-id="buy_btn_1TK49bAh9kVNzJGCxuVxRcYV"
                publishable-key="pk_live_51RIA2CAh9kVNzJGCuXxsjXs2oYkHoW9hKiXed7CMYuqxofzyZtSCBL4ya5J4ZLnkUbHWWOHY2qTgB19AH2bvrquQ00pXFWSvyl"
              ></stripe-buy-button>
              <p
                style={{
                  fontSize: 9,
                  color: "var(--ink3)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Pagamento seguro via Stripe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// PROFILE — PÁGINA PRINCIPAL
// ══════════════════════════════════════
export default function Profile({ onNavigate }) {
  const {
    habits,
    history,
    theme,
    setTheme,
    soundOn,
    setSoundOn,
    resetDay,
    setPlan,
  } = useApp();
  const { allPoints } = useHabits();
  const { streak, daysActive } = useStats(history);
  const { can } = usePlan();

  const { isLoggedIn, user, profile } = useAuth();
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showGuestExitModal, setShowGuestExitModal] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const legal = useLegal();

  const [ownedItems, setOwnedItems] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("nex_shop_owned") || "[]"),
      );
    } catch {
      return new Set();
    }
  });

  function exportData() {
    const userName = loadStorage("nex_username", "Usuário ioversoroot");
    const userAvatar = loadStorage("nex_avatar", "🧑");
    const blob = new Blob(
      [JSON.stringify({ habits, history, userName, userAvatar }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast("Backup exportado!");
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data.habits) {
          toast("Arquivo inválido");
          return;
        }
        localStorage.setItem("nex_habits", JSON.stringify(data.habits));
        localStorage.setItem("nex_history", JSON.stringify(data.history || {}));
        if (data.userName) saveStorage("nex_username", data.userName);
        if (data.userAvatar) saveStorage("nex_avatar", data.userAvatar);
        toast("Backup restaurado! Recarregue a página.");
      } catch {
        toast("Arquivo inválido");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function toggleNavItem(id) {
    const next = new Set(ownedItems);
    ownedItems.has(id) ? next.delete(id) : next.add(id);
    setOwnedItems(next);
    localStorage.setItem("nex_shop_owned", JSON.stringify([...next]));
    window.dispatchEvent(new Event("nex_shop_changed"));
  }

  return (
    <div className={styles.page}>
      <HeroCard allPoints={allPoints} streak={streak} daysActive={daysActive} />

      {/* Grupo 1: Conta + Plano Pro */}
      <div className={styles.settingsGroup}>
        <div
          className={styles.settingsGroupRow}
          onClick={() => setAccountOpen((a) => !a)}
        >
          <span className={styles.settingIcon}>
            <PiLockSimpleBold size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <span className={styles.settingsGroupLabel}>Conta</span>
            <p className={styles.settingsGroupDesc}>
              {isLoggedIn ? "E-mail, senha e dados" : "Entrar ou criar conta"}
            </p>
          </div>
          <span
            className={`${styles.settingsGroupValue} ${accountOpen ? styles.openArrow : ""}`}
          >
            <PiCaretDownBold size={14} />
          </span>
        </div>
        {accountOpen && (
          <div className={styles.settingsGroupDropdown}>
            <AccountSettingsCard />
          </div>
        )}
        <div
          className={styles.settingsGroupRow}
          onClick={() => setPlanOpen((p) => !p)}
        >
          <span className={styles.settingIcon}>
            <PiCrownBold size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <span className={styles.settingsGroupLabel}>Plano Pro</span>
            <p className={styles.settingsGroupDesc}>
              Recursos exclusivos e avançados
            </p>
          </div>
          <span
            className={`${styles.settingsGroupValue} ${planOpen ? styles.openArrow : ""}`}
          >
            <PiCaretDownBold size={14} />
          </span>
        </div>
        {planOpen && (
          <div className={styles.settingsGroupDropdown}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--ink2)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Plano Pro
            </div>
            <PlansCard />
            <ApiKeyCard />
          </div>
        )}
      </div>

      {/* Grupo 2: Tema */}
      <div className={styles.settingsGroup}>
        <div
          className={styles.settingsGroupRow}
          onClick={() => setThemeOpen((t) => !t)}
        >
          <span className={styles.settingIcon}>
            <PiPaletteBold size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <span className={styles.settingsGroupLabel}>Tema</span>
            <p className={styles.settingsGroupDesc}>Aparência do app</p>
          </div>
          <span
            className={`${styles.settingsGroupValue} ${themeOpen ? styles.openArrow : ""}`}
          >
            <PiCaretDownBold size={14} />
          </span>
        </div>
        {themeOpen && (
          <div className={styles.settingsGroupDropdown}>
            <ThemeSelector
              currentTheme={theme}
              onChangeTheme={setTheme}
              ownedItems={ownedItems}
            />
          </div>
        )}
      </div>

      {/* Grupo 3: Sons */}
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupRow}>
          <span className={styles.settingIcon}>
            {soundOn ? (
              <PiSpeakerHighBold size={16} />
            ) : (
              <PiSpeakerSlashBold size={16} />
            )}
          </span>
          <div style={{ flex: 1 }}>
            <span className={styles.settingsGroupLabel}>Sons de feedback</span>
            <p className={styles.settingsGroupDesc}>Ativar sons do app</p>
          </div>
          <Toggle
            on={soundOn}
            onToggle={() => setSoundOn((s) => !s)}
            label="Sons"
          />
        </div>
      </div>

      {/* Grupo 4: Hub io */}
      <div className={styles.settingsGroup}>
        <div
          className={styles.settingsGroupRow}
          onClick={() => setShopOpen((s) => !s)}
        >
          <span className={styles.settingIcon}>
            <PiStorefrontBold size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <span className={styles.settingsGroupLabel}>Hub io</span>
            <p className={styles.settingsGroupDesc}>
              {ownedItems.size} / {SHOP_ITEMS.length} obtidos • {allPoints} IO
            </p>
          </div>
          <span
            className={`${styles.settingsGroupValue} ${shopOpen ? styles.openArrow : ""}`}
          >
            <PiCaretDownBold size={14} />
          </span>
        </div>
        {shopOpen && (
          <div className={styles.settingsGroupDropdown}>
            <RewardsShop
              allPoints={allPoints}
              isOpen={true}
              onToggle={() => setShopOpen((s) => !s)}
              onItemBought={(id) =>
                setOwnedItems((prev) => new Set([...prev, id]))
              }
              theme={theme}
              setTheme={setTheme}
            />
          </div>
        )}
      </div>

      {/* Grupo 5: Backup */}
      {can("export_json") && (
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupRow} onClick={exportData}>
            <span className={styles.settingIcon}>
              <PiDownloadSimpleBold size={16} />
            </span>
            <span className={styles.settingsGroupLabel}>Exportar backup</span>
          </div>
          <label
            className={styles.settingsGroupRow}
            style={{ cursor: "pointer" }}
          >
            <span className={styles.settingIcon}>
              <PiUploadSimpleBold size={16} />
            </span>
            <span className={styles.settingsGroupLabel}>Restaurar backup</span>
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={importData}
            />
          </label>
          <div
            className={styles.settingsGroupRow}
            onClick={() => {
              if (window.confirm("Resetar todos os hábitos do dia?")) {
                resetDay();
                toast("Dia resetado!");
              }
            }}
          >
            <span className={styles.settingIcon}>
              <PiArrowCounterClockwiseBold size={16} />
            </span>
            <span className={styles.settingsGroupLabel}>Resetar dia</span>
          </div>
        </div>
      )}

      {/* Grupo 5: Navegação + Dados */}
      <div className={styles.settingsGroup}>
        <div
          className={styles.settingsGroupRow}
          onClick={() => toggleNavItem("util_progress")}
        >
          <span className={styles.settingIcon}>
            <PiChartBarBold size={16} />
          </span>
          <span className={styles.settingsGroupLabel}>
            Experiência na navegação
          </span>
          <Toggle
            on={ownedItems.has("util_progress")}
            onToggle={() => toggleNavItem("util_progress")}
            label="Experiência"
          />
        </div>
        <div
          className={styles.settingsGroupRow}
          onClick={() => toggleNavItem("util_mentor")}
        >
          <span className={styles.settingIcon}>
            <PiSparkleBold size={16} />
          </span>
          <span className={styles.settingsGroupLabel}>Mentor na navegação</span>
          <Toggle
            on={ownedItems.has("util_mentor")}
            onToggle={() => toggleNavItem("util_mentor")}
            label="Mentor"
          />
        </div>
        <div
          className={styles.settingsGroupRow}
          onClick={() => toggleNavItem("util_career")}
        >
          <span className={styles.settingIcon}>
            <PiBriefcaseBold size={16} />
          </span>
          <span className={styles.settingsGroupLabel}>
            Carreira na navegação
          </span>
          <Toggle
            on={ownedItems.has("util_career")}
            onToggle={() => toggleNavItem("util_career")}
            label="Carreira"
          />
        </div>
        <div
          className={styles.settingsGroupRow}
          onClick={() => toggleNavItem("util_projects")}
        >
          <span className={styles.settingIcon}>
            <PiRocketLaunchBold size={16} />
          </span>
          <span className={styles.settingsGroupLabel}>
            Projetos na navegação
          </span>
          <Toggle
            on={ownedItems.has("util_projects")}
            onToggle={() => toggleNavItem("util_projects")}
            label="Projetos"
          />
        </div>
        <div
          className={`${styles.settingsGroupRow} ${styles.settingsGroupRowDanger}`}
          onClick={() => setShowDeleteModal(true)}
        >
          <span className={styles.settingIcon}>
            <PiTrashBold size={16} />
          </span>
          <span className={styles.settingsGroupLabel}>Apagar dados</span>
        </div>
        {hasLocalData() && (
          <div
            className={styles.settingsGroupRow}
            onClick={() => can("data_migration") && setShowMigrationModal(true)}
          >
            <span className={styles.settingIcon}>
              <PiUploadSimpleBold size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <span className={styles.settingsGroupLabel}>
                Migrar dados locais
              </span>
              {!can("data_migration") && (
                <p className={styles.settingsGroupDesc}>Plano Pro necessárIO</p>
              )}
            </div>
            {!can("data_migration") && (
              <span className={styles.settingsGroupValue}>PRO</span>
            )}
          </div>
        )}
      </div>

      {/* Grupo 5: Sobre + Sair */}
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupRow} onClick={() => {}}>
          <span className={styles.settingIcon}>
            <PiInfoBold size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <span className={styles.settingsGroupLabel}>Sobre</span>
            <p className={styles.settingsGroupDesc}>v0.2.1 • © 2026 Rootio</p>
          </div>
        </div>
        <div className={styles.settingsGroupDropdown}>
          <div
            style={{
              padding: "8px 0",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--ink2)",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              Evolua com consistência, um dia de cada vez.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href="https://instagram.com/rootIOverso"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--ink2)", textDecoration: "none" }}
              >
                <PiInstagramLogoFill size={18} />
              </a>
              <a
                href="https://linkedin.com/company/rootIOverso"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--ink2)", textDecoration: "none" }}
              >
                <PiLinkedinLogoFill size={18} />
              </a>
            </div>
          </div>
        </div>
        <div
          className={`${styles.settingsGroupRow} ${styles.settingsGroupRowDanger}`}
          onClick={() =>
            isLoggedIn ? setShowLogoutModal(true) : setShowGuestExitModal(true)
          }
        >
          <span className={styles.settingIcon}>
            <PiUserCircleBold size={16} />
          </span>
          <span className={styles.settingsGroupLabel}>Sair da conta</span>
        </div>
      </div>

      {/* Logo fora dos grupos */}
      <div
        style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}
      >
        <img
          src="/icons/icon-yellow.svg"
          alt="Rootio"
          width={40}
          height={40}
          style={{ borderRadius: 8, opacity: 0.6 }}
        />
      </div>

      {showMigrationModal && (
        <MigrationModal
          userId={user?.id}
          onDone={() => setShowMigrationModal(false)}
        />
      )}

      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 320,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Tem certeza que deseja sair?
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink2)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Você será desconectado desta conta. Seus dados continuam salvos na
              nuvem e estarão disponíveis ao entrar novamente.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                justifyContent: "center",
                fontSize: 13,
                background: "#e74c3c",
                borderColor: "#c0392b",
              }}
              onClick={async () => {
                setShowLogoutModal(false);
                await signOut();
              }}
            >
              Sair da conta
            </button>
            <button
              type="button"
              className="btn"
              style={{
                justifyContent: "center",
                fontSize: 13,
                border: "1.5px solid var(--border)",
                color: "var(--ink3)",
              }}
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showGuestExitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 340,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Sair do modo local?
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink2)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Você está usando o app sem uma conta. Escolha o que fazer com seus
              dados:
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ justifyContent: "center", fontSize: 13 }}
              onClick={() => {
                setShowGuestExitModal(false);
                localStorage.removeItem("IOr_auth_skipped");
                window.location.reload();
              }}
            >
              Manter dados localmente
            </button>
            <button
              type="button"
              className="btn"
              style={{
                justifyContent: "center",
                fontSize: 13,
                background: "#fdf2f2",
                color: "#c0392b",
                borderColor: "#e74c3c",
              }}
              onClick={() => {
                setShowGuestExitModal(false);
                clearLocalData();
                localStorage.removeItem("IOr_auth_skipped");
                window.location.reload();
              }}
            >
              <PiTrashBold size={14} /> Apagar tudo e sair
            </button>
            <button
              type="button"
              className="btn"
              style={{
                justifyContent: "center",
                fontSize: 13,
                border: "1.5px solid var(--border)",
                color: "var(--ink3)",
              }}
              onClick={() => setShowGuestExitModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de apagar dados (LGPD) */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 340,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Apagar todos os dados?
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink2)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Esta ação irá apagar <strong>todos os seus dados</strong> do
              dispositivo e da nuvem permanentemente. Esta ação não pode ser
              desfeita.
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--ink3)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Inclui: hábitos, transações, metas, projetos, diárIO e
              configurações.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                justifyContent: "center",
                fontSize: 13,
                background: "#e74c3c",
                borderColor: "#c0392b",
              }}
              onClick={async () => {
                setShowDeleteModal(false);
                const result = await deleteAllData(user?.id);
                if (result.success) {
                  toast("Todos os dados foram apagados com sucesso.");
                  await signOut();
                } else {
                  toast("Erro ao apagar dados: " + result.errors.join(", "));
                }
              }}
            >
              <PiTrashBold size={14} /> Sim, apagar tudo
            </button>
            <button
              type="button"
              className="btn"
              style={{
                justifyContent: "center",
                fontSize: 13,
                border: "1.5px solid var(--border)",
                color: "var(--ink3)",
              }}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {legal.openDoc && (
        <LegalModal doc={legal.openDoc} onClose={legal.close} />
      )}
    </div>
  );
}
