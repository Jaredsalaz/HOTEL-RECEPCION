import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Client Pages
import Home from './pages/client/Home';
import RoomCatalog from './pages/client/RoomCatalog';
import RoomDetail from './pages/client/RoomDetail';
import CheckInForm from './pages/client/CheckInFormEnhanced';
import Confirmation from './pages/client/Confirmation';
import MyReservations from './pages/client/MyReservations';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomManagement from './pages/admin/RoomManagement';
import ReservationManagement from './pages/admin/ReservationManagement';
import Reports from './pages/admin/Reports';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="rooms" element={<RoomCatalog />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="checkin/:roomId" element={<CheckInForm />} />
          <Route path="confirmation/:reservationId" element={<Confirmation />} />
          <Route path="my-reservations" element={<MyReservations />} />
        </Route>

        {/* Redirect /login to home (guests use modal in navbar) */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="reservations" element={<ReservationManagement />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
