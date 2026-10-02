const {Schema, model} = require("mongoose");
const { createHmac, randomBytes } = require('crypto');
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    salt:{
        type: String,
    },
    password:{
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: '/images/user-avatar.png'
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    }
}, {timestamps: true});

userSchema.pre('save', function (next){
    const user = this; // here 'this' is the user which we will be storinng in our constant
    
    if(!user.isModified('password')) return;

    const salt = randomBytes(16).toString(); // this will be the secret for evry user and will be unique
    // hashing the password wiith guvnn method
    // createHmac will take the algo in first param and secret in second param
    // then it will update andd the digest 
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    // updating in the salt field in schema
    this.salt = salt;
    this.password = hashedPassword;

    next;
})

userSchema.static('matchPasswordAndGenerateToken', async function (email, password){
    const user = await this.findOne({ email }); // here 'this' is the user which we will find firstly

    if(!user) throw new Error("User not foound"); // no user 

    const salt = user.salt;
    const hashedPassword = user.password;
    // now we will again create a hashed password which will b compared with the stored one
    const userProvidedPassword = createHmac('sha256', salt).update(password).digest('hex');
    if(hashedPassword !== userProvidedPassword) throw new Error("incorrect password"); 
    const token = createTokenForUser(user);
    return token;
})


const User = model("user", userSchema);

module.exports = User;