import styles from "./Button.module.css";

export default function Button({ children, onClick, variant = "primary" }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}
