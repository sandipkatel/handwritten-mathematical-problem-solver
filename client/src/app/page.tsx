"use client";

import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import styles from "@/app/page.module.css";
import Image from "next/image";

export default function Home() {
  // const [message, setMessage] = useState("Loading...");

  // useEffect(() => {
  //   fetch("http://localhost:8080/")
  //     .then((response) => response.json())
  //     .then((data) => setMessage(data.people[0] + ": " + data.message));
  // }, []);
  const fileTypes = ["JPG", "PNG", "JPEG"];
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (file: File) => {
    setFile(file);
    console.log("File uploaded: ", file);
  };

  return (
    <div>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper}>
          {/* <h2>Your Problem</h2> */}
          <div className={styles.heroImage}></div>
          {/* <h2>Our Solution</h2> */}
        </div>

        {/*DnD*/}
        <div className={styles.inputContainer}>
          <h3>Upload Your Problem</h3>
          {file ? (
            <Image src={URL.createObjectURL(file)} alt={file.name} height={200} width={400} />
          ) : (
            <FileUploader
              handleChange={handleChange}
              name="file"
              types={fileTypes}
              multiple={false}
              maxSize={2}
              uploadedLabel="Uploaded Successfully! "
            />
          )}
        </div>

        <div className={styles.inputContainerMobile}>
          <h3>Select Your Problem</h3>
          {file ? (
            <Image src={URL.createObjectURL(file)} alt={file.name} height={200} width={400} />
          ) : (
            <input
              type="file"
              id="images"
              accept="image/*"
              onChange={(e) => handleChange(e.target.files![0])}
              className={styles.inputButton}
              required
            />
          )}
        </div>
      </div>

      {file && (
        <>
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
        </>
      )}
    </div>
  );
}
