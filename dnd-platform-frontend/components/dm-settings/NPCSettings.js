import { useState } from "react";
import styles from "./NPCSettings.module.scss";

const initialStats = {
  HP: "", AC: "", STR: "", DEX: "", CON: "", INT: "", WIS: "", CHA: "",
  speed: "", initiative: ""
};

export default function NPCSettings({
  campaignId,
  onCreated,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [successMessage, setSuccessMessage] = useState("");

  const handleStatChange = (field, value) => {
    if (!/^\d*$/.test(value)) return;
    setStats((prev) => ({ ...prev, [field]: value }));
  };

  const createNpc = async () => {
    const required = ["HP", "AC", "STR", "DEX", "CON", "INT", "WIS", "CHA", "speed", "initiative"];
    const missing = required.filter((key) => !stats[key]);

    if (!name || !type) return alert("Імʼя та тип NPC є обовʼязковими");
    if (missing.length) return alert("Заповніть всі характеристики");

    try {
      const res = await fetch("http://localhost:5000/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          type,
          imageUrl,
          stats: Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, parseInt(v)])),
          campaignId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Помилка створення NPC");
      }

      setName("");
      setType("");
      setImageUrl("");
      setStats(initialStats);
      setSuccessMessage("✅ NPC успішно створено!");
      onCreated?.();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("❌ Помилка створення NPC:", err);
      alert(err.message || "Не вдалося створити NPC");
    }
  };

  return (
    <div className={styles.panel}>
      <h3>Створення NPC</h3>

      {successMessage && <div className={styles.success}>{successMessage}</div>}

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Імʼя" />
      <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Тип" />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL зображення" />

      <div className={styles.grid}>
        {Object.keys(initialStats).map((key) => (
          <input
            key={key}
            value={stats[key]}
            onChange={(e) => handleStatChange(key, e.target.value)}
            placeholder={key}
            className={styles.statInput}
          />
        ))}
      </div>

      <button onClick={createNpc}>Створити NPC</button>
    </div>
  );
}
