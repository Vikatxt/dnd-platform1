import styles from '@/styles/components/CharacterChoiceModal.module.scss'

export default function CharacterChoiceModal({ characters, onChoose, onCreateNew, onClose }) {
  const isEmpty = characters.length === 0

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>

        <h2 className={styles.title}>
          {isEmpty ? 'У вас ще немає персонажа' : 'Обери персонажа'}
        </h2>

        {isEmpty ? (
          <>
            <p className={styles.description}>
              Створіть персонажа, щоб приєднатися до гри.
            </p>
            <button className={styles.createBtn} onClick={onCreateNew}>
              Створити персонажа
            </button>
          </>
        ) : (
          <>
            <div className={styles.list}>
              {characters.map(char => (
                <div className={styles.characterCard} key={char.id}>
                  <div>
                    <strong>{char.name}</strong><br />
                    {char.class}, {char.race}, рівень {char.level}
                  </div>
                  <button className={styles.chooseBtn} onClick={() => onChoose(char.id)}>
                    Обрати
                  </button>
                </div>
              ))}
            </div>
            <button className={`${styles.createBtn} ${styles.secondary}`} onClick={onCreateNew}>
              ➕ Створити нового персонажа
            </button>
          </>
        )}
      </div>
    </div>
  )
}
