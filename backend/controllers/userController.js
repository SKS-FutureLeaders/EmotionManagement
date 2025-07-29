import userModel from "../models/userModel.js";
import childModel from "../models/childModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const updateWeeklyProgress = (lastLoginDate) => {
    const progress = Array(7).fill(-1);
    const today = new Date();
    const prevSunday = new Date(today);
    prevSunday.setDate(today.getDate() - today.getDay());
    prevSunday.setHours(0, 0, 0, 0);

    // Fill past days with 0 (no login) and today with 1 (logged in)
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(prevSunday);
        currentDate.setDate(prevSunday.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);
        
        const todayWithoutTime = new Date(today);
        todayWithoutTime.setHours(0, 0, 0, 0);

        if (currentDate.getTime() < todayWithoutTime.getTime()) {
            // Past days in current week
            progress[i] = 0;
        } else if (currentDate.getTime() === todayWithoutTime.getTime()) {
            // Today
            progress[i] = 1;
        }
        // Future days remain -1
    }
    return progress;
};

const updateLeague = (user) => {
    if (user.leadershipScore >= 30000) {
        user.league = "leader";
    } else if (user.leadershipScore >= 18000) {
        user.league = "crystal";
    } else if (user.leadershipScore >= 10000) {
        user.league = "platinum";
    } else if (user.leadershipScore >= 5000) {
        user.league = "gold";
    } else if (user.leadershipScore >= 700) {
        user.league = "silver";
    }
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const updateChildLoginData = async (user) => {
    console.log('\n=== Update Child Login Data ===');
    console.log('Processing login for child:', user.email);

    // Get current date
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];  // YYYY-MM-DD format

    // Get and validate last login date
    if (!user.lastLoginDate) {
        console.log('First time login - setting initial streak');
        user.streaks = 1;
        user.lastLoginDate = today;
        return user;
    }

    // Convert last login to YYYY-MM-DD format
    const lastLogin = new Date(user.lastLoginDate);
    const lastLoginStr = lastLogin.toISOString().split('T')[0];
    console.log('!!!!!!!!!! 1 Last login date:', lastLoginStr);
    console.log('!!!!!!!!!! 2 last date:', lastLogin);
    console.log('!!!!!!!!!! 3 Current date:', todayDateStr);
    console.log('Date comparison:', {
        storedLastLogin: lastLoginStr,
        currentDate: todayDateStr
    });

    // Compare dates in YYYY-MM-DD format
    if (todayDateStr === lastLoginStr) {
        console.log('Same day login - maintaining streak:', user.streaks);
    } else {
        // Calculate days difference using YYYY-MM-DD dates
        const lastDate = new Date(lastLoginStr);
        const currDate = new Date(todayDateStr);
        console.log('!!!!!!!!! 3 Last date:', lastDate.toISOString(), '!!!!!!!!!!! 4 Current date:', currDate.toISOString());
        const daysDiff = Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24));
        
        console.log('Days between logins:', daysDiff);

        if (daysDiff === 1) {
            console.log('Consecutive day login - incrementing streak from', user.streaks);
            user.streaks += 1;
            if (user.streaks > user.maxStreak) {
                user.maxStreak = user.streaks;
                user.leadershipScore += 10;
                updateLeague(user);
            }
        } else if (daysDiff > 1) {
            console.log('Non-consecutive login - resetting streak from', user.streaks, 'to 1');
            user.streaks = 1;
        }
    }

    // Update last login date
    user.lastLoginDate = today;
    console.log('Updated last login to:', today.toISOString());
    console.log('Final streak:', user.streaks);
    console.log('=== End Update Child Login Data ===\n');
    
    return user;
};

