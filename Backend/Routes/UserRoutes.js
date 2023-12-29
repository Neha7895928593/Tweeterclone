const express = require('express');
const { singleUserController, followUserController,
     unfollwUserController, editUserController, tweetUserController, profilePicUserController } = require('../Controller/UserController');
const checkLogin = require('../Middleware/CheckLogin');


const router = express.Router();
router.get('/:id', checkLogin, singleUserController)
router.post('/:id/follow', checkLogin, followUserController)
router.post('/:id/unfollow', checkLogin, unfollwUserController)
router.put('/:id', checkLogin, editUserController)
router.post('/:id/tweets', checkLogin, tweetUserController)
router.post('/:id/uploadProfilePic', checkLogin,profilePicUserController )




module.exports= router;