import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRoute } from './routes/userRoute.js';
import { residencyRoute } from './routes/residencyRoute.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

const app = express();

const PORT = process.env.PORT || 8000;

// CORS first so headers are set even on body-parser errors
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.options('*', cors({ origin: allowedOrigin, credentials: true }));

// Increase body limits to allow base64 images
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use(cookieParser())

// Serve static images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'images')));

// In-memory storage for new properties
let newProperties = [];

// Load existing properties from JSON file
let existingProperties = [];
try {
  const dataPath = path.join(__dirname, 'data', 'Residency.json');
  existingProperties = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('Error loading existing properties:', error);
}

// Route to get all properties (existing + new)
app.get('/api/residency/allresd', (req, res) => {
  try {
    const allProperties = [...newProperties, ...existingProperties];
    const normalized = allProperties.map((item) => ({
      ...item,
      id: item.id || item._id?.$oid || item._id || item?.id,
    }));
    res.json(normalized);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to load properties' });
  }
});

// Route to get single property
app.get('/api/residency/:id', (req, res) => {
  try {
    const allProperties = [...newProperties, ...existingProperties];
    const property = allProperties.find(item => 
      item._id?.$oid === req.params.id || item.id === req.params.id
    );
    
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to load property' });
  }
});

// Route to create new property
app.post('/api/residency/create', (req, res) => {
  try {
    const propertyData = req.body.data || req.body;
    
    // Generate a unique ID
    const newId = Date.now().toString();
    
    const newProperty = {
      _id: { $oid: newId },
      id: newId,
      title: propertyData.title,
      description: propertyData.description,
      price: parseInt(propertyData.price),
      address: propertyData.address,
      city: propertyData.city,
      country: propertyData.country,
      image: propertyData.image,
      facilities: propertyData.facilities,
      userEmail: propertyData.userEmail,
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() }
    };
    
    // Add to in-memory storage
    newProperties.unshift(newProperty); // Add to beginning for newest first
    
    console.log('New property created:', newProperty.title);
    res.json({ message: 'Property created successfully', property: newProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Register routes BEFORE starting the server
app.use('/api/user', userRoute)
app.use("/api/residency", residencyRoute)

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});