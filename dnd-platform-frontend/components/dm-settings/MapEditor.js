import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MapArea from "./MapArea";
import styles from "./MapEditor.module.scss";

export default function MapEditor({
  campaignId,
  isDM,
  mode = "setup",
  selectedNpc,
  onPlaced,
  npcs,
  onSelectNpc,
}) {
  const [map, setMap] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [fogMode, setFogMode] = useState("add");
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/maps?campaignId=${campaignId}`);
      if (res.data.length > 0) setMap(res.data[0]);

      const charRes = await api.get(`/characters/${campaignId}`);
      setCharacters(charRes.data);
    } catch (err) {
      console.error("Помилка при завантаженні карти чи персонажів:", err);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId && isDM) fetchData();
  }, [campaignId, isDM, fetchData]);

  if (!map) return <p className={styles.loading}>Завантаження мапи...</p>;

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.mapArea}>
        <MapArea
          campaignId={campaignId}
          isDM={isDM}
          selectedCharacter={selectedCharacter}
          selectedNpc={selectedNpc}
          onPlaced={onPlaced}
          fogMode={fogMode}
        />
      </div>

      <div className={styles.sidebar}>
        <h3 className={styles.sectionTitle}>Обрати персонажа</h3>
        <ul className={styles.characterList}>
          {characters.map((char) => (
            <li
              key={char.id}
              className={`${styles.characterItem} ${
                selectedCharacter?.id === char.id ? styles.active : ""
              }`}
              onClick={() => {
                setSelectedCharacter(char);
              }}
            >
              {char.name} ({char.class}, {char.race})
            </li>
          ))}
        </ul>

        <div className={styles.fogBlock}>
          <h4 className={styles.sectionTitle}>Туман війни</h4>
          <button
            className={styles.fogButton}
            onClick={() => setFogMode(fogMode === "add" ? "remove" : "add")}
          >
            {fogMode === "add" ? "Стерти туман" : "Додати туман"}
          </button>
        </div>

        <div className={styles.npcBlock}>
          <h4 className={styles.sectionTitle}>NPC</h4>
          <ul className={styles.characterList}>
            {npcs.map((npc) => (
              <li
                key={npc.id}
                className={`${styles.characterItem} ${
                  selectedNpc?.id === npc.id ? styles.active : ""
                }`}
                onClick={() => {
                  setSelectedCharacter(null);
                  onSelectNpc(npc);
                }}
              >
                {npc.name} <small>({npc.type})</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
