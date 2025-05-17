const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    type: { type: String, enum: ['image', 'video'], required: true },
    size: String,
    url: String, // Local path or cloud URL
    dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Media', mediaSchema);
