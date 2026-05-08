import { useState, useEffect } from "react";
import styles from "./Timer.module.css";

export default function Timer() {
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (count <= 0) return;

    const timeoutId = setTimeout(() => {
      setCount((count) => count - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [count]);

  return (
    <div className={styles.timerContainer}>
      <img
        className={styles.clockIcon}
        src="/src/assets/icons/clock-icon.svg"
        alt="Timer"
      />
      <h1 className={`${styles.timer} ${count <= 5 ? styles.warning : ""}`}>
        0 : {count}
      </h1>
    </div>
  );
}
