import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AffiliateSettings from './pages/AffiliateSettings';
import TelegramSettings from './pages/TelegramSettings';
import WhatsAppSettings from './pages/WhatsAppSettings';
import Groups from './pages/Groups';
import Subscription from './pages/Subscription';
import Billing from './pages/Billing';
import Help from './pages/Help';
import HowItWorks from './pages/HowItWorks';
import RelayLogs from './pages/RelayLogs';
import OnboardingNotice from './components/OnboardingNotice';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AppLayout from './layouts/AppLayout';

import { getToken } from './lib/api';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PrivateLayout() {
  return (
    <>
      <OnboardingNotice />
      <AppLayout />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="como-funciona" element={<HowItWorks />} />

        <Route path="affiliate" element={<AffiliateSettings />} />

        <Route path="telegram" element={<TelegramSettings />} />

        <Route path="whatsapp" element={<WhatsAppSettings />} />

        <Route path="groups" element={<Groups />} />

        <Route path="billing" element={<Billing />} />

        <Route path="billing/success" element={<Billing />} />

        <Route path="subscription" element={<Subscription />} />

        <Route path="relay-logs" element={<RelayLogs />} />

        <Route path="help" element={<Help />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
