import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import styles from "@/styles/pages/HomePage.module.scss";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const { auth } = router.query;

    if (auth === "login" || auth === "register") {
      setAuthMode(auth);
      setAuthOpen(true);

      const { pathname, query } = router;
      delete query.auth;
      router.replace({ pathname, query }, undefined, { shallow: true });
    }
  }, [router]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles["blue-heading-hero"]}>D&D Платформа</h1>

          <p className={styles.sub}>
            Грай у Dungeons & Dragons онлайн з друзями
          </p>

          <button
            className={styles.imageButton}
            onClick={() => {
              if (user) {
                router.push("/campaigns");
              } else {
                setAuthMode("login");
                setAuthOpen(true);
              }
            }}
          >
            <span>{user ? "Почати пригоду" : "Приєднатись"}</span>
          </button>
        </div>
      </section>

      <section id="info" className={styles.infoSection}>
        <h2 className="blue-heading-xl">Що таке D&D Платформа?</h2>
        <p className="blue-subtitle">
          Це платформа для гри у Dungeons & Dragons онлайн з мапами, персонажами
          та інструментами Майстра підземелля.
        </p>
      </section>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
