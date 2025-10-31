import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { getUserProfile, updateUserProfile } from "../../utils/api";
import { toast } from "react-toastify"; // 1. IMPORT TOAST

const Profile = () => {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const { userDetails } = useContext(UserDetailContext);

  // Try to get token from context, localStorage, or Auth0
  const [token, setToken] = useState(userDetails?.token || localStorage.getItem("access_token") || null);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    phone: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Update token when userDetails changes or check localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (userDetails?.token) {
      setToken(userDetails.token);
    } else if (storedToken) {
      setToken(storedToken);
    }
  }, [userDetails?.token]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !token) return;
    let mounted = true;
    (async () => {
      try {
        const profile = await getUserProfile(user.email, token);
        if (!mounted) return;
        setForm({
          name: profile?.name || user?.name || "",
          gender: profile?.gender || "",
          phone: profile?.phone || "",
          image: profile?.image || user?.picture || "",
        });
      } catch (e) {
        // ignore; toast already shown in api
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.email, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, image: ev.target?.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  // 2. UPDATED THIS FUNCTION
  const handleSave = async (e) => {
    e?.preventDefault?.(); // Prevent any default form behavior
    
    if (!user?.email) {
      toast.error("User email not found. Please log in again.");
      return;
    }

    // Try to get token if we don't have one
    let accessToken = token || localStorage.getItem("access_token");
    
    if (!accessToken && isAuthenticated) {
      setTokenLoading(true);
      try {
        // Try to get token silently - first without audience, then with audience
        try {
          accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: "http://localhost:8000",
              scope: "openid profile email",
            },
          });
        } catch (audienceError) {
          // If audience fails, try without it (for basic auth)
          console.warn("Failed with audience, trying without:", audienceError);
          accessToken = await getAccessTokenSilently({
            authorizationParams: {
              scope: "openid profile email",
            },
          });
        }
        setToken(accessToken);
        localStorage.setItem("access_token", accessToken);
      } catch (tokenError) {
        console.error("Failed to get access token:", tokenError);
        toast.error("Failed to authenticate. Please try refreshing the page.");
        setTokenLoading(false);
        return;
      } finally {
        setTokenLoading(false);
      }
    }

    if (!accessToken) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(
        {
          email: user.email,
          name: form.name,
          gender: form.gender,
          phone: form.phone,
          image: form.image,
        },
        accessToken
      );
      
      // ADDED: Success feedback
      toast.success("Profile updated successfully!");

    } catch (err) {
      // ADDED: Error feedback
      toast.error("Failed to update profile. Please try again.");
      console.error(err); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="innerWidth paddings" style={{ color: "white" }}>
        <h2>You're not logged in</h2>
        <button className="button" onClick={loginWithRedirect}>Login</button>
      </div>
    );
  }

  return (
    <div className="innerWidth paddings" style={{ color: "white" }}>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <img
          src={form.image || user?.picture}
          alt="avatar"
          style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <h2 style={{ margin: 0 }}>{form.name || user?.name || user?.nickname || "User"}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>{user?.email}</p>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {userDetails?.bookings?.length || 0}
          </div>
          <div style={{ opacity: 0.8 }}>Bookings</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {userDetails?.favourites?.length || 0}
          </div>
          <div style={{ opacity: 0.8 }}>Favourites</div>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", maxWidth: 480 }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Edit profile</h3>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", background: "#0f0f0f", color: "#fff" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>Gender</span>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange} // <-- 3. CORRECTED TYPO
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", background: "#0f0f0f", color: "#fff" }}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>Phone</span>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. +1 555 555 5555"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", background: "#0f0f0f", color: "#fff" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>Profile image</span>
          <input type="file" accept="image/*" onChange={handleImageFile} />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Or paste an image URL"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", background: "#0f0f0f", color: "#fff" }}
          />
        </label>
        <div>
          <button 
            className="button" 
            onClick={handleSave} 
            disabled={loading || tokenLoading}
          >
            {loading || tokenLoading ? "Loading..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;