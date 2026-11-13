import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SharePlate
        </Link>

        <div className="navbar-links">
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-register">
                Register
              </Link>
            </>
          )}

          {user?.role === "DONOR" && (
            <>
              <Link to="/my-donations">
                My Donations
              </Link>

              <Link to="/create-donation">
                Share Food
              </Link>
            </>
          )}

          {user?.role === "NGO" && (
            <Link to="/donations">
              Available Donations
            </Link>
          )}

          {user && (
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;