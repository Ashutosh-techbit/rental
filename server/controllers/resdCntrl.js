import asyncHandler from "express-async-handler";

import { prisma } from "../config/prismaConfig.js";

export const createResidency = asyncHandler(async (req, res) => {
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
  } = req.body.data || req.body; // Handle both wrapped and unwrapped data

  console.log("Creating residency:", { title, userEmail });
  
  try {
    // First, check if user exists, if not create them
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userEmail.split('@')[0], // Use email prefix as name
          bookedVisits: [],
          favResidenciesID: []
        }
      });
    }

    const residency = await prisma.residency.create({
      data: {
        title,
        description,
        price: parseInt(price),
        address,
        country,
        city,
        facilities,
        image,
        userEmail,
      },
    });

    res.send({ message: "Residency created successfully", residency });
  } catch (err) {
    console.error("Error creating residency:", err);
    if (err.code === "P2002") {
      res.status(400).json({ message: "A residency with this address already exists" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

// function to get all the documents/residencies
export const getAllResidencies = asyncHandler(async (req, res) => {
  try {
    const residencies = await prisma.residency.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Convert to the format expected by the frontend
    const formattedResidencies = residencies.map(residency => ({
      _id: { $oid: residency.id },
      title: residency.title,
      description: residency.description,
      price: residency.price,
      address: residency.address,
      city: residency.city,
      country: residency.country,
      image: residency.image,
      facilities: residency.facilities,
      userEmail: residency.userEmail,
      createdAt: { $date: residency.createdAt.toISOString() },
      updatedAt: { $date: residency.updatedAt.toISOString() }
    }));
    
    res.send(formattedResidencies);
  } catch (error) {
    console.error("Error fetching residencies:", error);
    res.status(500).json({ message: "Failed to fetch residencies" });
  }
});

// function to get a specific document/residency
export const getResidency = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const residency = await prisma.residency.findUnique({
      where: { id },
    });
    
    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }
    
    // Convert to the format expected by the frontend
    const formattedResidency = {
      _id: { $oid: residency.id },
      title: residency.title,
      description: residency.description,
      price: residency.price,
      address: residency.address,
      city: residency.city,
      country: residency.country,
      image: residency.image,
      facilities: residency.facilities,
      userEmail: residency.userEmail,
      createdAt: { $date: residency.createdAt.toISOString() },
      updatedAt: { $date: residency.updatedAt.toISOString() }
    };
    
    res.send(formattedResidency);
  } catch (err) {
    console.error("Error fetching residency:", err);
    res.status(500).json({ message: err.message });
  }
});