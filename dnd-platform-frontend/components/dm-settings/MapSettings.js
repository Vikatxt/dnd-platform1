import { useEffect, useState } from "react";
import api from "@/lib/api";
import styles from "./MapSettings.module.scss";

export default function MapSettings({ campaignId, onUploaded, onActivated, unifiedButtons }) {
  const [mapUrl, setMapUrl] = useState("");
  const [mapName, setMapName] = useState("");
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMaps = async () => {
    if (!campaignId) return;
    try {
      const res = await api.get(`/maps?campaignId=${campaignId}`);
      setMaps(res.data);
    } catch (err) {
      console.error("❌ Помилка завантаження мап:", err);
    }
  };

  const handleUploadMap = async (finalUrl) => {
    if (!mapName.trim()) {
      alert("Введіть назву мапи перед завантаженням.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/maps", {
        campaignId,
        imageUrl: finalUrl,
        name: mapName.trim(),
        width: 40,
        height: 30,
      });
      onUploaded?.(res.data.id);
      setMapUrl("");
      setMapName("");
      await fetchMaps();
    } catch (err) {
      console.error("❌ Upload map error:", err);
      alert("Помилка завантаження мапи: " + (err.response?.data?.error || "невідома помилка"));
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUpload = async () => {
    if (!mapUrl.trim()) {
      alert("Введіть посилання на зображення мапи");
      return;
    }

    try {
      // 🔧 Робимо простий запит GET без CORS-помилки
      await fetch(mapUrl.trim(), { method: "GET", mode: "no-cors" });

      // ✅ Завантажуємо без перевірки статусу
      await handleUploadMap(mapUrl.trim());
    } catch (err) {
      console.error("❌ Помилка зображення:", err);
      alert("Не вдалося завантажити зображення. Спробуйте інше джерело.");
    }
  };

  const handleToggleActive = async (map) => {
    setLoading(true);
    try {
      if (map.active) {
        await api.put(`/maps/${map.id}/deactivate`);
      } else {
        await api.put(`/maps/${map.id}/activate`);
        onActivated?.();
      }
      await fetchMaps();
    } catch (err) {
      console.error("❌ Toggle active map error:", err);
      alert("Помилка активації/деактивації мапи");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, isActive) => {
    if (isActive) {
      alert("Неможливо видалити активну мапу. Спочатку деактивуйте її.");
      return;
    }

    if (!confirm("Ви впевнені, що хочете видалити мапу?")) return;

    try {
      await api.delete(`/maps/${id}`);
      await fetchMaps();
    } catch (err) {
      const msg = err.response?.data?.error || "Не вдалося видалити мапу";
      alert(msg);
      console.error("❌ Delete map error:", err);
    }
  };

  useEffect(() => {
    if (campaignId) fetchMaps();
  }, [campaignId]);

  return (
    <section className={styles.block}>
      <h2 className={styles.blockTitle}>Карта</h2>

      <label htmlFor="mapName">Назва мапи</label>
      <input
        id="mapName"
        type="text"
        placeholder="Назва мапи"
        value={mapName}
        onChange={(e) => setMapName(e.target.value)}
        className={styles.input}
        disabled={loading}
      />

      <label htmlFor="mapUrl">Посилання на зображення мапи</label>
      <input
        id="mapUrl"
        type="text"
        placeholder="Вставте URL"
        value={mapUrl}
        onChange={(e) => setMapUrl(e.target.value)}
        className={styles.input}
        disabled={loading}
      />

      <div className={styles.buttons}>
        <button
          onClick={handleDirectUpload}
          className={unifiedButtons ? styles.buttonPrimary : styles.buttonSecondary}
          disabled={loading}
        >
          {loading ? "Завантаження..." : "Завантажити"}
        </button>
      </div>

      {maps.length > 0 && (
        <div className={styles.mapList}>
          <h3 className={styles.mapListTitle}>Існуючі мапи</h3>
          {maps.map((map) => (
            <div key={map.id} className={styles.mapItem}>
              <span className={styles.mapName}>
                {map.name || "Без назви"} ({map.width}x{map.height})
              </span>
              <div className={styles.mapActions}>
                <button
                  className={map.active ? styles.buttonSecondary : styles.buttonPrimary}
                  onClick={() => handleToggleActive(map)}
                  disabled={loading}
                >
                  {map.active ? "Деактивувати" : "Активувати"}
                </button>
                <button
                  className={styles.buttonSecondary}
                  onClick={() => handleDelete(map.id, map.active)}
                  disabled={loading}
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
