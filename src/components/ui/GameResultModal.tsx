import { useEffect } from "react";
import Button from "./Button";
import styles from "./GameResultModal.module.css";

type GameResultModalProps = {
  score: number | null;
  token: string | null;
  onExit: () => void;
};

export default function GameResultModal({
  score,
  token,
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

        {/* Show token if it exists */}
        {token ? (
          <p>
            You received: <strong>{token}</strong>
          </p>
        ) : (
          <p>Generating reward...</p>
        )}

        <Button onClick={onExit}>Exit</Button>
      </div>
    </div>
  );
}
