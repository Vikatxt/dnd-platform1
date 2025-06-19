import TextChat from './TextChat'
import VoiceChat from './VoiceChat'
import styles from './SidebarLeft.module.scss'

export default function SidebarLeft({ messages, user }) {
  return (
    <div className={styles.sidebar}>
      <TextChat messages={messages} user={user} />
      <VoiceChat user={user} />
    </div>
  )
}
