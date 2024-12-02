"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/page.module.css";
import NavBar from "@/components/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((response) => response.json())
      .then((data) => setMessage(data.people[0] + ": " + data.message));
  }, []);
  return (
    <div>
      <header>
        <NavBar />
      </header>
      <main className={styles.mainWrapper}>
        <Hero />
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
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Footer />
      </footer>
    </div>
  );
}
