import childModel from "../models/childModel.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js"; // Add this import


const addChild = async (req, res) => {
    try {
        // Extract token from headers
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }
        
        const token = authHeader.split(" ")[1];

        // Decode token to get parentId
        let parentId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            parentId = decoded.id; // Assuming token payload contains { id: parentId }
            // console.log("Parent ID:", parentId);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const { name, age, email, password, leadershipGoal, gender, ageGroup, focusAreas } = req.body;
        // console.log(req.body);

        // Verify parent exists
        const parent = await userModel.findById(parentId);
        if (!parent || parent.type !== "parent") {
            return res.status(404).json({ success: false, message: "Parent not found" });
        }

        // Check if a child with this email already exists
        const existingChild = await childModel.findOne({ email });
        if (existingChild) {
            return res.status(400).json({ success: false, message: "Child with this email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new child
        const newChild = new childModel({
            name,
            age,
            email,
            password: hashedPassword,
            leadershipGoal,
            gender,
            ageGroup,
            focusAreas,
            parent: parentId // Use decoded parentId
        });

        // Save the child
        const savedChild = await newChild.save();

        // Update parent's children list
        parent.children.push(savedChild._id);
        await parent.save();

        res.status(201).json({
            success: true,
            message: "Child added successfully",
            child: {
                id: savedChild._id,
                name: savedChild.name,
                email: savedChild.email,
                age: savedChild.age,
                leadershipGoal: savedChild.leadershipGoal,
                gender: savedChild.gender,
                ageGroup: savedChild.ageGroup,
                focusAreas: savedChild.focusAreas
            }
        });
    } catch (error) {
        console.error("Add Child Error:", error);
        res.status(500).json({ success: false, message: "Failed to add child" });
    }
};



// Get all children of a parent
const getChildrenByParent = async (req, res) => {
    try {
        // Extract token from headers
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Decode token to get parentId
        let parentId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            parentId = decoded.id; // Assuming token payload contains { id: parentId }
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // Find parent and populate children
        const parent = await userModel.findById(parentId);
        if (!parent || parent.type !== "parent") {
            return res.status(404).json({ success: false, message: "Parent not found" });
        }
        // console.log("Parent:", parent);

        // Get children linked to the parent
        const children = await childModel.find({ parent: parentId })
            .select("name age email leadershipGoal gender ageGroup focusAreas");

        res.status(200).json({ success: true, children });
    } catch (error) {
        console.error("Get Children Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch children" });
    }
};

// Get a child by ID
const getChildById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const child = await childModel.findById(id)
            .select('name age email leadershipGoal gender ageGroup focusAreas');
        
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }
        
        res.status(200).json({ success: true, child });
    } catch (error) {
        console.error("Get Child Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch child" });
    }
};

// Update a child
const updateChild = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // If password is included, hash it
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        
        const updatedChild = await childModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('name age email leadershipGoal gender ageGroup focusAreas');
        
        if (!updatedChild) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }
        
        res.status(200).json({ success: true, child: updatedChild });
    } catch (error) {
        console.error("Update Child Error:", error);
        res.status(500).json({ success: false, message: "Failed to update child" });
    }
};

// Delete a child
const deleteChild = async (req, res) => {
    try {
        const { id } = req.params;
        
        const child = await childModel.findById(id);
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }
        
        // Remove child reference from parent
        await userModel.findByIdAndUpdate(
            child.parent,
            { $pull: { children: id } }
        );
        
        // Delete the child
        await childModel.findByIdAndDelete(id);
        
        res.status(200).json({ success: true, message: "Child deleted successfully" });
    } catch (error) {
        console.error("Delete Child Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete child" });
    }
};

