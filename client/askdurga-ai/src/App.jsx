import { RouterProvider } from "react-router-dom";
import "./App.css";
import RouterSection from "./sections/router";

function App() {
  return <RouterProvider router={RouterSection} />
}

export default App;
