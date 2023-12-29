
const multer = require('multer');
const path = require('path');
const Tweet=require('../Models/TweetModel')

const User=require('../Models/UserModel')
 
const singleUserController= async (req,res)=>{
   
    try {
        const userId = req.params.id;
        console.log(userId)

       
        const user = await User.findById(userId, '-password').populate('following followers');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

//follow
const followUserController=async(req,res)=>{
    try {
        const loggedInUserId = req.user.userId; // Extracted from the JWT token
        const userToFollowId = req.params.id;

        // Check if the logged-in user and user to follow exist
        const [loggedInUser, userToFollow] = await Promise.all([
            User.findById(loggedInUserId),
            User.findById(userToFollowId),
        ]);

        if (!loggedInUser || !userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (loggedInUser._id.equals(userToFollow._id)) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        // Check if the logged-in user is already following the user to follow
        if (loggedInUser.following.includes(userToFollowId)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        // Update the following and followers arrays
        loggedInUser.following.push(userToFollowId);
        userToFollow.followers.push(loggedInUserId);

        // Save both users
        await Promise.all([loggedInUser.save(), userToFollow.save()]);

        res.status(200).json({ message: 'Successfully followed the user' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }


}

//unfollow
const unfollwUserController= async (req,res)=>{
    try {
        const loggedInUserId = req.user.userId; // Extracted from the JWT token
        const userToUnfollowId = req.params.id;

        // Check if the logged-in user and user to unfollow exist
        const [loggedInUser, userToUnfollow] = await Promise.all([
            User.findById(loggedInUserId),
            User.findById(userToUnfollowId),
        ]);

        if (!loggedInUser || !userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the logged-in user is trying to unfollow himself
        if (loggedInUser._id.equals(userToUnfollow._id)) {
            return res.status(400).json({ message: 'You cannot unfollow yourself' });
        }

        // Check if the logged-in user is not following the user to unfollow
        if (!loggedInUser.following.includes(userToUnfollowId)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }
        console.log('Before unfollowing:', loggedInUser.following, userToUnfollow.followers);

        // Update the following and followers arrays to unfollow
        loggedInUser.following.pull(userToUnfollowId);
       userToUnfollow.followers.pull(loggedInUserId);
        // loggedInUser.following = loggedInUser.following.filter(id => id !== userToUnfollowId);
        // userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== loggedInUserId);
        
        console.log('After unfollowing:', loggedInUser.following, userToUnfollow.followers);
        // Save both users
        await Promise.all([loggedInUser.save(), userToUnfollow.save()]);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}
//edit
const editUserController= async (req,res)=>{

    try {
        const loggedInUserId = req.user.userId; // Extracted from the JWT token
        const userIdToEdit = req.params.id;

        // Check if the logged-in user is trying to edit his own details
        if (loggedInUserId !== userIdToEdit) {
            return res.status(403).json({ message: 'You are not authorized to edit this user\'s details' });
        }

        // Only allow name, date of birth, and location data
        const { name, dateOfBirth, location } = req.body;

        // Validate the data (you can customize the validation logic based on your requirements)
        if (!name || !dateOfBirth || !location) {
            return res.status(400).json({ message: 'Name, date of birth, and location are required fields' });
        }
       
        // Find the user by ID
        const userToEdit = await User.findById(userIdToEdit);

        // Check if the user exists
        if (!userToEdit) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user details
        
        userToEdit.name = name;
        userToEdit.dateOfBirth = dateOfBirth;
        userToEdit.location = location;

        // Save the edited user in the database
        await userToEdit.save();

        res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
const tweetUserController= async (req,res)=>{
    try {
        const userId = req.params.id;

        // Check if the user making the request is authorized to view tweets of the specified user
        if (req.user.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to view tweets of this user.' });
        }

        // Retrieve tweets for the specified user
        const tweets = await Tweet.find({ tweetedBy: userId }).populate('tweetedBy');

        res.status(200).json({ tweets });
    } catch (error) {
        console.error('Error retrieving user tweets:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }


}

//profilepic

const storage = multer.diskStorage({
    destination: './images/',
    filename: function (req, file, cb) {
        cb(null, 'profile-pic-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, 
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only images (jpeg/jpg/png) are allowed!');
        }
    }
}).single('profilePic');

const profilePicUserController= async (req,res)=>{
    const userId = req.params.id;

    // Check if the user making the request is authorized to upload a profile picture
    if (req.user.userId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to upload a profile picture for this user.' });
    }

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        try {
            // Save the stored image location in the DB
            const imagePath = '/images/' + req.file.filename;
            await User.findByIdAndUpdate(userId, { profilePic: imagePath });

            res.status(200).json({ message: 'Profile picture uploaded successfully.', imagePath });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });



}
module.exports={singleUserController,
    followUserController,
    unfollwUserController,
    editUserController,tweetUserController,profilePicUserController}