const updateChildAnswers = async (req, res) => {
    try {
        // Extract token from headers
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Decode token to get child ID
        let childId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            childId = decoded.id; // Assuming the token payload contains { id: childId }
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const { activityName, answers, dateSubmitted } = req.body;

        if (!activityName || !answers || !dateSubmitted) {
            return res.status(400).json({ success: false, message: "Activity name, answers, and date are required" });
        }

        // Find the child
        const child = await childModel.findById(childId);
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Append the new answer entry with the date
        const updatedAnswers = child.answers.get(activityName) || [];
        
        // Process the answers to ensure they're in the proper format
        const processedAnswers = {};
        for (const [key, value] of Object.entries(answers)) {
            // Convert any nested objects to appropriate format
            if (typeof value === 'object' && value !== null) {
                processedAnswers[key] = value;
            } else {
                processedAnswers[key] = value;
            }
        }

        updatedAnswers.push({ date: dateSubmitted, response: processedAnswers });
        console.log("New Answers:", updatedAnswers);

        child.answers.set(activityName, updatedAnswers);
        
        // Normalize activity name by replacing hyphen with underscore
        const normalizedActivityName = activityName.replace(/-/g, '_');
        
        // Check if this is the first completion of specific activities and update firstTasks
        let firstTaskCompleted = null;
        if (normalizedActivityName === "anger_thermometer" && !child.firstTasks.get('anger_thermometer')) {
            firstTaskCompleted = await completeFirstTask(child, "anger_thermometer");
            if (!child.badges.includes(11)) {
                await addBadgeWithBonus(child, 11);
            }
        } else if (normalizedActivityName === "hi_to_anger") {
            firstTaskCompleted = await completeFirstTask(child, "hi_to_anger");
        } else if (normalizedActivityName === "know_your_anger") {
            firstTaskCompleted = await completeFirstTask(child, "know_your_anger");
        }
        
        // After updating answers and scores
        await checkScoreBasedBadges(child);
        await child.save();

        res.status(200).json({ 
            success: true, 
            message: "Answers updated successfully", 
            answers: child.answers,
            firstTaskCompleted: firstTaskCompleted,
            badges: child.badges
        });
        console.log("Answers Updated:", child.answers);
    } catch (error) {
        console.error("Update Answers Error:", error);
        res.status(500).json({ success: false, message: "Failed to update answers" });
    }
};

const addSubjectiveQuestion = async (req, res) => {
    try {
        // Extract token from headers
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Decode token to get user ID
        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id; // Assuming the token payload contains { id: userId }
            console.log("User ID:", userId);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // Extract child ID and subjective question from request body
        const {subjques} = req.body;
        console.log("Subjective Question:", subjques);
        // console.log(req.body);
        if (!subjques) {
            return res.status(400).json({ success: false, message: "Child ID and subjective question are required" });
        }

        // Find the child by ID and ensure it belongs to the logged-in user
        const child = await childModel.findOne({_id: userId});
        console.log("Child:", child);
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found or not associated with this user" });
        }

        // Add the subjective question to the child record
        child.subjques = subjques;
        console.log("Subjective Question:", subjques);

        // Save the updated child record
        await child.save();

        res.status(200).json({ 
            success: true, 
            message: "Subjective question added successfully", 
            child 
        });
        console.log("Subjective Question Added:", child.subjques);
    } catch (error) {
        console.error("Add Subjective Question Error:", error);
        res.status(500).json({ success: false, message: "Failed to add subjective question" });
    }
};

const updateChildProfile = async (req, res) => {
    try {
        // Extract token from headers
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Decode token to get childId
        let childId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            childId = decoded.id; // Assuming token payload contains { id: childId }
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const { name, age, email, gender, leadershipGoal } = req.body;

        // Find and update the child's profile
        const updatedChild = await childModel.findByIdAndUpdate(
            childId,
            { name, age, email, gender, leadershipGoal },
            { new: true }
        ).select('name age email gender leadershipGoal');

        if (!updatedChild) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.status(200).json({ success: true, child: updatedChild });
    } catch (error) {
        console.error("Update Child Profile Error:", error);
        res.status(500).json({ success: false, message: "Failed to update child profile" });
    }
};

const updateChildLeague = (child) => {
    if (child.leadershipScore >= 30000) {
        child.league = "leader";
    } else if (child.leadershipScore >= 18000) {
        child.league = "crystal";
    } else if (child.leadershipScore >= 10000) {
        child.league = "platinum";
    } else if (child.leadershipScore >= 5000) {
        child.league = "gold";
    } else if (child.leadershipScore >= 700) {
        child.league = "silver";
    }
};

