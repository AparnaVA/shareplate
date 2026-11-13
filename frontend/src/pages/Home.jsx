import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const { user } = useContext(AuthContext);

  const getPrimaryLink = () => {
    if (!user) {
      return "/register";
    }

    if (user.role === "DONOR") {
      return "/create-donation";
    }

    return "/donations";
  };

  const getPrimaryText = () => {
    if (!user) {
      return "Join SharePlate";
    }

    if (user.role === "DONOR") {
      return "Share Food";
    }

    return "View Donations";
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tag">REDUCE FOOD WASTE</p>

          <h1>
            Good food should never go to waste.
          </h1>

          <p className="hero-description">
            SharePlate connects food donors with organizations
            that can put surplus food to good use.
          </p>

          <div className="hero-actions">
            <Link
              to={getPrimaryLink()}
              className="primary-button"
            >
              {getPrimaryText()}
            </Link>

            {!user && (
              <Link
                to="/login"
                className="secondary-button"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How SharePlate Works</h2>

        <div className="steps-container">
          <div className="step-card">
            <span className="step-number">01</span>
            <h3>Share Available Food</h3>
            <p>
              Food donors add details about surplus food
              that is available for pickup.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <h3>Find Food Nearby</h3>
            <p>
              Organizations can view available donations
              before they expire.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <h3>Claim What You Need</h3>
            <p>
              Organizations claim the quantity they need,
              helping reduce unnecessary food waste.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;