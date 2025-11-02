import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import English from "./english";
import Layout from "../layout";

const RouterSection = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/english",
        element: <English />,
      },
    ],
  },
]);
export default RouterSection;