const addBadgeWithBonus = async (child, badgeId) => {
    // Check if child already has the badge
    if (child.badges?.includes(badgeId)) {
        console.log(`Badge ${badgeId} already exists for child ${child._id}`);
        return false;
    }

    // Add badge validation based on leadership score
    const badgeRequirements = {
        2: 1000,  // Badge 2 requires 1000 points
        3: 5000,  // Badge 3 requires 5000 points
        4: 15000  // Badge 4 requires 15000 points
    };

    // If this is a score-based badge, check if child meets requirements
    if (badgeRequirements[badgeId] && child.leadershipScore < badgeRequirements[badgeId]) {
        console.log(`Leadership score ${child.leadershipScore} insufficient for badge ${badgeId} (requires ${badgeRequirements[badgeId]})`);
        return false;
    }

    // Initialize badges array if it doesn't exist
    if (!Array.isArray(child.badges)) {
        child.badges = [];
    }

    // Add the badge and bonus
    child.badges.push(badgeId);
    child.leadershipScore = (child.leadershipScore || 0) + 250;
    updateChildLeague(child);
    
    console.log(`Added badge ${badgeId} to child ${child._id}`);
    return true;
};

const checkScoreBasedBadges = async (child) => {
    const currentBadges = new Set(child.badges || []);
    const scoreThresholds = [
        { score: 1000, badge: 2 },
        { score: 5000, badge: 3 },
        { score: 15000, badge: 4 }
    ];

    let badgesAdded = false;
    for (const { score, badge } of scoreThresholds) {
        if (child.leadershipScore >= score && !currentBadges.has(badge)) {
            const added = await addBadgeWithBonus(child, badge);
            if (added) {
                console.log(`Added score-based badge ${badge} for score ${child.leadershipScore}`);
                badgesAdded = true;
            }
        }
    }
    
    if (badgesAdded) {
        await child.save();
    }
};

const completeFirstTask = async (child, taskName) => {
    const taskToBadgeMap = {
        "avatar": 10,
        "anger_thermometer": 11,
        "hi_to_anger": 12,
        "know_your_anger": 13,
        "journal": 14
    };
    
    // Check if task is already completed
    if (child.firstTasks.get(taskName)) {
        console.log(`Task ${taskName} already completed for child ${child._id}`);
        return false;
    }

    // Mark task as completed
    child.firstTasks.set(taskName, true);
    
    // Add badge if it doesn't exist
    const badgeId = taskToBadgeMap[taskName];
    if (badgeId && !child.badges.includes(badgeId)) {
        await addBadgeWithBonus(child, badgeId);
        child.leadershipScore = (child.leadershipScore || 0) + 150;
        updateChildLeague(child);
        console.log(`Added first-task badge ${badgeId} for task ${taskName}`);
        return true;
    }
    
    return false;
};

const addAvatar = async (req, res) => {
    try {
        // Extract token from headers
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Decode token to get childId
        let childId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            childId = decoded.id; // Assuming token payload contains { id: childId }
            console.log("Child ID:", childId);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const { avatar } = req.body;
        // console.log("Avatar:", avatar);

        if (!avatar) {
            return res.status(400).json({ success: false, message: "Avatar data is required" });
        }

        // Find the child
        const child = await childModel.findById(childId);
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Check if this is the first time creating an avatar
        const isFirstAvatar = !child.firstTasks.get('avatar');

        // Update the avatar field
        child.avatar = avatar;
        
        // If this is the first time creating an avatar, mark the task as completed
        if (isFirstAvatar) {
            await completeFirstTask(child, "avatar");
        }
        
        await child.save();

        res.status(200).json({ 
            success: true, 
            message: "Avatar updated successfully",
            avatarUrl: avatar, // Return the avatar URL for confirmation
            firstTimeCreated: isFirstCompletion, // Indicate if this was the first time creating an avatar
            badges: child.badges // Return the updated badges array
        });
        console.log("Avatar Updated:", child.avatar);
    } catch (error) {
        console.error("Update Avatar Error:", error);
        res.status(500).json({ success: false, message: "Failed to update avatar" });
    }
};

