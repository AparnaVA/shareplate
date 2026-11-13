import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import "./MyDonations.css";

function MyDonations() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/donations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.detail || "Unable to load donations"
          );
        }

        setDonations(responseData);

      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [navigate]);

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="donations-page">
        <p className="loading-text">Loading your donations...</p>
      </div>
    );
  }

  return (
    <div className="donations-page">
      <div className="donations-container">

        <div className="donations-header">
          <div>
            <h1>My Donations</h1>
            <p>
              Manage the food donations you have shared.
            </p>
          </div>

          <Link
            to="/create-donation"
            className="create-donation-link"
          >
            + Create Donation
          </Link>
        </div>

        {errorMessage && (
          <div className="message error-message">
            {errorMessage}
          </div>
        )}

        {!errorMessage && donations.length === 0 && (
          <div className="empty-state">
            <h2>No donations yet</h2>
            <p>
              Start sharing food and help reduce food waste.
            </p>

            <Link
              to="/create-donation"
              className="create-donation-link"
            >
              Create your first donation
            </Link>
          </div>
        )}

        <div className="donation-grid">
          {donations.map((donation) => (
            <div
              className="donation-item"
              key={donation.id}
            >
              <div className="donation-item-header">
                <h2>{donation.food_name}</h2>

                <span
                  className={`status-badge status-${donation.status.toLowerCase()}`}
                >
                  {donation.status}
                </span>
              </div>

              <p className="donation-description">
                {donation.description}
              </p>

              <div className="donation-details">
                <p>
                  <strong>Available:</strong>{" "}
                  {donation.available_quantity}{" "}
                  {donation.unit}
                </p>

                <p>
                  <strong>Pickup:</strong>{" "}
                  {donation.pickup_location}
                </p>

                <p>
                  <strong>Available until:</strong>{" "}
                  {formatDate(donation.expiry_time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyDonations;