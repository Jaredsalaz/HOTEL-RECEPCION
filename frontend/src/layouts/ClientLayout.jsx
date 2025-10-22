import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * ClientLayout - Layout para vistas públicas del cliente
 * Incluye Navbar superior y Footer inferior
 */
const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar superior */}
      <Navbar />
      
      {/* Contenido principal - crece para ocupar espacio disponible */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer inferior */}
      <Footer />
    </div>
  );
};

export default ClientLayout;
