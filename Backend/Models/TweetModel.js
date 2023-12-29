const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    tweetedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
         required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    retweetBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet',
        },
    }],
    image: {
        type: String,
        default: null,
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
    }],
}, { timestamps: true });

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
