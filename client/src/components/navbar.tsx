"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/navbar.module.css";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  return (
    <div className={styles.navbarContainer}>
      <nav>
        <Link href="/" className="link">
          <div className={styles.logoContainer}>
            <Image
              src="/favicon.ico"
              alt="infinity logo"
              width={32}
              height={32}
            />
            <h2><span className="brand">Infinity</span> <span className="brandModel">Math Problem Solver</span></h2>
          </div>
        </Link>
      </nav>
      <div className={styles.themeSwitch}>
        <label className={styles.switch}>
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
}
