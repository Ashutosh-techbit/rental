import asyncHandler from "express-async-handler";
import { getDB, ObjectId } from "../config/mongoConfig.js";

export const createResidency = asyncHandler(async (req, res) => {
  const db = getDB();
  const {
    title,
    description,
    price,
    address,
    country,
    city,
    facilities,
    image,
    userEmail,
  } = req.body.data || req.body;

  console.log("Creating residency:", { title, userEmail });

  try {
    const residenciesCollection = db.collection('residencies');
    const usersCollection = db.collection('users');

    // Check if user exists, if not create them
    let user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      await usersCollection.insertOne({
        email: userEmail,
        name: userEmail.split('@')[0],
        bookedVisits: [],
        favResidenciesID: [],
      });
    }

    // Create residency
    const residency = {
      title,
      description,
      price: parseInt(price),
      address,
      country,
      city,
      facilities,
      image,
      userEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await residenciesCollection.insertOne(residency);
    residency._id = result.insertedId;

    res.send({ message: "Residency created successfully", residency });
  } catch (err) {
    console.error("Error creating residency:", err);
    res.status(500).json({ message: err.message });
  }
});

// function to get all the documents/residencies
export const getAllResidencies = asyncHandler(async (req, res) => {
  const db = getDB();

  try {
    const residenciesCollection = db.collection('residencies');
    const residencies = await residenciesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Add id field for frontend compatibility
    const formattedResidencies = residencies.map(property => ({
      ...property,
      id: property._id.toString()
    }));

    res.send(formattedResidencies);
  } catch (error) {
    console.error("Error fetching residencies:", error);
    res.status(500).json({ message: "Failed to fetch residencies" });
  }
});

// function to get a specific document/residency
export const getResidency = asyncHandler(async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  try {
    const residenciesCollection = db.collection('residencies');
    const residency = await residenciesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }

    // Add id field for frontend compatibility
    res.send({
      ...residency,
      id: residency._id.toString()
    });
  } catch (err) {
    console.error("Error fetching residency:", err);
    res.status(500).json({ message: err.message });
  }
});