import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-sarokar-mist bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-semibold text-govblue-dark">सरोकार</span>
          <span className="font-serif text-lg text-govblue-light">Sarokar</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 text-sm flex-wrap justify-end">
          <Link to="/consultations" className="hover:text-govblue transition-colors">
            Consultations
          </Link>
          {user && ['officer', 'admin'].includes(user.role) && (
            <Link to="/officer" className="hover:text-govblue transition-colors">
              Officer Desk
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/users" className="hover:text-govblue transition-colors">
              User management
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-ink/60">{user.name}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-govblue-dark border border-govblue-dark/30 rounded px-3 py-1.5 hover:bg-govblue-dark hover:text-paper transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-govblue transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-govblue-dark text-paper rounded px-3 py-1.5 hover:bg-govblue transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
