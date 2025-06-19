import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/components/AuthModal.module.scss";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginInputRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (mode === "login" && loginInputRef.current) {
      loginInputRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setAnimateIn(true), 20);
      setError("");
      setSuccess("");
      setPassword("");
    } else {
      setAnimateIn(false);
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login") {
      if (!loginField || !password) {
        setError("Потрібно ввести логін/email/телефон та пароль");
        return;
      }
      try {
        await login(loginField, password);
        setSuccess("Вхід успішний");
        router.push("/campaigns");
        onClose();
      } catch (err) {
        setError(err.response?.data?.error || "Помилка авторизації");
      }
    } else {
      if (!username || !password || (!email && !phone)) {
        setError("Потрібно ввести логін, пароль і хоча б email або телефон");
        return;
      }
      try {
        await register({
          username,
          password,
          email: email || null,
          phone: phone || null,
          nickname: nickname || username,
        });

        setSuccess("Реєстрація успішна. Тепер увійдіть.");
        setMode("login");
        setLoginField(username);
        setPassword("");
      } catch (err) {
        setError(err.response?.data?.error || "Помилка реєстрації");
      }
    }
  };

  return (
    <div className={`${styles.overlay} ${animateIn ? styles.active : ""}`}>
      <div className={`${styles.modal} ${animateIn ? styles.active : ""}`}>
        <button className={styles.close} onClick={onClose}>×</button>

        <div className={styles.content}>
          <h2>{mode === "login" ? "Вхід" : "Реєстрація"}</h2>

          <form onSubmit={handleSubmit}>
            {mode === "login" ? (
              <input
                type="text"
                placeholder="Email / Телефон / Логін"
                value={loginField}
                onChange={(e) => setLoginField(e.target.value)}
                ref={loginInputRef}
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Логін (username)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Телефон (необов'язково)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Нікнейм (необов'язково)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </>
            )}

            {/* Пароль з кнопкою показу/приховування */}
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
              >
                <img
                  src={
                    showPassword
                      ? "/icons/close_password.svg"
                      : "/icons/open_password.svg"
                  }
                  alt={showPassword ? "Сховати пароль" : "Показати пароль"}
                  className={styles.eyeIcon}
                />
              </button>
            </div>

            <button
              type="submit"
              className={`${styles.secondaryButton} ${mode === "register" ? styles.wide : ""}`}
            >
              <span>{mode === "login" ? "Увійти" : "Зареєструватись"}</span>
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <div className={styles.switch}>
            {mode === "login" ? (
              <p>
                Немає акаунту?{" "}
                <span onClick={() => setMode("register")}>Зареєструватись</span>
              </p>
            ) : (
              <p>
                Вже маєш акаунт?{" "}
                <span onClick={() => setMode("login")}>Увійти</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
