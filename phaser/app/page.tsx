import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from './page.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className='text-3xl font-bold underline'>
        Hello world!
      </h1>
      <div id="phaserTest">
        <p>Testing PhaserJS</p>
      </div>
    </main>
  )
}

