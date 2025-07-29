import { CopingSkills, SituationResponses } from '../models/activity5Model.js';

// Save selected coping skills
const saveCopingSkills = async (req, res) => {
    try {
        const { selectedSkills, completedAt } = req.body;
        
        // Validate input
        if (!selectedSkills || !Array.isArray(selectedSkills) || selectedSkills.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least 3 coping skills'
            });
        }
        
        // Get user ID if available (might be null during testing)
        const userId = req.user?.id;
        
        // Create new record
        const copingSkills = new CopingSkills({
            user: userId,
            selectedSkills,
            completedAt: completedAt || new Date()
        });
        
        await copingSkills.save();
        
        res.status(201).json({
            success: true,
            message: 'Coping skills saved successfully'
        });
    } catch (error) {
        console.error('Error saving coping skills:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save coping skills' 
        });
    }
};

// Save situation responses
const saveSituationResponses = async (req, res) => {
    try {
        const { situationResponses, completedAt } = req.body;
        
        // Validate input
        if (!situationResponses || Object.keys(situationResponses).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No responses provided'
            });
        }
        
        // Get user ID if available (might be null during testing)
        const userId = req.user?.id;
        
        // Create new record
        const responses = new SituationResponses({
            user: userId,
            situationResponses,
            completedAt: completedAt || new Date()
        });
        
        await responses.save();
        
        res.status(201).json({
            success: true,
            message: 'Situation responses saved successfully'
        });
    } catch (error) {
        console.error('Error saving situation responses:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save situation responses' 
        });
    }
};

// Get all Activity 5 progress for a user
const getActivity5Progress = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        // If there's no user ID, return empty data
        if (!userId) {
            return res.status(200).json({
                success: true,
                progress: {
                    copingSkills: [],
                    situationResponses: []
                }
            });
        }
        
        // Get data for the user
        const copingSkills = await CopingSkills.find({ user: userId })
            .sort({ completedAt: -1 })
            .limit(5);
            
        const situationResponses = await SituationResponses.find({ user: userId })
            .sort({ completedAt: -1 })
            .limit(5);
            
        res.status(200).json({
            success: true,
            progress: {
                copingSkills,
                situationResponses
            }
        });
    } catch (error) {
        console.error('Error fetching Activity 5 progress:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch Activity 5 progress' 
        });
    }
};

export { saveCopingSkills, saveSituationResponses, getActivity5Progress };