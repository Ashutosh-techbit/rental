import asyncHandler from 'express-async-handler';
import { getDB, ObjectId } from "../config/mongoConfig.js";

// bookvisit for residency
export const bookVisit = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email, date } = req.body;
  const { id } = req.params;

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      await usersCollection.insertOne({
        email,
        name: email.split('@')[0],
        bookedVisits: [{ id, date }],
        favResidenciesID: [],
      });
      res.status(200).send({ message: "Booked successfully" });
      return;
    }

    if (user.bookedVisits && user.bookedVisits.some((visit) => visit.id === id)) {
      res.status(400).json({ message: "Already booked" });
    } else {
      await usersCollection.updateOne(
        { email },
        { $push: { bookedVisits: { id, date } } }
      );
      res.status(200).send({ message: "Booked successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.body;

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(200).send({ bookedVisits: [] });
      return;
    }

    res.status(200).send({ bookedVisits: user.bookedVisits || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.body;
  const { id } = req.params;

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user || !user.bookedVisits) {
      res.status(400).json({ message: "No bookings found" });
      return;
    }

    const booking = user.bookedVisits.find((visit) => visit.id === id);
    if (!booking) {
      res.status(400).json({ message: "Not booked" });
    } else {
      await usersCollection.updateOne(
        { email },
        { $pull: { bookedVisits: { id } } }
      );
      res.status(200).send({ message: "Cancelled successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const toFav = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.body;
  const { rid } = req.params;

  try {
    const usersCollection = db.collection('users');
    let user = await usersCollection.findOne({ email });

    if (!user) {
      await usersCollection.insertOne({
        email,
        name: email.split('@')[0],
        bookedVisits: [],
        favResidenciesID: [rid],
      });
      res.status(200).send({ message: "Added to fav", user: { favResidenciesID: [rid] } });
      return;
    }

    if (user.favResidenciesID && user.favResidenciesID.includes(rid)) {
      await usersCollection.updateOne(
        { email },
        { $pull: { favResidenciesID: rid } }
      );
      const updatedUser = await usersCollection.findOne({ email });
      res.status(200).send({ message: "Removed from fav", user: { favResidenciesID: updatedUser.favResidenciesID || [] } });
    } else {
      await usersCollection.updateOne(
        { email },
        { $push: { favResidenciesID: rid } }
      );
      const updatedUser = await usersCollection.findOne({ email });
      res.status(200).send({ message: "Added to fav", user: { favResidenciesID: updatedUser.favResidenciesID || [] } });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getAllFavorites = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.body;

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(200).send({ favResidenciesID: [] });
      return;
    }

    res.status(200).send({ favResidenciesID: user.favResidenciesID || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const createUser = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const usersCollection = db.collection('users');
    let user = await usersCollection.findOne({ email });

    if (!user) {
      await usersCollection.insertOne({
        email,
        name: email.split('@')[0],
        bookedVisits: [],
        favResidenciesID: [],
      });
      res.send({ message: "User created successfully" });
    } else {
      res.status(201).send({ message: "User already exists" });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const usersCollection = db.collection('users');
    let user = await usersCollection.findOne({ email });

    if (!user) {
      await usersCollection.insertOne({
        email,
        name: email.split('@')[0],
        bookedVisits: [],
        favResidenciesID: [],
      });
      user = await usersCollection.findOne({ email });
    }

    res.status(200).send({ profile: user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email, name, gender, phone, image } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const usersCollection = db.collection('users');
    let user = await usersCollection.findOne({ email });

    if (!user) {
      await usersCollection.insertOne({
        email,
        name: name || email.split('@')[0],
        gender: gender || null,
        phone: phone || null,
        image: image || null,
        bookedVisits: [],
        favResidenciesID: [],
      });
      user = await usersCollection.findOne({ email });
    } else {
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            name: name || user.name,
            gender: gender || user.gender,
            phone: phone || user.phone,
            image: image || user.image,
          },
        }
      );
      user = await usersCollection.findOne({ email });
    }

    res.status(200).send({ message: "Profile updated", profile: user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});