const { Router } = require("express");
const User = require("../models/user");

const userRouter = Router();

userRouter.get('/signin', (req, res)=>{
    return res.render('signin');
})

userRouter.get('/signup', (req, res)=>{
    return res.render('signup');
})

userRouter.post('/signup', async (req, res)=>{
    const { fullName, email, password } = req.body;
    const user = await User.create({
        fullName, email, password
    })
    return res.redirect('/user/signin');
})

userRouter.post('/signin', async (req, res)=>{
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        // return res.redirect(`/welcome?email=${encodeURIComponent(user.email)}`);
        return res.cookie('token', token).redirect(`/`);
        
    } catch (error) {
        return res.render('signin', {
            error: "Incorrect Email or Password"
        })
    }
})

userRouter.get('/profile/:id', async(req, res)=>{
    const userId = req.params.id;
    const user = await User.findOne({
        _id: userId,
    }).select('-password -salt');
    if (!user) {
        return res.status(404).render('profile', { user: null });
    }
    return res.render('profile', {
        user: user,
    })
})

userRouter.get('/logout', (req, res)=>{
    res.clearCookie('token').redirect('/')
})

module.exports = userRouter;