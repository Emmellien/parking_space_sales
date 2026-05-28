import { BrowserRouter, Routes,  Route} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import ParkingSlot from "./pages/PerkingSlot";
import Car from "./pages/CarManagement";
import ParkingRecord from "./pages/ParkingRecord";
import Payment from "./pages/Payment";
import Report from "./pages/Report";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
       
        

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ParkingSlot"
          element={
            <ProtectedRoute>
              <ParkingSlot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ParkingRecord"
          element={
            <ProtectedRoute>
              <ParkingRecord />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Car"
          element={
            <ProtectedRoute>
              <Car />
            </ProtectedRoute>
          }
        />
         <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

       

      </Routes>

    </BrowserRouter>
  );
}

export default App;