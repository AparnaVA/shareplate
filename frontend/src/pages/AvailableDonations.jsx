import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import "./AvailableDonations.css";

function AvailableDonations() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [requestedQuantities, setRequestedQuantities] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

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

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleQuantityChange = (donationId, value) => {
    setRequestedQuantities({
      ...requestedQuantities,
      [donationId]: value,
    });
  };

  const handleClaim = async (donation) => {
    const requestedQuantity = Number(
      requestedQuantities[donation.id]
    );

    setErrorMessage("");
    setSuccessMessage("");

    if (!requestedQuantity || requestedQuantity <= 0) {
      setErrorMessage(
        "Please enter a valid quantity to claim."
      );
      return;
    }

    if (requestedQuantity > donation.available_quantity) {
      setErrorMessage(
        `Only ${donation.available_quantity} ${donation.unit} available.`
      );
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    try {
      setClaimingId(donation.id);

      const response = await fetch(
        `${API_BASE_URL}/api/donations/${donation.id}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            requested_quantity: requestedQuantity,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || "Unable to claim donation"
        );
      }

      setSuccessMessage(
        `${donation.food_name} claimed successfully!`
      );

      setRequestedQuantities({
        ...requestedQuantities,
        [donation.id]: "",
      });

      await fetchDonations();

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setClaimingId(null);
    }
  };

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="available-page">
        <p className="loading-text">
          Loading available donations...
        </p>
      </div>
    );
  }

  return (
    <div className="available-page">
      <div className="available-container">

        <div className="available-header">
          <h1>Available Food Donations</h1>
          <p>
            Browse available food and claim what your
            organization needs.
          </p>
        </div>

        {errorMessage && (
          <div className="message error-message">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="message success-message">
            {successMessage}
          </div>
        )}

        {donations.length === 0 && !errorMessage && (
          <div className="empty-state">
            <h2>No donations available</h2>
            <p>
              Please check back later for new food donations.
            </p>
          </div>
        )}

        <div className="available-grid">
          {donations.map((donation) => (
            <div
              className="available-card"
              key={donation.id}
            >
              <h2>{donation.food_name}</h2>

              <p className="available-description">
                {donation.description}
              </p>

              <div className="available-details">
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

              <div className="claim-section">
                <label htmlFor={`quantity-${donation.id}`}>
                  Quantity to claim
                </label>

                <input
                  id={`quantity-${donation.id}`}
                  type="number"
                  min="1"
                  max={donation.available_quantity}
                  value={
                    requestedQuantities[donation.id] || ""
                  }
                  onChange={(event) =>
                    handleQuantityChange(
                      donation.id,
                      event.target.value
                    )
                  }
                  placeholder="Enter quantity"
                />

                <button
                  type="button"
                  className="claim-button"
                  onClick={() => handleClaim(donation)}
                  disabled={claimingId === donation.id}
                >
                  {claimingId === donation.id
                    ? "Claiming..."
                    : "Claim Food"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AvailableDonations;