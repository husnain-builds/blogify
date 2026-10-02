const { validateTokenForUser } = require("../services/authentication");
const User = require("../models/user");

const checkForAuthenticationCookie = (cookieName) => {
    return async (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            return next();
        }
        try {
            const userPayload = validateTokenForUser(tokenCookieValue);
            if (!userPayload.fullName) {
                const user = await User.findById(userPayload._id).select("fullName");
                if (user) userPayload.fullName = user.fullName;
            }
            req.user = userPayload;
        } catch (error) {}
        return next();
    }
}

module.exports = {
    checkForAuthenticationCookie
}