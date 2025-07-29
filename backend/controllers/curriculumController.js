import CurriculumProgress from '../models/curriculumModel.js';

// Get progress for a specific core value
const getValueProgress = async (req, res) => {
    try {
        const { value } = req.params;
        
        if (!value || !['kindness', 'integrity', 'responsibility'].includes(value)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid core value requested'
            });
        }
        
        // Get user ID if available (might be null during testing)
        const userId = req.user?.id;
        
        // If there's no user ID, return default values
        if (!userId) {
            return res.status(200).json({
                success: true,
                progress: {
                    lesson: false,
                    story: false,
                    quiz: false
                }
            });
        }
        
        // Find existing progress or create default
        let progress = await CurriculumProgress.findOne({ user: userId, value });
        
        if (!progress) {
            // Return default values if no record exists yet
            return res.status(200).json({
                success: true,
                progress: {
                    lesson: false,
                    story: false,
                    quiz: false
                }
            });
        }
        
        // Format response
        res.status(200).json({
            success: true,
            progress: {
                lesson: progress.sections.lesson.completed,
                story: progress.sections.story.completed,
                quiz: progress.sections.quiz.completed,
                quizScore: progress.sections.quiz.score,
                quizTotal: progress.sections.quiz.totalQuestions
            }
        });
    } catch (error) {
        console.error(`Error getting ${req.params.value} progress:`, error);
        res.status(500).json({ 
            success: false, 
            message: `Failed to get ${req.params.value} progress` 
        });
    }
};

// Update progress for a section of a core value
const updateProgress = async (req, res) => {
    try {
        const { value } = req.params;
        const { section, completed, score, total } = req.body;
        
        // Validate inputs
        if (!value || !['kindness', 'integrity', 'responsibility'].includes(value)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid core value'
            });
        }
        
        if (!section || !['lesson', 'story', 'quiz'].includes(section)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid section'
            });
        }
        
        // Get user ID if available (might be null during testing)
        const userId = req.user?.id;
        
        // Find existing record or create new one
        let progress = await CurriculumProgress.findOne({ user: userId, value });
        
        if (!progress) {
            progress = new CurriculumProgress({
                user: userId,
                value,
                sections: {
                    lesson: { completed: false },
                    story: { completed: false },
                    quiz: { completed: false }
                }
            });
        }
        
        // Update the specific section
        progress.sections[section].completed = completed;
        progress.sections[section].completedAt = new Date();
        
        // Update quiz score if provided
        if (section === 'quiz' && score !== undefined && total !== undefined) {
            progress.sections.quiz.score = score;
            progress.sections.quiz.totalQuestions = total;
        }
        
        // Save the updated record
        await progress.save();
        
        res.status(200).json({
            success: true,
            message: `${value} ${section} progress updated successfully`
        });
    } catch (error) {
        console.error(`Error updating ${req.params.value} progress:`, error);
        res.status(500).json({ 
            success: false, 
            message: `Failed to update ${req.params.value} progress` 
        });
    }
};

// Get overall curriculum progress for all values
const getAllProgress = async (req, res) => {
    try {
        // Get user ID if available (might be null during testing)
        const userId = req.user?.id;
        
        // If there's no user ID, return empty data
        if (!userId) {
            return res.status(200).json({
                success: true,
                progress: []
            });
        }
        
        // Find all progress records for the user
        const progressRecords = await CurriculumProgress.find({ user: userId });
        
        // Format response
        const formattedProgress = progressRecords.map(record => ({
            value: record.value,
            sections: {
                lesson: {
                    completed: record.sections.lesson.completed,
                    completedAt: record.sections.lesson.completedAt
                },
                story: {
                    completed: record.sections.story.completed,
                    completedAt: record.sections.story.completedAt
                },
                quiz: {
                    completed: record.sections.quiz.completed,
                    score: record.sections.quiz.score,
                    totalQuestions: record.sections.quiz.totalQuestions,
                    completedAt: record.sections.quiz.completedAt
                }
            },
            updatedAt: record.updatedAt
        }));
        
        res.status(200).json({
            success: true,
            progress: formattedProgress
        });
    } catch (error) {
        console.error('Error getting all curriculum progress:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get curriculum progress' 
        });
    }
};

export { getValueProgress, updateProgress, getAllProgress };