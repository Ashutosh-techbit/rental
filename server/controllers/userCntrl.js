// User controller with Prisma (MongoDB)
import asyncHandler from 'express-async-handler';
import { prisma } from "../config/prismaConfig.js";

// In-memory storage for demo purposes
let users = {};
let bookings = {};
let favorites = {};

const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    bookedVisits: [],
                    favResidenciesID: [],
                }
            });
            res.send({ message: "User created successfully", user });
        } else {
            res.status(201).send({ message: "User already exists" });
        }
    } catch (e) {
        // Fallback to in-memory if DB is unreachable
        if (!users[email]) {
            users[email] = { email, name: email.split('@')[0], image: null, gender: null, phone: null };
            res.send({ message: "User created successfully (memory)", user: users[email] });
        } else {
            res.status(201).send({ message: "User already exists (memory)" });
        }
    }
});

// bookvisit for residency
const bookVisit = asyncHandler(async (req, res) => {
    const {email, date} = req.body;
    const {id} = req.params;
    
    try {
        if (!bookings[email]) {
            bookings[email] = [];
        }
        
        if (bookings[email].some((visit) => visit.id === id)) {
            res.status(400).json({message: "Already booked"});
        } else {
            bookings[email].push({id, date});
            res.status(200).send({message: "Booked successfully"});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getAllBookings = asyncHandler(async (req, res) => { 
    const {email} = req.body;
    try {
        const userBookings = bookings[email] || [];
        res.status(200).send({bookedVisits: userBookings});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const cancelBooking = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const {id} = req.params;
    
    try {
        if (!bookings[email]) {
            res.status(400).json({message: "No bookings found"});
            return;
        }
        
        const index = bookings[email].findIndex((visit) => visit.id === id);
        
        if (index === -1) {
            res.status(400).json({message: "Not booked"});
        } else {
            bookings[email].splice(index, 1);
            res.status(200).send({message: "Cancelled successfully"});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const toFav = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const {rid} = req.params;
    
    try {
        if (!favorites[email]) {
            favorites[email] = [];
        }
        
        if (favorites[email].includes(rid)) {
            favorites[email] = favorites[email].filter((id) => id !== rid);
            res.status(200).send({message: "Removed from fav", user: {favResidenciesID: favorites[email]}});
        } else {
            favorites[email].push(rid);
            res.status(200).send({message: "Added to fav", user: {favResidenciesID: favorites[email]}});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getAllFavorites = asyncHandler(async (req, res) => {
    const {email} = req.body;
    try {
        const userFavorites = favorites[email] || [];
        res.status(200).send({favResidenciesID: userFavorites});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

export {createUser, bookVisit, getAllBookings, cancelBooking, toFav, getAllFavorites};
// New: Profile getters/updaters using in-memory store
const getProfile = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    bookedVisits: [],
                    favResidenciesID: [],
                }
            });
        }
        res.status(200).send({ profile: user });
    } catch (e) {
        // Fallback to memory
        const mem = users[email] || { email, name: email.split('@')[0], image: null, gender: null, phone: null };
        users[email] = mem;
        res.status(200).send({ profile: mem });
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    const { email, name, gender, phone, image } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { name, gender, phone, image },
            create: {
                email,
                name: name || email.split('@')[0],
                gender: gender || null,
                phone: phone || null,
                image: image || null,
                bookedVisits: [],
                favResidenciesID: [],
            },
        });
        res.status(200).send({ message: "Profile updated", profile: user });
    } catch (e) {
        // Fallback to memory
        const existing = users[email] || { email };
        users[email] = { ...existing, email, name, gender, phone, image };
        res.status(200).send({ message: "Profile updated (memory)", profile: users[email] });
    }
});

export { getProfile, updateProfile };