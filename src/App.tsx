import { useState } from "react";
import { ApiTest } from "./dev/ApiTest";
import Timer from "./components/ui/Timer";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Fantastic elastic panda</h1>
      <ApiTest />
      <Timer />
    </>
  );
}

export default App;
