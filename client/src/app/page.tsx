"use client";

import React, { useState, useEffect } from "react";
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
    <div className={styles.heroContainer}>
      <div className={styles.hero_wrapper}>
        {/* <h2>Your Problem</h2> */}
        <div className={styles.hero_image}></div>
        {/* <h2>Our Solution</h2> */}
      </div>

      {/*DnD*/}
      <div className={styles.input_container}>
        <h3>Upload Your Problem</h3>
        <FileUploader
          handleChange={handleChange}
          name="file"
          types={fileTypes}
          multiple={false}
          maxSize={2}
          uploadedLabel="Uploaded Successfully! "
        />
        {file && (
          <>
            <h5>Uploaded File: </h5>
            <Image
              src={URL.createObjectURL(file)}
              alt={file.name}
              height={400}
              width={500}
            />
          </>
        )}
      </div>

      <div className={styles.input_container_mobile}>
        <h3>Select Your Problem</h3>
        <input
          type="file"
          id="images"
          accept="image/*"
          onChange={(e) => handleChange(e.target.files![0])}
          className={styles.input_button}
          required
        />
        {file && (
          <>
            <h5>Selected File: </h5>
            <Image
              src={URL.createObjectURL(file)}
              alt={file.name}
              height={200}
              width={300}
            />
          </>
        )}
      </div>
      <InputField file={file} />
    </div>
  );
}

interface InputFieldProps {
  file: File | null;
}

function InputField({ file }: InputFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [submitStatus, setSubmitStatus] = useState(false);

  useEffect(() => {
    if (file) {
      setInputValue("1 + 2(3 * (4 / 5))");
    }
  }, [file]);

  function isDisabled() {
    if (inputValue.trim() === "") {
      return true;
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInputValue(inputValue.trim());
    // onSubmitUsername(event.currentTarget.elements.problem.value)
    setSubmitStatus(true);
  }

  return (
    <div className={styles.problem_container}>
      <h4>{file ? "Question Read" : "Or Enter Question Below"}:</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          id="problem"
          placeholder="Enter the question in Latex format"
          className={styles.problem}
          value={inputValue}
          onChange={(evt) => setInputValue(evt.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isDisabled()}
        >
          Submit
        </button>
      </form>
      {submitStatus && <SolutionField data={inputValue} />}
    </div>
  );
}

interface SolutionFieldProps {
  data: string | null;
}

function SolutionField({ data }: SolutionFieldProps) {
  if (!data) return null;
  return (
    <div className={styles.solution_container}>
      {/* <hr style={{ width: "100%" }} /> */}
      <h4>Solution:</h4>
      <div className={styles.solution}>
        &nbsp;&nbsp;{data}
        <br />= 1 + 2(3 * 0.8)
        <br />= 1 + 2(2.4)
        <br />= 1 + 4.8
        <br />= 5.8
      </div>
    </div>
  );
}
