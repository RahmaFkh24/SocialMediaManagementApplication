
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    postId: { type: String, required: true, unique: true },
    pageId: { type: String, required: true },
    message: String,
    created_time: Date,
    attachments: mongoose.Schema.Types.Mixed,
    lastFetched: Date,
    insights: {
        impressions: Number,
        engagement: Number,
        reach: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);