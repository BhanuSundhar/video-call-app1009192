

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LoginPhone from "./pages/LoginPhone";
import LoginPassword from "./pages/LoginPassword";
import Dashboard from "./pages/Dashboard1";
import Call from "./pages/Call";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LoginPhone />}
        />

        <Route
          path="/password"
          element={<LoginPassword />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path = '/call'
          element = {<Call /> }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

