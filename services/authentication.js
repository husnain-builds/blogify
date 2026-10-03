const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const createTokenForUser = (user) =>{
    const payload ={
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profileImageUrl: user.profileImageUrl,
        role: user.role
    };

    const token =JWT.sign(payload, secret);
    return token;
}

const validateTokenForUser = (token) =>{
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateTokenForUser
}