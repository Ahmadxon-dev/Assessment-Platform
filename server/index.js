const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 5000
const cloudinary = require('cloudinary').v2;

require("dotenv").config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Your Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY,        // Your Cloudinary API key
    api_secret: process.env.CLOUDINARY_API_SECRET   // Your Cloudinary API secret
});
app.use(cors({
    origin:"*",
    credentials:true,
    optionsSuccessStatus: 200,
}))
app.use(express.json())
app.use('/auth', require("./routes/authorization"))
app.use('/test', require("./routes/test"))
app.use('/user', require("./routes/user"))


async function start() {
    try {
        app.get('/', (req, res) => {
            res.send('Server working');
        });
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}`);
        })
        await mongoose.connect(process.env.MONGO_URI + "/test");
        console.log("DB connected successfully");

    } catch (error) {
        console.error("DB connection failed:", error);
        process.exit(1);
    }
}

start();
