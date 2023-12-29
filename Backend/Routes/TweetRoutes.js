const express = require('express');
const formidable =require('express-formidable');
const checkLogin = require('../Middleware/CheckLogin');
const { createTweetController, likeTweetController, dislikeTweetController, 
    replyTweetController, getSingleTweetController, getAllTweetsController, deleteTweetController, retweetController } = require('../Controller/TweetController');

const router = express.Router();
 router.post('/',   checkLogin , formidable(), createTweetController)
 router.post('/:id/like',   checkLogin , likeTweetController)
 router.post('/:id/dislike',   checkLogin , dislikeTweetController)
 
 router.post('/:id/reply',   checkLogin , replyTweetController)
 router.get('/:id',getSingleTweetController)
 router.get('/',getAllTweetsController)
 router.delete('/:id',checkLogin,deleteTweetController)
 router.post('/:id/retweet',checkLogin,retweetController)


module.exports= router;