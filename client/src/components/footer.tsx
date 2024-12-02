import styles from "@/styles/footer.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className={styles.footerWrapper}>
      <div className={styles.footerUpper}>
        <Link href="/" className="link">
          <div className={styles.logoContainer}>
            <Image
              src="/favicon.ico"
              alt="infinity logo"
              width={32}
              height={32}
            />
            <h2>
              <span className="brand">Infinity</span>{" "}
            </h2>
          </div>
        </Link>
        <div className={styles.footerNav}>
        <Link href="/about" className="link">
          <h6>About Us</h6>
        </Link>
        <Link href="/" className="link">
          <h6>Other</h6>
        </Link>
        </div>
      </div>
        {/* <span className={styles.contact}>
            info@infinity.com
        </span> */}
      <div className={styles.footerLower}>
        <em>&copy; 2024 Infinity. All rights reserved.</em>
      </div>
    </div>
  );
}