const getChildProfile = async (req, res) => {
    try {
        console.log('=== Get Child Profile Debug ===');
        
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("No auth header found");
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ success: false, message: "Invalid token." });
        }

        // Fetch child with specific fields including lastLoginDate
        const child = await childModel.findById(decoded.id)
            .select('_id name email age gender leadershipGoal streaks maxStreak leadershipScore badges avatar league lastLoginDate');
        
        if (!child) {
            console.log('Child not found for ID:', decoded.id);
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Format the lastLoginDate to match UI expectations
        const lastLoginDate = child.lastLoginDate ? new Date(child.lastLoginDate) : new Date();
        console.log('Raw lastLoginDate:', child.lastLoginDate);
        console.log('Formatted lastLoginDate:', lastLoginDate.toISOString());

        // Create response data
        const responseData = {
            _id: child._id,
            name: child.name,
            email: child.email,
            age: child.age,
            gender: child.gender,
            leadershipGoal: child.leadershipGoal || "",
            streaks: child.streaks || 1,
            maxStreak: child.maxStreak || 1,
            leadershipScore: child.leadershipScore || 0,
            badges: child.badges || [],
            avatar: child.avatar || null,
            league: child.league || "bronze",
            lastLoginDate: lastLoginDate.toISOString() // Ensure consistent date format
        };

        console.log('Profile response data:', responseData);
        console.log('=== End Get Child Profile Debug ===');

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Get Child Profile Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch child profile",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};




const updateJournal = async (req, res) => {
    try {
        // Extract Authorization header
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Decode token to get child ID
        let childId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            childId = decoded.id; // Assuming token payload contains { id: childId }
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // Extract journal entry from request body
        const { date, timeOfDay, headline, angerTrigger, emotion, emotionIntensity, coping, consequences, improvements } = req.body;

        if (!date || !timeOfDay || !headline || !angerTrigger || !emotion || !coping) {
            return res.status(400).json({ success: false, message: "Missing required fields in journal entry." });
        }

        // Construct journal entry object
        const journalEntry = {
            date,
            timeOfDay,
            headline,
            angerTrigger,
            emotion,
            emotionIntensity,
            coping,
            consequences,
            improvements,
        };

        // Find and update the child's journal
        const updatedChild = await childModel.findByIdAndUpdate(
            childId,
            { 
                $push: { journal: journalEntry },
                // Set journal task to true if it's the first entry
                'firstTasks.journal': true
            },
            { new: true }
        );

        if (!updatedChild) {
            return res.status(404).json({ success: false, message: "Child not found." });
        }

        // Check if this was the first journal entry
        const isFirstJournal = !updatedChild.firstTasks.get('journal');
        if (isFirstJournal) {
            await completeFirstTask(updatedChild, "journal");
            await updatedChild.save();
        }

        return res.status(200).json({ success: true, message: "Journal updated successfully.", journal: updatedChild.journal });

    } catch (error) {
        console.error("Error updating journal:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

import { HfInference } from "@huggingface/inference";
const HF_ACCESS_TOKEN = process.env.HF_ACCESS;
const hf = new HfInference(HF_ACCESS_TOKEN);

const SYSTEM_PROMPT = `
You are an intelligent assistant that provides concise, meaningful summaries of a child's weekly journal entries. 
Summarize in a clear, informative, and engaging manner. Highlight emotional patterns, key triggers, and coping strategies.

Provide the answer strictly in this JSON object format with specific character length limits for each field:
{
  "primaryEmotion": (string, max 20 chars),
  "averageIntensity": (number between 1-10),
  "overallTrend": (string, max 30 chars),
  "bestTimeOfDay": (string, max 15 chars),
  "mostCommonTrigger": (string, max 30 chars),
  "mostEffectiveCopingStrategy": (string, max 40 chars),
  "additionalComments": (string, max 150 chars)
}

Keep responses within the specified character limits. Do not include any text outside this JSON structure.
`;

// Helper function to summarize text using Hugging Face model
async function summarizeText(text) {
    try {
        const response = await hf.chatCompletion({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Summarize this child's journal entries:\n${text}` },
            ],
            max_tokens: 1024,
            temperature: 0.3,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error summarizing journal:", error.message);
        return "Error generating summary.";
    }
}

function parseWeeklySummary(weeklySummary) {
    try {
        // Try to parse the response as JSON
        const parsedResponse = JSON.parse(weeklySummary);
        
        // Extract and enforce length limits
        return {
            primaryEmotion: (parsedResponse.primaryEmotion || "").substring(0, 20),
            averageIntensity: typeof parsedResponse.averageIntensity === 'number' ? 
                              Math.min(10, Math.max(1, parsedResponse.averageIntensity)) : 5,
            overallTrend: (parsedResponse.overallTrend || "").substring(0, 30),
            bestTimeOfDay: (parsedResponse.bestTimeOfDay || "").substring(0, 15),
            mostCommonTrigger: (parsedResponse.mostCommonTrigger || "").substring(0, 30),
            mostEffectiveCopingStrategy: (parsedResponse.mostEffectiveCopingStrategy || "").substring(0, 40),
            additionalComments: (parsedResponse.additionalComments || "").substring(0, 150)
        };
    } catch (error) {
        console.error("Error parsing weekly summary:", error.message);
        
        // Fallback values
        return {
            primaryEmotion: "Unknown",
            averageIntensity: 5,
            overallTrend: "Unable to determine",
            bestTimeOfDay: "Unknown",
            mostCommonTrigger: "Unknown",
            mostEffectiveCopingStrategy: "Unknown",
            additionalComments: "Error parsing summary output."
        };
    }
}




const getSummary = async (req, res) => {
    try {
        // Extract Authorization header
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        // Extract token
        const token = authHeader.split(" ")[1];
        
        // Decode token to get parent ID
        const childName = req.header("childName");
        let parentId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            parentId = decoded.id; // Assuming token payload contains { id: parentId }
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // Find child by parent ID
        const child = await childModel.findOne({ 
            parent: parentId,
            name: childName
        });

        if (!child || !child.journal || child.journal.length === 0) {
            return res.status(404).json({ success: false, message: "No journal entries found for the child." });
        }

        // Get today's date and last week's date
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);


        const weeklyEntries = child.journal.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= oneWeekAgo && entryDate <= today;  // This ensures past 7 days only
        });
        // Convert journal entries to text format for AI
        const formatJournalEntries = (entries) =>
            entries.map(entry =>
                `Date: ${entry.date}\nTime: ${entry.timeOfDay}\nEmotion: ${entry.emotion} (Intensity: ${entry.emotionIntensity})\nAnger Trigger: ${entry.angerTrigger}\nCoping Strategy: ${entry.coping}\nImprovements: ${entry.improvements}\n`
            ).join("\n");

        const weeklySummaryText = formatJournalEntries(weeklyEntries);
        console.log("Weekly Summary Text:", weeklySummaryText);

        // Generate summaries
        const weeklySummary = weeklySummaryText ? await summarizeText(weeklySummaryText) : "No journal entries this week.";
        console.log("Weekly Summary:", weeklySummary);
        const emotionAnalysis = parseWeeklySummary(weeklySummary);

        console.log("Emotion Analysis:", emotionAnalysis);

        return res.status(200).json({
            success: true,
            weeklySummaryText,
            emotionAnalysis
        });

    } catch (error) {
        console.error("Error fetching summary:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

const getAgeAppropriateContent = async (req, res) => {
    try {
        console.log('[getAgeAppropriateContent] Starting function');
        
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn('[getAgeAppropriateContent] Missing or invalid auth header');
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        console.log('[getAgeAppropriateContent] Processing token:', token.substring(0, 10) + '...');

        let childId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            childId = decoded.id;
            console.log('[getAgeAppropriateContent] Token decoded, childId:', childId);
        } catch (error) {
            console.error('[getAgeAppropriateContent] Token verification failed:', error);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const child = await childModel.findById(childId).select('age');
        if (!child) {
            console.warn('[getAgeAppropriateContent] Child not found:', childId);
            return res.status(404).json({ success: false, message: "Child not found" });
        }
        console.log('[getAgeAppropriateContent] Found child with age:', child.age);

        const admin = await adminModel.findOne().select('uploadedContent');
        console.log('[getAgeAppropriateContent] Found admin:', !!admin);
        
        if (!admin?.uploadedContent?.length) {
            console.log('[getAgeAppropriateContent] No content available');
            return res.status(200).json({ 
                success: true, 
                content: [],
                message: "No content available" 
            });
        }

        console.log('[getAgeAppropriateContent] Total content items:', admin.uploadedContent.length);

        const ageAppropriateContent = admin.uploadedContent.filter(content => {
            const isAppropriate = (
                content.ageRange &&
                content.ageRange.lower <= child.age &&
                content.ageRange.upper >= child.age
            );
            console.log(`Content item ${content._id}: age range ${content.ageRange?.lower}-${content.ageRange?.upper}, appropriate: ${isAppropriate}`);
            return isAppropriate;
        });

        console.log('[getAgeAppropriateContent] Filtered content count:', ageAppropriateContent.length);

        return res.status(200).json({ 
            success: true, 
            content: ageAppropriateContent,
            childAge: child.age
        });

    } catch (error) {
        console.error("[getAgeAppropriateContent] Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getChildImages = async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied" });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const childId = decoded.id;

        const child = await childModel.findById(childId).select('age');
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        const admin = await adminModel.findOne();
        if (!admin?.uploadedContent?.length) {
            return res.status(200).json({ success: true, content: [] });
        }

        const ageAppropriateImages = admin.uploadedContent.filter(content => 
            content.type === 'image' &&
            content.ageRange.lower <= child.age &&
            content.ageRange.upper >= child.age
        );

        return res.status(200).json({ success: true, content: ageAppropriateImages });
    } catch (error) {
        console.error("Error fetching images:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getChildVideos = async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied" });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const childId = decoded.id;

        const child = await childModel.findById(childId).select('age');
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        const admin = await adminModel.findOne();
        if (!admin?.uploadedContent?.length) {
            return res.status(200).json({ success: true, content: [] });
        }

        const ageAppropriateVideos = admin.uploadedContent.filter(content => 
            content.type === 'video' &&
            content.ageRange.lower <= child.age &&
            content.ageRange.upper >= child.age
        );

        return res.status(200).json({ success: true, content: ageAppropriateVideos });
    } catch (error) {
        console.error("Error fetching videos:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getChildPdfs = async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied" });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const childId = decoded.id;

        const child = await childModel.findById(childId).select('age');
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        const admin = await adminModel.findOne();
        if (!admin?.uploadedContent?.length) {
            return res.status(200).json({ success: true, content: [] });
        }

        const ageAppropriatePdfs = admin.uploadedContent.filter(content => 
            content.type === 'pdf' &&
            content.ageRange.lower <= child.age &&
            content.ageRange.upper >= child.age
        );

        return res.status(200).json({ success: true, content: ageAppropriatePdfs });
    } catch (error) {
        console.error("Error fetching PDFs:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getChildStats = async (req, res) => {
    try {
        const { email } = req.params;
        const child = await childModel.findOne({ email })
            .select('name streaks maxStreak leadershipScore badges league');

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        return res.status(200).json({
            success: true,
            stats: {
                name: child.name,
                streaks: child.streaks || 0,
                maxStreak: child.maxStreak || 0,
                leadershipScore: child.leadershipScore || 0,
                badges: child.badges || [],
                league: child.league || 'bronze'
            }
        });
    } catch (error) {
        console.error("Error fetching child stats:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { addChild, getChildrenByParent, getChildById, updateChild, deleteChild, updateChildAnswers, addSubjectiveQuestion, addAvatar, getChildProfile, updateJournal, getSummary, getAgeAppropriateContent, getChildImages, getChildVideos, getChildPdfs, getChildStats };