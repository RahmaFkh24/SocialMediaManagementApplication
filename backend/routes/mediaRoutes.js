const express = require('express');
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// POST /api/media/upload
router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const userId = req.body.userId; // From frontend or session
        const mediaDocs = req.files.map(file => ({
            userId,
            name: file.originalname,
            type: file.mimetype.startsWith('image') ? 'image' : 'video',
            size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
            url: `/uploads/${file.filename}`,
        }));

        const savedMedia = await Media.insertMany(mediaDocs);
        res.status(201).json(savedMedia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// GET /api/media/:userId
router.get('/:userId', async (req, res) => {
    try {
        const media = await Media.find({ userId: req.params.userId }).sort({ dateAdded: -1 });
        res.json(media);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch media' });
    }
});

module.exports = router;
