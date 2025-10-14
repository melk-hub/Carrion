import React from 'react';
import styles from "./Loading.module.css";

const Loading = ({ message = "Chargement..." }) => {
  return (
    <div className={styles["carrion-loading"]}>
      <div className={styles["loading-content"]}>
        <div className={styles["loading-spinner"]}></div>
        <h2>{message}</h2>
      </div>
    </div>
  );
};

export default Loading;

 
 