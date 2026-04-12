// src/pages/Login.jsx
// ══════════════════════════════════════════════════════
// IOROOT — Tela de Login / Cadastro
// Estilo visual alinhado com o brandbook.
// "Continuar sem conta" mantém o fluxo offline.
// ══════════════════════════════════════════════════════

import { useState } from "react";
import {
  PiEyeBold,
  PiEyeSlashBold,
  PiArrowLeftBold,
  PiLockKeyBold,
} from "react-icons/pi";
import { signIn, signUp, resetPassword } from "../services/supabase";

import styles from "./Login.module.css";

export default function Login({ onSkip }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  const [birthdate, setBirthdate] = useState("");

  // Drawer de termos
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isReset) {
      // Modo de recuperação de senha
      if (!email.trim()) {
        setError("Digite seu e-mail para recuperar a senha.");
        return;
      }

      setLoading(true);
      try {
        const { error: err } = await resetPassword(email);
        if (err) {
          const msg = err.message ?? "";
          if (
            msg.toLowerCase().includes("user not found") ||
            msg.toLowerCase().includes("email not registered")
          )
            setError(
              "E-mail não encontrado. Verifique se digitou corretamente ou crie uma conta.",
            );
          else if (
            msg.toLowerCase().includes("rate limit") ||
            msg.toLowerCase().includes("too many requests")
          )
            setError(
              "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
            );
          else setError(msg);
          return;
        }
        setSuccess(
          "E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (isSignup && !username.trim()) {
      setError("Digite um nome para o perfil.");
      return;
    }
    if (isSignup && !birthdate) {
      setError("Informe sua data de nascimento.");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { error: err } = await signUp({
          email,
          password,
          username,
          birthdate,
        });
        if (err) {
          const msg = err.message ?? "";
          const low = msg.toLowerCase();
          if (msg.includes("User already registered"))
            setError("Este e-mail já tem uma conta. Tente entrar.");
          else if (
            low.includes("rate limit") ||
            low.includes("too many requests")
          )
            setError(
              "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
            );
          else setError(msg);
          return;
        }
        setSuccess(
          "Conta criada! Verifique seu e-mail para confirmar o acesso.",
        );
      } else {
        const { error: err } = await signIn({ email, password });
        if (err) {
          const msg = err.message ?? "";
          if (msg.includes("Email not confirmed"))
            setError(
              "Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.",
            );
          else if (msg.includes("Invalid login credentials"))
            setError("E-mail ou senha incorretos.");
          else setError(msg);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo Neobrutalism */}
        <div className={styles.logoWrap}>
          <img src="/icons/logo.png" alt="Rootio" className={styles.logoImg} />
        </div>

        {/* Toggle login / cadastro (não mostra no modo reset) */}
        {!isReset && (
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!isSignup ? styles.toggleActive : ""}`}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${isSignup ? styles.toggleActive : ""}`}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              Criar conta
            </button>
          </div>
        )}

        {/* Formulário */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {isReset && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
            >
              <PiArrowLeftBold size={16} />
              Voltar para login
            </button>
          )}

          {isSignup && (
            <div className={styles.field}>
              <label className={styles.label}>Nome</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Como quer ser chamado"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
                maxLength={40}
              />
            </div>
          )}

          {isSignup && (
            <div className={styles.field}>
              <label className={styles.label}>Data de nascimento</label>
              <input
                className={styles.input}
                type="date"
                placeholder="DD/MM/AAAA"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                autoComplete="bday"
                max={new Date().toISOString().split("T")[0]}
              />
              <p
                style={{
                  fontSize: 11,
                  color: "#000",
                  margin: "4px 0 0 0",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                Você deve ter pelo menos 13 anos para criar uma conta.
              </p>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>
              {isReset ? "E-mail da conta" : "E-mail"}
            </label>
            <input
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {!isReset && (
            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  type={showPass ? "text" : "password"}
                  placeholder={isSignup ? "Mínimo 6 caracteres" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? (
                    <PiEyeSlashBold size={16} />
                  ) : (
                    <PiEyeBold size={16} />
                  )}
                </button>
              </div>
            </div>
          )}

          {success && <p className={styles.success}>{success}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "Aguarde..."
              : isReset
                ? "Enviar e-mail de recuperação"
                : isSignup
                  ? "Criar conta"
                  : "Entrar"}
          </button>
        </form>

        {/* Link esqueceu senha (só mostra no modo login) */}
        {mode === "login" && (
          <button
            type="button"
            className={styles.forgotBtn}
            onClick={() => {
              setMode("reset");
              setError("");
              setSuccess("");
            }}
          >
            Esqueceu a senha?
          </button>
        )}

        {/* Divider */}
        <div className={styles.divider}>
          <span>ou</span>
        </div>

        {/* Continuar sem conta */}
        <button type="button" className={styles.skipBtn} onClick={onSkip}>
          Usar sem conta (modo local)
        </button>
      </div>

      {/* Alert de privacidade - card separado fora do card principal */}
      <div className={styles.privacyAlert}>
        <PiLockKeyBold size={18} />
        <p>
          Ao continuar, você concorda com nossa{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              setDrawerContent("privacidade");
              setDrawerOpen(true);
            }}
          >
            <strong>Política de Privacidade</strong>
          </button>
          ,{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              setDrawerContent("termos");
              setDrawerOpen(true);
            }}
          >
            <strong>Termos de Uso</strong>
          </button>{" "}
          e{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              setDrawerContent("lgpd");
              setDrawerOpen(true);
            }}
          >
            <strong>LGPD</strong>
          </button>
          . Dados protegidos pela LGPD.
        </p>
      </div>

      {/* Drawer de termos */}
      {drawerOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setDrawerOpen(false)}
        >
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>
                {drawerContent === "privacidade" && "Política de Privacidade"}
                {drawerContent === "termos" && "Termos de Uso"}
                {drawerContent === "lgpd" && "LGPD"}
              </h3>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setDrawerOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.drawerContent}>
              {drawerContent === "privacidade" && (
                <p>
                  1. Dados coletados: Nós coletamos apenas e-mail, nome e dados de
                  uso do aplicativo necessários para o funcionamento da
                  plataforma Rootio. 2. Uso dos dados: Seus dados são usados
                  exclusivamente para personalizar sua experiência, enviar
                  notificações de progresso e melhorar o produto. 3.
                  Compartilhamento: Não vendemos, alugamos ou compartilhamos seus
                  dados com terceiros para fins comerciais. 4. Armazenamento de
                  Dados: Dados são armazenados com criptografia via Supabase em servidores
                  seguros. Retenção máxima de 2 anos após inatividade. 5. Seus
                  direitos: Você pode solicitar exclusão, exportação ou correção
                  dos seus dados a qualquer momento excluindo seus dados no aplicativo.
                </p>
              )}
              {drawerContent === "termos" && (
                <p>
                  1. Ao aceitar usar o Rootio, você concorda com estes termos.
                  Caso não concorde, não utilize o serviço. 2. Uso permitido O
                  Rootio é uma ferramenta de desenvolvimento pessoal. É proibido
                  usar a plataforma para fins ilícitos ou prejudiciais a
                  terceiros. 3. Conta Você é responsável pela segurança da sua
                  conta e por todas as atividades realizadas nela. 4. O plano gratuito permite até 10 hábitos ativos.
                  Recursos adicionais estão disponíveis no plano Pro. 5. Podemos alterar estes termos com aviso prévio..
                </p>
              )}
              {drawerContent === "lgpd" && (
                <p>
                  Lei 13.709/2018 O Rootio opera em conformidade com a Lei Geral
                  de Proteção de Dados do Brasil (LGPD). Base legal O tratamento
                  dos seus dados tem como base legal o legítimo interesse e o
                  consentimento explícito obtido no momento do cadastro.
                  A Ioverso (Startup) possui CNPJ em processo de
                  atualização. Responsável pelo tratamento dos dados pessoais
                  dos usuários. <br></br>DPO Encarregado de dados: Gabriel Augusto -
                  gscontatoec@gmail.com <br></br>Seus direitos (Art. 18) Acesso · Correção ·
                  Anonimização · Portabilidade · Eliminação · Revogação do
                  consentimento.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
