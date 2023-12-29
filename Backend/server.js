
const express = require('express');
require('./Models/Mongodb.js');
const dotenv = require('dotenv');
dotenv.config(); 
const authRoutes=require('./Routes/AuthRoutes.js')
const userRoutes=require('./Routes/UserRoutes.js')
const tweetsRoute=require('./Routes/TweetRoutes.js')
const cors=require('cors')


const app = express();
app.use(express.json()); 
app.use(cors());
app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes)
app.use('/api/tweet' ,tweetsRoute)

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
