import styles from "./page.module.css";
import PersonalDetail from "./data";
import Image from "next/image";

export default function About() {
  return (
    <div className={styles.about}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>About Infinity</h1>
        <p className={styles.heroSubtitle}>
          Pioneering AI Solutions from Nepal
        </p>
      </section>

      <div className={styles.content}>
        <section className={styles.vision}>
          <h2 className={styles.sectionTitle}>Our Vision</h2>
          <p>
            Infinity emerges as a dynamic technological powerhouse, born from
            the collective passion and innovative spirit of four exceptional
            Computer Engineering students from Pulchowk Engineering Campus. Our
            journey is driven by a singular mission: to transform the
            technological landscape through groundbreaking artificial
            intelligence solutions that address complex challenges and unlock
            unprecedented potential.
          </p>
        </section>

        <section className={styles.philosophy}>
          <h2 className={styles.sectionTitle}>Company Philosophy</h2>
          <p>
            In a world rapidly evolving through technological innovation,
            Infinity stands at the intersection of creativity, technical
            expertise, and visionary thinking. We believe that artificial
            intelligence is not just a tool, but a transformative force capable
            of solving real-world problems, enhancing human capabilities, and
            creating meaningful impact across various sectors.
          </p>
        </section>

        <section className={styles.team}>
          <h2 className={styles.sectionTitle}>Meet the Team</h2>
          <div className={styles.teamGrid}>
            {PersonalDetail.map((person, index) => (
              <div className={styles.teamMember} key={index}>
                <div className={styles.memberImageContainer}>
                  <Image
                    src={person.imgUrl || "/placeholder.svg"}
                    alt={person.name}
                    className={styles.memberImage}
                    width={200}
                    height={200}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{person.name}</h3>
                  <p className={styles.memberPosition}>{person.position}</p>
                  <p className={styles.memberDescription}>
                    {person.name.split(" ")[0]} {person.workInfo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.future}>
          <h2 className={styles.sectionTitle}>Our Commitment and Future</h2>
          <p>
            Infinity is more than a technology company; we are a collective of
            passionate innovators committed to pushing the boundaries of what's
            possible. Our focus extends beyond mere technological development -
            we aim to create AI solutions that are ethical, inclusive, and
            genuinely transformative.
          </p>
          <p>We are dedicated to:</p>
          <ul className={styles.commitmentList}>
            <li>Developing cutting-edge AI technologies</li>
            <li>Creating solutions that address real-world challenges</li>
            <li>Fostering innovation in the Nepalese tech ecosystem</li>
            <li>Promoting responsible and ethical AI development</li>
          </ul>
          <p>
            As we continue to grow, our goal remains constant: to leverage
            artificial intelligence as a powerful tool for positive change,
            driving progress not just in Nepal, but on a global scale.
          </p>
        </section>
      </div>
    </div>
  );
}
