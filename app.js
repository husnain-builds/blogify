require("dotenv").config();

const express = require("express");
const PATH = require("path");
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const mongoose = require('mongoose');
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");

const app = express();
const port = process.env.PORT || 8001;

const connectMongoDB = async (url) =>{
    return mongoose.connect(url).then(()=>{
        console.log("Database Connected");
    }).catch((err)=>{
        console.log("Database Connection Failed");
        console.log(err);
    })
}

connectMongoDB(process.env.MONGO_URL);

app.set('view engine', 'ejs');
app.set('views', PATH.resolve("./views"));

app.use(express.urlencoded({extended: false}))
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use('/user', userRouter);
app.use('/blog', blogRouter);
app.use(express.static(PATH.resolve('./public')))


app.get("/", async (req,res)=>{
    // checks if the user is login
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    const allBlogs = await Blog.find({});
    const user = req.user;
    return res.render('home',{
        user: user,
        blogs: allBlogs
    })
})


app.listen(port, ()=>{
    console.log("Server connected at "+ port);
})