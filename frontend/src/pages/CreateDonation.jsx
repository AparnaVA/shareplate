import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import "./CreateDonation.css";

function CreateDonation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    food_name: "",
    description: "",
    quantity: "",
    unit: "packets",
    pickup_location: "",
    expiry_time: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      const donationData = {
        ...formData,
        quantity: Number(formData.quantity),
        expiry_time: new Date(formData.expiry_time).toISOString(),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/donations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(donationData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || "Unable to create donation"
        );
      }

      setSuccessMessage("Donation created successfully!");

      setFormData({
        food_name: "",
        description: "",
        quantity: "",
        unit: "packets",
        pickup_location: "",
        expiry_time: "",
      });

      setTimeout(() => {
        navigate("/my-donations");
      }, 1000);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="donation-page">
      <div className="donation-card">
        <Link to="/my-donations" className="back-link">
          ← Back to My Donations
        </Link>

        <h1>Share Food</h1>

        <p className="donation-subtitle">
          Add available food so nearby organizations can claim it.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="food_name">Food name</label>
            <input
              id="food_name"
              type="text"
              name="food_name"
              value={formData.food_name}
              onChange={handleChange}
              placeholder="Example: Vegetable meals"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the food and its condition"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                id="unit"
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="packets"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pickup_location">
              Pickup location
            </label>
            <input
              id="pickup_location"
              type="text"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleChange}
              placeholder="Enter pickup location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiry_time">Available until</label>
            <input
              id="expiry_time"
              type="datetime-local"
              name="expiry_time"
              value={formData.expiry_time}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="donation-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Donation"}
          </button>
        </form>

        {errorMessage && (
          <p className="message error-message">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="message success-message">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateDonation;