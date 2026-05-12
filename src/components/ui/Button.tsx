import styles from "./Button.module.css";

export default function Button({ 
  children, 
  onClick,
  variant = 'default'
}: { 
  children: React.ReactNode
  onClick: () => void
  variant?: string
}) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}