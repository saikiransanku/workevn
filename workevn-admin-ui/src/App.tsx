import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminShell from "./components/layout/AdminShell";
import BookingsPage from "./pages/BookingsPage";
import DashboardPage from "./pages/DashboardPage";
import EarningsPage from "./pages/EarningsPage";
import NotFoundPage from "./pages/NotFoundPage";
import PartnersPage from "./pages/PartnersPage";
import RequestsPage from "./pages/RequestsPage";
import ReportsPage from "./pages/ReportsPage";
import DisputesPage from "./pages/DisputesPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import CancellationsPage from "./pages/CancellationsPage";
import VerificationPage from "./pages/VerificationPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="cancellations" element={<CancellationsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="disputes" element={<DisputesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
