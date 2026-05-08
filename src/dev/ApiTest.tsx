import { useEffect, useState } from "react";
import { api } from "../api";
import type { User } from "../api/types";

export function ApiTest() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      const u = await api.getCurrentUser();
      setUser(u);
    }

    void load();
  }, []);

  async function handlePay(): Promise<void> {
    const receipt = await api.createTransaction({
      buyer: "user-1",
      seller: "group-fantastic-elastic-panda",
      amount: 5,
    });

    console.log("Stamp:", receipt.stamp);

    const updated = await api.getCurrentUser();
    setUser(updated);
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>API Test</h1>

      <p>
        {user.firstname} {user.lastname}
      </p>

      <p>Balance: €{user.saldo}</p>

      <p>Stamps: {user.stamps.join(", ") || "None"}</p>

      <button onClick={handlePay}>Pay €5</button>
    </div>
  );
}
