import "./index.css";
import "./App.css";
import Form from "./modules/Form";
import Dashboard from "./modules/Dashboard";
import { Routes, Route, Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('user:token') !== null || true;
  console.log(isLoggedIn, "isLoggedIn")

  if (!isLoggedIn) {
    return <Navigate to="/users/sign_in" />
  }
  else if (isLoggedIn && ['/users/sign_in', '/users/sign_up'].includes(window.location.pathname)) {
    return <Navigate to="/" />
  }
}
function App() {
  return (
    // <div className="bg-[#edf4ff] h-screen flex justify-center items-center">
    //   <Dashboard />
    // </div>
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/users/sign_in" element={
        <ProtectedRoute>
          <Form isSignInPage={false} />
        </ProtectedRoute>
      }
      />
      <Route path="/users/sign_up" element={
        <ProtectedRoute>
          <Form isSignInPage={true} />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
