import express from "express";
import {
  bookVisit,
  cancelBooking,
  createUser,
  getAllBookings,
  getAllFavorites,
  toFav,
  getProfile,
  updateProfile,
} from "../controllers/userCntrl.js";
// import jwtCheck from "../config/auth0Config.js";
const router = express.Router();

// Simplified routes without authentication for now
router.post("/register", createUser);
router.post("/bookVisit/:id", bookVisit);
router.post("/allBookings", getAllBookings);
router.post("/removeBooking/:id", cancelBooking);
router.post("/toFav/:rid", toFav);
router.post("/allFav/", getAllFavorites);
// Profile routes (demo, no auth middleware)
router.post("/profile/get", getProfile);
router.post("/profile/update", updateProfile);
export { router as userRoute };