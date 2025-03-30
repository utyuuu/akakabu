import { RouteObject } from "react-router-dom";
import Login from "./routes/Login";
import Signin from "./routes/Signin";
import Home from "./routes/Home";
import Layout from "./components/Layout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signin", element: <Signin /> },
      { path: "/", element: <Home /> },
    ],
  },
];
