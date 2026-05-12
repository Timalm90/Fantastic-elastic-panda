import Button from "./Button";
import styles from "./GameResultModal.module.css";

type GameResultModalProps = {
  score: number | null;
  onPlayAgain: () => void;
};

export default function GameResultModal({
  score,
  onPlayAgain,
}: GameResultModalProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>Time’s up!</h2>

        <p>Your score: {score ?? "-"}</p>

        <Button onClick={onPlayAgain}>Play Again</Button>
      </div>
    </div>
  );
}
