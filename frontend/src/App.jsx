import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateDonation from "./pages/CreateDonation";

function Home() {
  return <h1>Welcome to SharePlate</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-donation" element={<CreateDonation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;