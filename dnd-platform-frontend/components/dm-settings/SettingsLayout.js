import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import CampaignSettings from "./CampaignSettings";
import MapSettings from "./MapSettings";
import NPCSettings from "./NPCSettings";
import MapEditor from "./MapEditor";

import styles from "./SettingsLayout.module.scss";

export default function SettingsLayout() {
  const router = useRouter();
  const { id: campaignId } = router.query;
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [mapId, setMapId] = useState(null);
  const [npcs, setNpcs] = useState([]);
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNpcs = async (mapId) => {
    try {
      const res = await api.get(`/npc/${mapId}`);
      setNpcs(res.data);
    } catch {
      console.error("Помилка при завантаженні NPC");
    }
  };

  useEffect(() => {
    if (!campaignId || !user) return;

    const fetchData = async () => {
      try {
        const campaignRes = await api.get(`/campaigns/${campaignId}`);
        if (campaignRes.data.ownerId !== user.id) {
          router.push(`/campaigns/${campaignId}`);
          return;
        }

        setCampaign(campaignRes.data);

        const mapRes = await api.get(`/maps?campaignId=${campaignId}`);
        if (mapRes.data.length > 0) {
          const activeMap = mapRes.data[0];
          setMapId(activeMap.id);
          fetchNpcs(activeMap.id);
        }
      } catch {
        setError("Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, user, router]);

  if (loading) return <p className={styles.status}>Завантаження...</p>;
  if (error) return <p className={styles.statusError}>{error}</p>;
  if (!campaign) return null;

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Налаштування кампанії: {campaign.name}</h1>

      <CampaignSettings campaign={campaign} onUpdated={setCampaign} />

      {/* 🟦 Два стовпці: NPC зліва, карта справа */}
      <div className={styles.gridTwoCols}>
        <NPCSettings
          mapId={mapId}
          npcs={npcs}
          selectedNpc={selectedNpc}
          onSelectNpc={setSelectedNpc}
          onCreated={() => fetchNpcs(mapId)}
        />

        <MapSettings
          campaignId={campaignId}
          mapId={mapId}
          onUploaded={setMapId}
          onActivated={() => alert("Мапу активовано")}
          unifiedButtons // 🔹 новий пропс, щоб стилі були однакові
        />
      </div>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>Розстановка на мапі</h2>
        {mapId ? (
          <MapEditor
            campaignId={campaignId}
            isDM
            mode="setup"
            selectedNpc={selectedNpc}
            onPlaced={() => {
              setSelectedNpc(null);
              fetchNpcs(mapId);
            }}
            npcs={npcs}
            onSelectNpc={setSelectedNpc}
          />
        ) : (
          <p>Мапа не завантажена</p>
        )}
      </section>

      <section className={styles.blockCenter}>
        <h2 className={styles.blockTitle}>Початок гри</h2>
        <p className={styles.description}>Перехід до ігрової сцени для керування мапою та подіями.</p>
        <button
          className={styles.startButton}
          onClick={() => router.push(`/campaigns/${campaignId}/game`)}
        >
          Почати гру
        </button>
      </section>
    </div>
  );
}