// 🔹 Login User (Handles Email/Password, Facebook & Google Login)
const loginUser = async (req, res) => {
    try {
        const { email, password, accessToken, idToken, provider } = req.body;
        console.log("Login attempt with:", { email, password: password ? "******" : null, accessToken: accessToken ? "present" : null, idToken: idToken ? "present" : null, provider });

        // 🔹 Facebook Login
        if (accessToken && !idToken) {
            console.log("Processing Facebook login with access token");
            try {
                const fbResponse = await axios.get(
                    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
                );

                const { email, name } = fbResponse.data;
                
                if (!email) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Facebook account doesn't have an associated email. Please use another login method." 
                    });
                }
                
                let user = await userModel.findOne({ email });

                if (!user) {
                    user = new userModel({
                        email,
                        password: "", // No password required for Facebook users
                        first_name: name.split(" ")[0],
                        last_name: name.split(" ")[1] || "",
                        age: null,
                        contact: null,
                        loginMethod: "facebook",
                    });
                    await user.save();
                }

                const token = createToken(user._id);
                return res.status(200).json({ success: true, token });
            } catch (fbError) {
                console.error("Facebook validation error:", fbError);
                return res.status(400).json({ success: false, message: "Invalid Facebook credentials" });
            }
        }

        // 🔹 Google Login
        if (idToken && provider === "google") {
            console.log("Processing Google login with ID token");
            try {
                const ticket = await client.verifyIdToken({
                    idToken: idToken,
                    audience: GOOGLE_CLIENT_ID,
                });

                const payload = ticket.getPayload();
                if (!payload) {
                    return res.status(400).json({ success: false, message: "Invalid Google token" });
                }
                console.log("Google payload:", payload);
                const { email, name, given_name } = payload;
                console.log("Google auth successful for email:", email);
                
                let user = await userModel.findOne({ email });

                if (!user) {
                    // Use given_name and family_name if available, otherwise split name
                    const firstName = given_name || (name ? name.split(" ")[0] : "");
                    const lastName = (name ? name.split(" ").slice(1).join(" ") : "");
                    
                    user = new userModel({
                        email,
                        password: "", // No password required for Google users
                        first_name: firstName,
                        last_name: lastName,
                        age: null,
                        contact: null,
                        loginMethod: "google",
                    });
                    await user.save();
                    console.log("Created new user with Google login");
                } else {
                    console.log("Found existing user with email:", email);
                }

                const token = createToken(user._id);
                return res.status(200).json({ success: true, token });
            } catch (googleError) {
                console.error("Google token verification error:", googleError);
                return res.status(400).json({ success: false, message: "Invalid Google token" });
            }
        }

        // 🔹 Normal Email/Password Login
        if (email && password) {
            console.log("Processing email/password login");

            // Check for admin login
            if (email === "admin@admin.com" && password === "admin123") {
                console.log("Admin login detected");
                const token = createToken("admin");
                return res.status(200).json({ 
                    success: true, 
                    token, 
                    userType: "admin",
                    redirectTo: "/admin" 
                });
            }

            let user = await userModel.findOne({ email });
            
            if (!user) {
                console.log("User not found in parent model, checking child model...");
                user = await childModel.findOne({ email });
            
                if (!user) {
                    console.log("User does not exist in both parent and child models");
                    return res.status(400).json({ success: false, message: "User does not exist" });
                }

                // Update child's login data
                try {
                    user = await updateChildLoginData(user);
                } catch (error) {
                    console.error('Error updating login data:', error);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error processing login data: " + error.message 
                    });
                }
                
                // Handle first login bonus if needed
                if (!user.hasReceivedFirstLoginBonus) {
                    console.log("First time login detected - Adding leadership score bonus");
                    user.leadershipScore += 100;
                    updateLeague(user);
                    if (!user.badges.includes(1)) {
                        user.badges.push(1);
                        user.leadershipScore += 250;
                        updateLeague(user);
                    }
                    user.hasReceivedFirstLoginBonus = true;
                }

                // Update weekly progress
                user.weeklyProgress = updateWeeklyProgress(user.lastLoginDate);

                // Check leadership score milestones
                if (user.leadershipScore >= 10000 && !user.badges.includes(5)) {
                    user.badges.push(5);
                    user.leadershipScore += 250;
                } else if (user.leadershipScore >= 5000 && !user.badges.includes(4)) {
                    user.badges.push(4);
                    user.leadershipScore += 250;
                } else if (user.leadershipScore >= 1000 && !user.badges.includes(3)) {
                    user.badges.push(3);
                    user.leadershipScore += 250;
                } else if (user.leadershipScore >= 500 && !user.badges.includes(2)) {
                    user.badges.push(2);
                    user.leadershipScore += 250;
                }

                // Save all changes
                await user.save();
                console.log('Saved updated child data:', {
                    streaks: user.streaks,
                    maxStreak: user.maxStreak,
                    lastLoginDate: user.lastLoginDate,
                    leadershipScore: user.leadershipScore,
                    lastLoginDate: user.lastLoginDate,
                });
            }

            if (user.loginMethod && user.loginMethod !== "email") {
                console.log("Invalid login method");
                return res.status(400).json({ 
                    success: false, 
                    message: `This account uses ${user.loginMethod} authentication. Please log in using ${user.loginMethod}.` 
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("Invalid credentials");
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }
            
            const token = createToken(user._id);
            return res.status(200).json({ success: true, token, userType: user.type || "child" });
        }

        // If no valid login method was used
        return res.status(400).json({ 
            success: false, 
            message: "Invalid login request. Please provide valid credentials." 
        });
        
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Authentication failed. Please try again." });
    }
};

