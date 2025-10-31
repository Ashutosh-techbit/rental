import React, { useContext, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { useMutation } from "react-query";
import { createUser } from "../../utils/api";
import useFavourites from "../../hooks/useFavourites";
import useBookings from "../../hooks/useBookings";

const Layout = () => {

  useFavourites()
  useBookings()

  const { isAuthenticated, user, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const { setUserDetails } = useContext(UserDetailContext);

  const { mutate } = useMutation({
    mutationKey: [user?.email],
    mutationFn: (token) => createUser(user?.email, token),
  });

  useEffect(() => {
    const getTokenAndRegsiter = async () => {
      try {
        // First try to get token silently (without popup)
        let token;
        try {
          // Try with audience first
          try {
            token = await getAccessTokenSilently({
              authorizationParams: {
                audience: "http://localhost:8000",
                scope: "openid profile email",
              },
            });
          } catch (audienceError) {
            // If audience fails (API not configured), try without audience
            console.warn("Failed with audience, trying without:", audienceError);
            token = await getAccessTokenSilently({
              authorizationParams: {
                scope: "openid profile email",
              },
            });
          }
        } catch (silentError) {
          // If silent retrieval fails (e.g., consent needed), try popup
          // Only if user is already authenticated
          if (isAuthenticated) {
            try {
              try {
                token = await getAccessTokenWithPopup({
                  authorizationParams: {
                    audience: "http://localhost:8000",
                    scope: "openid profile email",
                  },
                });
              } catch (audienceError) {
                // If audience fails, try without it
                console.warn("Popup failed with audience, trying without:", audienceError);
                token = await getAccessTokenWithPopup({
                  authorizationParams: {
                    scope: "openid profile email",
                  },
                });
              }
            } catch (popupError) {
              console.error("Failed to get access token:", popupError);
              // Don't throw - allow the app to continue without token for now
              return;
            }
          } else {
            return;
          }
        }

        localStorage.setItem("access_token", token);
        setUserDetails((prev) => ({ ...prev, token }));
        mutate(token);
      } catch (error) {
        console.error("Error getting token and registering user:", error);
      }
    };

    isAuthenticated && getTokenAndRegsiter();
  }, [isAuthenticated, user?.email, getAccessTokenSilently, getAccessTokenWithPopup, setUserDetails, mutate]);

  return (
    <>
      <div style={{ background: "var(--black)", overflow: "hidden" }}>
        <Header />
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
