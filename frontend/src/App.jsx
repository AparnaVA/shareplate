import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateDonation from "./pages/CreateDonation";
import MyDonations from "./pages/MyDonations";
import AvailableDonations from "./pages/AvailableDonations";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-donation" element={
    <ProtectedRoute allowedRole="DONOR">
      <CreateDonation />
    </ProtectedRoute>
  } />
        <Route path="/my-donations"  element={
    <ProtectedRoute allowedRole="DONOR">
      <MyDonations />
    </ProtectedRoute>
  } />
        <Route path="/donations" element={
    <ProtectedRoute allowedRole="NGO">
      <AvailableDonations />
    </ProtectedRoute>
  } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;