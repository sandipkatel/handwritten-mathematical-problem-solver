"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/page.module.css";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((response) => response.json())
      .then((data) => setMessage(data.people[0] + ": " + data.message));
  }, []);
  return (
    <div>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper}>
          {/* <h2>Your Problem</h2> */}
          <div className={styles.heroImage}></div>
          {/* <h2>Our Solution</h2> */}
        </div>
        <div className={styles.inputContainer}>
          <span>Upload Your Problem</span>
          <label
            htmlFor="images"
            className={styles.dropContainer}
            id="dropcontainer"
          >
            <span className={styles.dropTitle}>Drop a image here</span>
            or
            <input
              type="file"
              id="images"
              accept="image/*"
              className={styles.inputButton}
              required
            />
          </label>
        </div>
        <div className={styles.inputContainerMobile}>
          <input
            type="file"
            id="images"
            accept="image/*"
            className={styles.inputButton}
            required
          />
        </div>
      </div>
      {/* {messagnone;*/}
      <div className={styles.problemContainer}>
        <h5>Question Read:</h5>
        <div className={styles.problem}>1 + 2(3 * (4 / 5))</div>
      </div>
      <div className={styles.solutionContainer}>
        <hr style={{ width: "100%" }} />
        <h5>Solution Generated:</h5>
        <div className={styles.solution}>
          &nbsp;&nbsp;1 + 2(3 * (4 / 5))
          <br />= 1 + 2(3 * 0.8)
          <br />= 1 + 2(2.4)
          <br />= 1 + 4.8
          <br />= 5.8
        </div>
      </div>
    </div>
  );
}
