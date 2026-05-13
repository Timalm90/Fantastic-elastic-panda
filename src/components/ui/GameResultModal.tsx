import { useEffect } from "react";
import Button from "./Button";
import styles from "./GameResultModal.module.css";

type GameResultModalProps = {
  score: number | null;
  onExit: () => void;
};

export default function GameResultModal({
  score,
  onExit,
}: GameResultModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onExit();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onExit]);

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-result-title"
      >
        <h2 id="game-result-title">Time’s up!</h2>

        <p>Your score: {score ?? "-"}</p>

        <Button onClick={onExit}>Exit</Button>
      </div>
    </div>
  );
}
