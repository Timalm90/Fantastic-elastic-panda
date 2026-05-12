import { useEffect, useState } from "react";
import { api } from "../api";
import { getIdentityTokenFromUrl } from "../utils/identityToken";
import type { IdentityUser } from "../api/types";

export function ApiTest() {
  const [player, setPlayer] = useState<IdentityUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      const t = getIdentityTokenFromUrl();

      if (!t) {
        setError("No token found. Open via Tivoli.");
        return;
      }

      setToken(t);

      try {
        const identity = await api.getIdentity(t);
        setPlayer(identity.user);
      } catch {
        setError("Token expired. Go back to Tivoli.");
      }
    }

    void load();
  }, []);

  async function handlePay(): Promise<void> {
    if (!token) return;

    try {
      const receipt = await api.createTransaction({
        identity_token: token,
        amount: 5,
        amusement_uuid: import.meta.env.VITE_AMUSEMENT_UUID,
      });

      setStamp(receipt.stamp);
      console.log("Transaction ID:", receipt.id);
    } catch {
      setError("Transaction failed. Try again from Tivoli.");
    }
  }

  if (error) return <p>{error}</p>;
  if (!player) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>API Test (New)</h1>

      <p>Welcome {player.name}</p>

      <button onClick={handlePay}>Pay €5</button>

      {stamp && <p>Stamp received: {stamp}</p>}
    </div>
  );
}
