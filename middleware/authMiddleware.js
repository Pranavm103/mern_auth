const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (
            typeof payload.sub !== "string" ||
            typeof payload.role !== "string"
        ) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }
        // Read the current user and role from the database.
        const user = await User.findById(payload.sub);

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "CastError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        next(error);
    }
};
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission"
            });
        }

        next();
    };
};