// 🔹 User Registration (Only for Email/Password Signup)
const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, age, contact } = req.body;
        console.log("Registration attempt for:", email);

        // Validate input data
        if (!email || !password || !first_name) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide required fields (email, password, first name)" 
            });
        }

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ 
                success: false, 
                message: exists.loginMethod === "email" 
                    ? "User already exists with email/password login" 
                    : `This email is already registered with ${exists.loginMethod}. Please use ${exists.loginMethod} to login.`
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            age,
            contact,
            loginMethod: "email",
            type: "parent",
            children: []
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.status(200).json({ success: true, token });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ success: false, message: "Registration failed. Please try again." });
    }
};

// Get parent profile with children
const getParentProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming middleware sets req.user
        
        const user = await userModel.findById(userId)
            .select('first_name last_name email age contact type')
            .populate({
                path: 'children',
                select: 'name age email leadershipGoal gender ageGroup focusAreas'
            });
            
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Forgot password request for:", email);
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide an email" });
        }
        
        // Check both user models
        let user = await userModel.findOne({ email });
        // console.log("User found in parent model:", user);
        let isChild = false;
        
        if (!user) {
            user = await childModel.findOne({ email });
            if (!user) {
                // Don't reveal if user exists for security
                return res.status(200).json({ 
                    success: true, 
                    message: "If your email is registered, you will receive a password reset link" 
                });
            }
            isChild = true;
        }
        
        // Check if user has password authentication
        if (user.loginMethod && user.loginMethod !== "email") {
            return res.status(400).json({ 
                success: false, 
                message: `This account uses ${user.loginMethod} authentication. Password reset is not available.` 
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        
        // Hash the token for storage
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        
        // Store token in user document
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = resetTokenExpiry;
        await user.save();
        
        // Create reset URL
        const resetUrl = `http://localhost:8081/auth/reset-password?token=${resetToken}&email=${email}`;
        
        // Configure email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${resetUrl}" clicktracking="off">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({
            success: true,
            message: "If your email is registered, you will receive a password reset link"
        });
        
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ success: false, message: "Failed to process password reset" });
    }
};

// Reset Password functionality
const resetPassword = async (req, res) => {
    try {
        const { token, email, password } = req.body;
        if (!token || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide all required fields" 
            });
        }
        
        // Validate password
        if (password.length < 8) {
            return res.status(400).json({
                success: false, 
                message: "Password must be at least 8 characters long" 
            });
        }
        
        // Hash the token from params to compare with stored hash
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        
        // Check both models
        let user = await userModel.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        let isChild = false;
        
        if (!user) {
            user = await childModel.findOne({
                email,
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { $gt: Date.now() }
            });
            
            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid or expired reset token" 
                });
            }
            
            isChild = true;
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update user password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
        
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Failed to reset password" });
    }
};

export { registerUser, loginUser, getParentProfile, forgotPassword, resetPassword };
