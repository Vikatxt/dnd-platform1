import styles from "@/styles/components/CampaignCard.module.scss";

export default function CampaignCard({ campaign, onClick }) {
  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const difficultyMap = {
    EASY: "Легка",
    NORMAL: "Середня",
    HARD: "Складна",
    INSANE: "Божевільна",
  };

  const booleanLabel = (value) => (value ? "Так" : "Ні");

  return (
    <div
      className={styles.card}
      onClick={() => onClick && onClick(campaign)} // 🔐 безпечний виклик
    >
      <div
        className={styles.image}
        style={{ backgroundImage: `url(${campaign.avatar})` }}
      />
      <div className={styles.content}>
        <div className={styles.infoBlock}>
          <h2 className={styles.title}>{campaign.name}</h2>
          <p className={styles.description}>{campaign.description}</p>
        </div>

        <div className={styles.footer}>
          <div className={styles.details}>
            <span>
              <strong>{campaign.playersCount}</strong> / {campaign.maxPlayers} гравців
            </span>
            <span>{campaign.isPublic ? "Публічна" : "Приватна"}</span>
          </div>

          <div className={styles.stats}>
            <span>DM: {campaign.dmName}</span>
            <span>Складність: {difficultyMap[campaign.difficulty] || campaign.difficulty}</span>
            <span>Homebrew: {booleanLabel(campaign.useHomebrew)}</span>
            <span>Multiclass: {booleanLabel(campaign.allowMulticlass)}</span>
          </div>

          <div className={styles.date}>
            Створено: {formatDate(campaign.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
