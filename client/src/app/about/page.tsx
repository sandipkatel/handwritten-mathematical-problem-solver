import styles from "./page.module.css";
import PersonalDetail from "./data";
import Image from "next/image";

export default function About() {
  return (
    <div className={styles.about}>
      <h2 className={styles.head}>
        About Infinity: Pioneering AI Solutions from Nepal
      </h2>
      <div className={`${styles.vision} ${styles.content}`}>
        <h3 className="gradient-text">Our Vision</h3>
        <hr/>
        <p>
          Infinity emerges as a dynamic technological powerhouse, born from the
          collective passion and innovative spirit of four exceptional Computer
          Engineering students from Pulchowk Engineering Campus. Our journey is
          driven by a singular mission: to transform the technological landscape
          through groundbreaking artificial intelligence solutions that address
          complex challenges and unlock unprecedented potential.
        </p>
      </div>
      <div className={`${styles.philosophy} ${styles.content}`}>
        <h3 className="gradient-text">Company Philosophy</h3>
        <hr/>
        <p>
          In a world rapidly evolving through technological innovation, Infinity
          stands at the intersection of creativity, technical expertise, and
          visionary thinking. We believe that artificial intelligence is not
          just a tool, but a transformative force capable of solving real-world
          problems, enhancing human capabilities, and creating meaningful impact
          across various sectors.
        </p>
      </div>
      <div className={`${styles.teamWrapper} ${styles.content}`}>
        <h2 className="gradient-text">Meet the Team</h2>
        <div className={styles.teamContainer}>
          {PersonalDetail.map((person, index) => (
            <div className={styles.personContainer} key={index}>
              <Image
                src={person.imgUrl}
                alt={person.name}
                className={styles.personImg}
                width={200}
                height={200}
              />
              <div className={styles.personInfo}>
                <h4>{person.name}</h4>
                <p>
                  <h5>{person.position}</h5>
                </p>
                <p className={styles.workInfo}>{person.name.split(" ")[0]} {person.workInfo}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.future} ${styles.content}`}>
          <h3 className="gradient-text">Our Commitment and Future</h3>
          <hr/>
          <p>
            Infinity is more than a technology company; we are a collective of
            passionate innovators committed to pushing the boundaries of what&apos;s
            possible. Our focus extends beyond mere technological development &hyphen;
            we aim to create AI solutions that are ethical, inclusive, and
            genuinely transformative.
          </p>
          <p>We are dedicated to:</p>
          <ul>
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
        </div>
      </div>
    </div>
  );
}
