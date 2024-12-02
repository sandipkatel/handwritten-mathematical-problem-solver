import styles from "@/styles/hero.module.css";

export default function Home() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroWrapper}>
        {/* <h2>Your Problem</h2> */}
        <div className={styles.heroImage}></div>
        {/* <h2>Our Solution</h2> */}
      </div>
      <div className={styles.inputContainer}>
        <span>Upload Image of Your Handwritten Problem Below:</span>
        <label
          htmlFor="images"
          className={styles.dropContainer}
          id="dropcontainer"
        >
          <span className={styles.dropTitle}>Drop a image here</span>
          or
          <input type="file" id="images" accept="image/*" className={styles.inputButton} required />
        </label>
      </div>
    </div>
  );
}
