import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userModel from '../models/userModel.js';
import adminModel from '../models/adminModel.js';
import childModel from '../models/childModel.js';
// Remove contentModel import since it's now part of adminModel
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log('Processing file:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('Request body:', req.body);
        
        // Get content type from request body
        const fileType = req.body.type;
        console.log('Content type from request:', fileType);
        
        const allowedTypes = {
            'image': ['image/jpeg', 'image/png', 'image/gif'],
            'video': ['video/mp4', 'video/mpeg'],
            'pdf': ['application/pdf'],
            'text': ['text/plain']
        };
        
        // If content type is not yet available, allow the file
        if (!fileType) {
            console.log('Content type not available, allowing file');
            return cb(null, true);
        }
        
        if (allowedTypes[fileType] && allowedTypes[fileType].includes(file.mimetype)) {
            console.log('File type allowed');
            cb(null, true);
        } else {
            console.log('File type not allowed for content type:', fileType);
            console.log('Allowed types for this content:', allowedTypes[fileType]);
            cb(new Error(`Invalid file type for ${fileType} content`));
        }
    }
}).array('files', 10);

const adminController = {
    fetch_user: async (req, res) => {
        try {
            const { identifier } = req.params;
            const userData = await fetch_user(identifier);
            
            if (userData.error) {
                return res.status(404).json({ error: userData.error });
            }
            
            return res.status(200).json(userData);
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    
    fetch_all_users: async (req, res) => {
        try {
            const users = await userModel.find({ type: 'parent' }).populate('children');
            const totalChildren = await childModel.countDocuments();
            
            const formattedUsers = users.map(user => ({
                name: `${user.first_name} ${user.last_name || ''}`.trim(),
                type: user.type,
                email: user.email,
                avatar: user.avatar || null,
                no_of_children: user.children.length
            }));
            
            return res.status(200).json({
                users: formattedUsers,
                totalChildren: totalChildren
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    fetch_parent_details: async (req, res) => {
        try {
            const { email } = req.params;
            const parent = await userModel.findOne({ email }).populate({
                path: 'children',
                select: 'name email age gender streaks maxStreak avatar lastLoginDate'
            });

            if (!parent) {
                return res.status(404).json({ error: "Parent not found" });
            }

            const parentData = {
                name: `${parent.first_name} ${parent.last_name || ''}`.trim(),
                email: parent.email,
                type: parent.type,
                contact: parent.contact,
                age: parent.age,
                children: parent.children.map(child => ({
                    name: child.name,
                    email: child.email,
                    age: child.age,
                    gender: child.gender,
                    streaks: child.streaks,
                    maxStreak: child.maxStreak,
                    avatar: child.avatar
                }))
            };

            return res.status(200).json(parentData);
        } catch (error) {
            console.error("Error fetching parent details:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    delete_parent: async (req, res) => {
        try {
            const { email } = req.params;
            
            // Find parent and their children
            const parent = await userModel.findOne({ email });
            if (!parent) {
                return res.status(404).json({ success: false, message: 'Parent not found' });
            }

            // Delete all children associated with this parent
            await childModel.deleteMany({ parent: parent._id });

            // Delete the parent
            await userModel.deleteOne({ email });

            res.status(200).json({ success: true, message: 'Parent and associated children deleted successfully' });
        } catch (error) {
            console.error('Delete parent error:', error);
            res.status(500).json({ success: false, message: 'Failed to delete parent' });
        }
    },

    delete_child: async (req, res) => {
        try {
            const { email } = req.params;
            
            // Find and delete child
            const child = await childModel.findOne({ email });
            if (!child) {
                return res.status(404).json({ success: false, message: 'Child not found' });
            }

            // Remove child reference from parent
            await userModel.updateOne(
                { _id: child.parent },
                { $pull: { children: child._id } }
            );

            // Delete the child
            await childModel.deleteOne({ email });

            res.status(200).json({ success: true, message: 'Child deleted successfully' });
        } catch (error) {
            console.error('Delete child error:', error);
            res.status(500).json({ success: false, message: 'Failed to delete child' });
        }
    },

    fetch_child_stats: async (req, res) => {
        try {
            const { email } = req.params;
            const child = await childModel.findOne({ email }).select('name streaks maxStreak leadershipScore badges league');
        
            if (!child) {
                return res.status(404).json({ error: "Child not found" });
            }
        
            return res.status(200).json({
                name: child.name,
                streaks: child.streaks,
                maxStreak: child.maxStreak,
                leadershipScore: child.leadershipScore,
                badges: child.badges,
                league: child.league
            });
        } catch (error) {
            console.error("Error fetching child stats:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    upload_content: async (req, res) => {
        console.log('Upload content request received');
        try {
            const handleUpload = () => new Promise((resolve, reject) => {
                upload(req, res, (err) => {
                    if (err) {
                        console.error('Multer error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            await handleUpload();
            
            console.log('Files uploaded successfully');
            console.log('Request body after upload:', req.body);
            console.log('Files received:', req.files);

            // Create admin if not exists
            let admin = await adminModel.findOne();
            if (!admin) {
                admin = await adminModel.create({
                    first_name: 'Admin',
                    last_name: 'User',
                    email: 'admin@example.com',
                    type: 'admin'
                });
                console.log('Created new admin user');
            }

            if (!req.files || req.files.length === 0) {
                console.error('No files in request');
                return res.status(400).json({ error: 'No files uploaded' });
            }

            try {
                const { type, heading, ageRange, description } = req.body;
                console.log('Processing content data:', { type, heading, ageRange, description });

                // Parse ageRange if it's a string
                let parsedAgeRange = ageRange;
                if (typeof ageRange === 'string') {
                    parsedAgeRange = JSON.parse(ageRange);
                }

                const files = req.files.map(file => {
                    console.log('Processing file:', file.originalname);
                    return {
                        fileUrl: `/uploads/${file.filename}`,
                        mimeType: file.mimetype,
                        originalName: file.originalname,
                        size: file.size
                    };
                });

                const newContent = {
                    type,
                    heading,
                    ageRange: {
                        lower: parseInt(parsedAgeRange.lower),
                        upper: parseInt(parsedAgeRange.upper)
                    },
                    description,
                    files
                };

                console.log('Creating new content entry:', newContent);

                admin.uploadedContent.push(newContent);
                await admin.save();
                console.log('Content saved successfully');

                return res.status(201).json({
                    success: true,
                    message: 'Content uploaded successfully',
                    content: newContent
                });
            } catch (error) {
                console.error('Error processing upload:', error);
                // Clean up any uploaded files in case of error
                if (req.files) {
                    req.files.forEach(file => {
                        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log('Cleaned up file:', filePath);
                        }
                    });
                }
                throw error;
            }
        } catch (error) {
            console.error("Error in upload_content:", error);
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    },

    get_content: async (req, res) => {
        try {
            const admin = await adminModel.findOne();
            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }

            const { type, ageRange } = req.query;
            let content = admin.uploadedContent;

            if (type) {
                content = content.filter(item => item.type === type);
            }

            if (ageRange) {
                const age = parseInt(ageRange);
                content = content.filter(item => 
                    age >= item.ageRange.lower && age <= item.ageRange.upper
                );
            }

            return res.status(200).json({ content });
        } catch (error) {
            console.error("Error fetching content:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    delete_content: async (req, res) => {
        try {
            const { contentId } = req.params;
            const admin = await adminModel.findOne();
            
            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }

            const content = admin.uploadedContent.id(contentId);
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }

            // Delete all files associated with the content
            if (content.files && content.files.length > 0) {
                content.files.forEach(file => {
                    const filePath = path.join(__dirname, '..', file.fileUrl);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            }

            admin.uploadedContent.pull(contentId);
            await admin.save();

            return res.status(200).json({ 
                success: true, 
                message: 'Content deleted successfully' 
            });
        } catch (error) {
            console.error("Error deleting content:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    fetch_content: async (req, res) => {
        try {
            // Update to use adminModel instead of contentModel
            const admin = await adminModel.findOne();
            if (!admin) {
                return res.status(404).json({ error: 'No content found' });
            }
            const content = admin.uploadedContent.sort((a, b) => b.createdAt - a.createdAt);
            return res.status(200).json({ content });
        } catch (error) {
            console.error("Error fetching content:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    get_content_details: async (req, res) => {
        try {
            const { contentId } = req.params;
            const admin = await adminModel.findOne();
            
            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }

            const content = admin.uploadedContent.id(contentId);
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }

            return res.status(200).json({ content });
        } catch (error) {
            console.error("Error fetching content details:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

// Helper function
const fetch_user = async (identifier) => {
    try {
        // Support fetching by ID or email
        const query = mongoose.Types.ObjectId.isValid(identifier)
            ? { _id: identifier }
            : { email: identifier };

        const user = await userModel.findOne(query).populate('children');

        if (!user) {
            return { error: "User not found" };
        }

        const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
        const userData = {
            name: fullName,
            type: user.type,
            email: user.email,
        };

        if (user.type === "parent") {
            userData.no_of_children = user.children.length;
        }

        return userData;
    } catch (error) {
        console.error("Error fetching user:", error);
        return { error: "Internal Server Error" };
    }
};

export default adminController;
