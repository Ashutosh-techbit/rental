import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
     domain="dev-unwib2uznmp1ymj4.us.auth0.com"
     clientId="nxnI7UmTSQ0f8V5ZuoFxMwdot43ryb45"
     authorizationParams={{
      redirect_uri: "http://localhost:5173/",
      scope: "openid profile email"
      // Note: audience removed - add it back if you configure an API in Auth0
      // audience: "http://localhost:8000"
     }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
