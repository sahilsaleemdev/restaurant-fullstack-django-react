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
import MenuManager from "./pages/menuManager";
import StaffManager from "./pages/StaffManager";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chef" element={<ChefDashboard />} /> 
        <Route path="/accountant" element={<AccountantDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu-manager" element={<MenuManager />} /> 
        <Route path="/staff" element={<StaffManager />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);