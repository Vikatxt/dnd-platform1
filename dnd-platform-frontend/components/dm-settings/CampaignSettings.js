import { useState } from "react";
import api from "@/lib/api";
import styles from "./CampaignSettings.module.scss";

export default function CampaignSettings({ campaign, onUpdated }) {
  const [form, setForm] = useState({
    maxPlayers: campaign.maxPlayers,
    allowMulticlass: campaign.allowMulticlass,
    useHomebrew: campaign.useHomebrew,
    difficulty: campaign.difficulty,
    startLevel: campaign.startLevel,
    description: campaign.description || "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await api.put(`/campaigns/${campaign.id}`, form);
      onUpdated(res.data);
      setStatus("✅ Налаштування збережено");
    } catch {
      setStatus("❌ Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.block}>
      <h2 className={styles.blockTitle}>Загальні налаштування</h2>

      <label>Максимум гравців:</label>
      <input
        type="number"
        name="maxPlayers"
        min={1}
        max={20}
        value={form.maxPlayers}
        onChange={handleChange}
      />

      <label>
        <input
          type="checkbox"
          name="allowMulticlass"
          checked={form.allowMulticlass}
          onChange={handleChange}
        />
        Дозволити мультиклас
      </label>

      <label>
        <input
          type="checkbox"
          name="useHomebrew"
          checked={form.useHomebrew}
          onChange={handleChange}
        />
        Дозволити homebrew
      </label>

      <label>Складність:</label>
      <select name="difficulty" value={form.difficulty} onChange={handleChange}>
        <option value="EASY">Легка</option>
        <option value="NORMAL">Середня</option>
        <option value="HARD">Складна</option>
        <option value="INSANE">Божевільна</option>
      </select>

      <label>Початковий рівень:</label>
      <input
        type="number"
        name="startLevel"
        min={1}
        max={20}
        value={form.startLevel}
        onChange={handleChange}
      />

      <label>Опис кампанії:</label>
      <textarea
        name="description"
        className={styles.textarea}
        rows={6}
        value={form.description}
        onChange={handleChange}
        placeholder="Введіть сюжет, лор, вступну інформацію..."
      />

      <button onClick={handleSave} className={styles.saveButton} disabled={loading}>
        {loading ? "Збереження..." : "Зберегти налаштування"}
      </button>

      {status && <p className={styles.status}>{status}</p>}
    </section>
  );
}
