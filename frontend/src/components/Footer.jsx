import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

/**
 * Footer Component - Pie de página para clientes
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info del hotel */}
          <div>
            <h3 className="text-xl font-bold mb-4">Hotel Reception</h3>
            <p className="text-gray-300 mb-4">
              Sistema de gestión hotelera profesional para check-in y check-out eficiente.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <FiPhone className="w-4 h-4" />
                <span>+52 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4" />
                <span>info@hotelreception.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                <span>Ciudad, País</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/rooms" className="hover:text-primary transition-colors">
                  Habitaciones
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-primary transition-colors text-xs">
                  🔒 Panel de Administración
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} Hotel Reception. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
