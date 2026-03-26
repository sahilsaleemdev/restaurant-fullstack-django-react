import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import ChefDashboard from "./pages/ChefDashboard";
import MenuManager from "./pages/MenuManager";
import StaffManager from "./pages/StaffManager";
import RequireAuth from "./components/RequireAuth";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/owner"
          element={
            <RequireAuth allowedRoles={["owner"]}>
              <OwnerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/menu-manager"
          element={
            <RequireAuth allowedRoles={["owner"]}>
              <MenuManager />
            </RequireAuth>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireAuth allowedRoles={["owner"]}>
              <StaffManager />
            </RequireAuth>
          }
        />
        <Route
          path="/chef"
          element={
            <RequireAuth allowedRoles={["chef"]}>
              <ChefDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/accountant"
          element={
            <RequireAuth allowedRoles={["accountant"]}>
              <AccountantDashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);