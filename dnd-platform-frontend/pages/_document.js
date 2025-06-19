// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="uk">
      <Head>
        {/* 🔷 Підключення Cormorant Infant + Literata з підтримкою кирилиці */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Infant:wght@400;500;600;700&family=Literata:wght@400;500;600;700&display=swap&subset=cyrillic-ext"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
