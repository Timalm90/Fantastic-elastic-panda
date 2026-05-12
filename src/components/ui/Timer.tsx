import { useState, useEffect } from "react";
import styles from "./Timer.module.css";

type TimerProps = {
  duration: number;
  isRunning: boolean;
  onComplete: () => void;
};

export default function Timer({ duration, isRunning, onComplete }: TimerProps) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    setCount(duration);
  }, [duration, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    if (count === 0) {
      onComplete();
      return;
    }

    const timeoutId = setTimeout(() => {
      setCount((currentCount) => currentCount - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [count, isRunning, onComplete]);

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
