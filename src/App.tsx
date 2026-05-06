import { useState } from "react";
import { ApiTest } from "./dev/ApiTest";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Fantastic elastic panda</h1>
      <ApiTest />
    </>
  );
}

export default App;
