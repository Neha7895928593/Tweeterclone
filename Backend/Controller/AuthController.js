const User = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
    try {
        const { name, username, email, password ,dateOfBirth,location,} = req.body;
        

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email is already taken.' });
        }
        if (!name || !username || !email || !password||!location||!dateOfBirth) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        function isValidEmail(Email) {
            const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            return emailPattern.test(Email);
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid Email.' });
        }

        function isValidPassword(password) {
            const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
            return passwordPattern.test(password);
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: 'Invalid password.' });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            dateOfBirth,
            location,

        });


        const result = await newUser.save();

        res.status(201).json({ message: 'User registered successfully.', result });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


//login
const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });

        // Check if the user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generate a JWT token
        const token = Jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '7d' });

        // Respond with success message and token
        return res.status(200).json({
            message: 'Authentication successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                dateOfBirth: user.dateOfBirth,
                location: user.location,
            },
            token: token,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = { registerController,loginController };
