import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import childModel from "../models/childModel.js";

const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        console.log("Auth Middleware: No token or invalid token format");
        return res.status(401).json({ success: false, message: "Not Authorized, No Token" });
    }

    try {
        token = token.split(" ")[1];  // Extract actual token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Auth Middleware: Token decoded successfully", { userId: decoded.id });

        // First try to find user as a regular user
        let user = await userModel.findById(decoded.id);
        
        // If not found, try to find as a child
        if (!user) {
            user = await childModel.findById(decoded.id);
        }

        if (!user) {
            console.log("Auth Middleware: No user found with ID", decoded.id);
            return res.status(403).json({ success: false, message: "User not found" });
        }

        req.user = user; // Attach full user object for future use
        console.log("Auth Middleware: User attached to request", { id: user._id });
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
    }
};


export default protect;


