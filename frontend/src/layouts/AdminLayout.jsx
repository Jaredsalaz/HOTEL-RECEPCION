import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';

/**
 * AdminLayout - Layout para panel de administración
 * Incluye sidebar lateral y navbar superior
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar superior */}
      <AdminNavbar toggleSidebar={toggleSidebar} />
      
      <div className="flex">
        {/* Sidebar lateral */}
        <AdminSidebar isOpen={sidebarOpen} />
        
        {/* Contenido principal */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } mt-16 p-6`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
