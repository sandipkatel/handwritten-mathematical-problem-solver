import styles from "@/styles/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>Infinity Math Solver</h3>
            <p className={styles.description}>
              A powerful tool to convert handwritten math expressions to LaTeX
              and solve them.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.title}>Quick Links</h3>
            <ul className={styles.links}>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.title}>Contact</h3>
            <p className={styles.contactInfo}>
              Email: teamByteBrahma@gmail.com
              <br />
              Phone: +1 (123) 456-7890
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
