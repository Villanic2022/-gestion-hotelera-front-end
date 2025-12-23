// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPage from "./pages/DashboardPage";
import HotelesPage from "./pages/HotelesPage";
import TiposHabitacionPage from "./pages/TiposHabitacionPage";
import HabitacionesPage from "./pages/HabitacionesPage";
import HuespedesPage from "./pages/HuespedesPage";
import ReservasPage from "./pages/ReservasPage";
import FacturasPage from "./pages/FacturasPage";
import UsuariosPage from "./pages/UsuariosPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
import "./styles/toast.css";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas (requieren login) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hoteles"
            element={
              <ProtectedRoute
              // allowedRoles={["ROLE_ADMIN"]}  // 👈 más adelante, si querés
              >
                <HotelesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tipos-habitacion"
            element={
              <ProtectedRoute
              // allowedRoles={["ROLE_ADMIN"]}
              >
                <TiposHabitacionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/habitaciones"
            element={
              <ProtectedRoute
              // allowedRoles={["ROLE_ADMIN"]}
              >
                <HabitacionesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/huespedes"
            element={
              <ProtectedRoute>
                <HuespedesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <ReservasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/facturas"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                <FacturasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />

          {/* Podrías agregar una ruta 404 más adelante */}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
