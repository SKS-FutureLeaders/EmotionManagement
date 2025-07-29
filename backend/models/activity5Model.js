import mongoose from 'mongoose';

// Schema for coping skills selection
const copingSkillsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for testing without auth
    },
    selectedSkills: [{
        type: String,
        required: true
    }],
    completedAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for situation responses
const situationResponsesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for testing without auth
    },
    situationResponses: {
        type: Map,
        of: String,
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

// Add progress tracking to the model
const progressTrackingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedActivities: {
        copingSkills: {
            type: Boolean,
            default: false
        },
        situationResponses: {
            type: Boolean,
            default: false
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Export models
const CopingSkills = mongoose.model('CopingSkills', copingSkillsSchema);
const SituationResponses = mongoose.model('SituationResponses', situationResponsesSchema);
const ActivityProgress = mongoose.model('ActivityProgress', progressTrackingSchema);

export { CopingSkills, SituationResponses, ActivityProgress };