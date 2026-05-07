import { useState, useEffect } from "react";
import styles from "./Timer.module.css";

export default function Timer() {
  const [count, setCount] = useState(30);

  useEffect(() => {
    if (count <= 0) return;

    const timeoutId = setTimeout(() => {
      setCount((count) => count - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [count]);

  return (
    <h1 className={`${styles.timer} ${count <= 5 ? styles.warning : ""}`}>
      Time left: {count}
    </h1>
  );
}
