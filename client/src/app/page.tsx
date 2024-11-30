'use client';

import React, { useState, useEffect } from "react";
import styles from "@/app/page.module.css";
import NavBar from "@/components/navbar";
import Hero from "@/components/hero";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((response) => response.json())
      .then((data) => setMessage(data.people[0] + ": " + data.message));
  }, []);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="row-start-1 flex gap-6 items-center justify-center">
        <NavBar /></header>
      <main className={styles.mainWrapper}>
        <Hero />
        {message}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Footer
      </footer>
    </div>
  );
}
