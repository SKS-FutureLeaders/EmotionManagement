import mongoose from 'mongoose';

// Schema for tracking a user's progress in each curriculum value
const curriculumProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for testing without auth
    },
    // The core value being tracked (kindness, integrity, responsibility)
    value: {
        type: String,
        required: true,
        enum: ['kindness', 'integrity', 'responsibility']
    },
    // Track progress for each section
    sections: {
        lesson: {
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: {
                type: Date
            }
        },
        story: {
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: {
                type: Date
            }
        },
        quiz: {
            completed: {
                type: Boolean,
                default: false
            },
            score: {
                type: Number,
                min: 0
            },
            totalQuestions: {
                type: Number,
                min: 0
            },
            completedAt: {
                type: Date
            }
        }
    },
    // When the record was first created
    createdAt: {
        type: Date,
        default: Date.now
    },
    // When any section was last updated
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for faster queries
curriculumProgressSchema.index({ user: 1, value: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt timestamp
curriculumProgressSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const CurriculumProgress = mongoose.model('CurriculumProgress', curriculumProgressSchema);

export default CurriculumProgress;