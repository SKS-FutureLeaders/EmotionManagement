import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    leadershipGoal: { type: String },
    league: { 
        type: String, 
        enum: ["bronze", "silver", "gold", "platinum", "crystal", "leader"],
        default: "bronze"
    },
    prev_angerScore: { type: Number, default: 0 },
    new_angerScore: { type: Number, default: 0 },
    leadershipScore: { type: Number, default: 0 },
    gender: { type: String },
    focusAreas: [{ type: String }],
    streaks: { type: Number, default: 1 },
    maxStreak: { type: Number, default: 1 },
    lastLoginDate: { type: Date }, // Removed default value
    firstTasks: {
        type: Map,
        of: Boolean,
        default: {
            "avatar": false,
            "anger_thermometer": false,
            "hi_to_anger": false,
            "know_your_anger": false,
            "journal": false,
        }
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answers: {
        type: Map,
        of: [{
            date: { type: String, required: true }, // Store submission date
            response: { 
                type: Map, 
                of: mongoose.Schema.Types.Mixed // Changed from Boolean to Mixed type
            }
        }],
        default: {} 
    },
    journal: {
        type: [{
            date: { type: Date, required: true },
            timeOfDay: { type: String, required: true },
            headline: { type: String, required: true },
            angerTrigger: { type: String, required: true },
            emotion: { type: String, required: true },
            emotionIntensity: { type: Number, required: true },
            coping: { type: String, required: true },
            consequences: { type: String },
            improvements: { type: String },
        }],
        default: []
    },
    subjques: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null
    },
    avatar: {
        type: String, // Store avatar as base64 string or URL
        default: null
    },
    hasReceivedFirstLoginBonus: { type: Boolean, default: false },
    badges: { type: [Number], default: [] },
    weeklyProgress: { 
        type: [Number], 
        default: Array(7).fill(-1) 
    }    
});

const childModel = mongoose.model("Child", childSchema);
export default childModel;