"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/navbar.module.css";

export default function NavBar() {
  return (
    <div className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoContainer}>
            <Image
              src="/favicon.ico"
              alt="infinity logo"
              className={styles.logo}
              width={32}
              height={32}
            />
            <h1 className={styles.logoText}>
              <span className={styles.brand}>Infinity</span>{" "}
              <span className={styles.brandModel}>Math Problem Solver</span>
            </h1>
          </div>
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
        </nav>
      </div>
    </div>
  );
}
