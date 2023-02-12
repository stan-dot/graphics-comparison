"use client";
import { Inter } from '@next/font/google';
import { useEffect } from 'react';
import { Display, loadPicture } from './loadPicture';
import styles from './page.module.css';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  useEffect(() => {
    loadPicture();
    // return () => { }
  }, [])

  return (
    <main className={styles.main}>
      <h1 className='text-3xl font-bold underline'>
        Hello world!
      </h1>
      <Display />
    </main>
  )
}

