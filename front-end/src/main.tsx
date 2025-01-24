import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Work from "./pages/Work";
import Layout from "./Layout";
import { PageSettingProvider } from "./contexts/pageSettingContext";
import Login from "./pages/Login";
import { AuthContextProvider } from "./contexts/authContext";
import Callback from "./pages/Login/Callback";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profie";
import Member from "./pages/Member";
import Retrospective from "./pages/Retrospective";
import MemberDetail from "./pages/Member/[discordId]";
import Status from "./pages/Status";

import("preline");

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ProtectedRoute element={<Dashboard />} /> },
      { path: "/work", element: <ProtectedRoute element={<Work />} /> },
      { path: "/profile", element: <ProtectedRoute element={<Profile />} /> },
      {path: "/member", element: <ProtectedRoute element={<Member />} />},
      {path: "/member/:discordId", element: <ProtectedRoute element={<MemberDetail />} />},
      {path: "/retrospective", element: <ProtectedRoute element={<Retrospective />} />},
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/callback",
    element: <Callback />,
  },
  {
    path:"/status",
    element: <Status />
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AuthContextProvider>
    <PageSettingProvider>
      <RouterProvider router={router} />
    </PageSettingProvider>
  </AuthContextProvider>
);
