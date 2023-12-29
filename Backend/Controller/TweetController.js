const multer = require('multer');
const path = require('path');
const Tweet = require('../Models/TweetModel.js');

const storage = multer.diskStorage({
  destination: './tweetImages/',
  filename: function (req, file, cb) {
    cb(null, 'tweet-image-' + Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, 
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpeg/jpg/png) are allowed!'));
    }
  },
}).single('image');

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10000000 },
//   fileFilter: function (req, file, cb) {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (mimetype && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only images (jpeg/jpg/png) are allowed!'));
//     }
//   },
// }).single('image');

const createTweetController = (req, res) => {
  console.log(req.body)
  console.log(req.files)
  console.log(req.fields)

  const { content} = req.fields;

  if (!content) {
    return res.status(400).json({ message: 'Content is required for a tweet.' });
  }
 console.log(req.user._id)
  const tweetedBy = req.user._id;

  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err.message);
      return res.status(400).json({ message: 'Error uploading image.', error: err.message });
    }
    const imageFile = req.files;
    console.log(imageFile)


    try {
      const newTweet = new Tweet({
        content,
        tweetedBy,
        image: imageFile ? '/tweetImages/' + imageFile.filename : undefined,
      });

      await newTweet.save();
      console.log('Tweet created successfully:', newTweet);

      res.status(201).json({
        message: 'Tweet created successfully.',
        tweet: newTweet,
        imagePath: newTweet.image, 
      });
    } catch (error) {
      console.error('Error creating tweet:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};



//   destination: './tweetImages/',
//   filename: function (req, file, cb) {
//     cb(null, 'tweet-image-' + Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10000000 }, 
//   fileFilter: function (req, file, cb) {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (mimetype && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only images (jpeg/jpg/png) are allowed!'));
//     }
//   },
// }).single('image');

// const createTweetController = (req, res) => {
//   const { content } = req.fields;

//   if (!content) {
//     return res.status(400).json({ message: 'Content is required for a tweet.' });
//   }

//   const tweetedBy = req.user._id;

//   upload(req, res, async (err) => {
//     if (err) {
//       console.error('Error uploading image:', err.message);
//       return res.status(400).json({ message: 'Error uploading image.', error: err.message });
//     }

//     try {
//       const newTweet = new Tweet({
//         content,
//         tweetedBy,
//         image: req.file ? '/tweetImages/' + req.file.filename : undefined,
//       });

//       await newTweet.save();
//       console.log('Tweet created successfully:', newTweet);

//       res.status(201).json({ message: 'Tweet created successfully.', tweet: newTweet });
//     } catch (error) {
//       console.error('Error creating tweet:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });
// };

//like 
const likeTweetController = async (req, res) => {
    try {
      const tweetId = req.params.id;
      const userId = req.user._id;
  
      // Check if the tweet exists
      const tweet = await Tweet.findById(tweetId);
  
      if (!tweet) {
        return res.status(404).json({ message: 'Tweet not found' });
      }
  
      // Check if the user has already liked the tweet
      if (tweet.likes.includes(userId)) {
        return res.status(400).json({ message: 'You cannot like an already liked tweet' });
      }
  
      // Add user ID to the likes array and save the tweet
      tweet.likes.push(userId);
      await tweet.save();
  
      res.status(200).json({ message: 'Tweet liked successfully', tweet });
    } catch (error) {
      console.error('Error liking tweet:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
}
    //dislikle
    

const dislikeTweetController = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user._id;

    // Check if the tweet exists
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Check if the user has liked the tweet
    if (!tweet.likes.includes(userId)) {
      return res.status(400).json({ message: 'You cannot dislike a tweet you did not like' });
    }

    // Remove user ID from the likes array and save the tweet
    tweet.likes = tweet.likes.filter((id) => id.toString() !== userId.toString());
    await tweet.save();

    res.status(200).json({ message: 'Tweet disliked successfully', tweet });
  } catch (error) {
    console.error('Error disliking tweet:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

 //replayTweet
 const replyTweetController = async (req, res) => {
    try {
      const parentTweetId = req.params.id;
      const { content } = req.body;
      const userId = req.user._id;
  
      // Check if the parent tweet exists
      const parentTweet = await Tweet.findById(parentTweetId);
  
      if (!parentTweet) {
        return res.status(404).json({ message: 'Parent tweet not found' });
      }
  
      // Create a new tweet for the reply
      const newReply = new Tweet({
        content,
        tweetedBy: userId,
      });
  
      // Save the new reply tweet
      await newReply.save();
  
      // Add the new reply tweet's ID to the parent tweet's replies array
      parentTweet.replies.push(newReply._id);
      await parentTweet.save();
  
      res.status(201).json({ message: 'Reply added successfully', reply: newReply });
    } catch (error) {
      console.error('Error replying to tweet:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  //singleuser
  const getSingleTweetController = async (req, res) => {
    try {
      const tweetId = req.params.id;
  
      // Find the tweet by ID and populate fields with refs
      const tweet = await Tweet.findById(tweetId)
        .populate('tweetedBy', '-password') // Hide user password
        .populate({
          path: 'replies',
          populate: {
            path: 'tweetedBy',
            select: '-password', // Hide user password
          },
        })
        .exec();
  
      if (!tweet) {
        return res.status(404).json({ message: 'Tweet not found' });
      }
  
      res.status(200).json({ tweet });
    } catch (error) {
      console.error('Error fetching single tweet:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
}
//getalltweet
const getAllTweetsController = async (req, res) => {
    try {
      // Get all tweets, populate fields with refs, and sort by createdAt in descending order
      const tweets = await Tweet.find()
        .populate('tweetedBy', '-password') // Hide user password
        .populate({
          path: 'replies',
          populate: {
            path: 'tweetedBy',
            select: '-password', // Hide user password
          },
        })
        .sort({ createdAt: 'desc' })
        .exec();
  
      res.status(200).json({ tweets });
    } catch (error) {
      console.error('Error fetching all tweets:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  //delete
  const deleteTweetController = async (req, res) => {
    try {
      const tweetId = req.params.id;
      
      // Find the tweet by ID
      const tweet = await Tweet.findById(tweetId);
  
      // Check if the tweet exists
      if (!tweet) {
        return res.status(404).json({ message: 'Tweet not found' });
      }
  
      // Check if the logged-in user created the tweet
      if (req.user._id.toString() !== tweet.tweetedBy.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this tweet' });
      }
  
      // Delete the tweet
      await tweet.remove();
  
      res.status(200).json({ message: 'Tweet deleted successfully' });
    } catch (error) {
      console.error('Error deleting tweet:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
//retweet

const retweetController = async (req, res) => {
    try {
      const tweetId = req.params.id;
  
      // Find the tweet by ID
      const tweet = await Tweet.findById(tweetId);
  
      // Check if the tweet exists
      if (!tweet) {
        return res.status(404).json({ message: 'Tweet not found' });
      }
  
      // Check if the user has already retweeted
      if (tweet.retweetBy.includes(req.user._id.toString())) {
        return res.status(400).json({ message: 'You have already retweeted this tweet' });
      }
  
      // Add user id to the retweetBy array
      tweet.retweetBy.push(req.user._id);
  
      // Save the tweet
      await tweet.save();
  
      res.status(200).json({ message: 'Retweeted successfully', tweet });
    } catch (error) {
      console.error('Error retweeting:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

module.exports = { createTweetController,likeTweetController,
    dislikeTweetController,replyTweetController,
    getSingleTweetController,getAllTweetsController,deleteTweetController,retweetController};
