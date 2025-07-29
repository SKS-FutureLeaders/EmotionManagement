import express from "express";
import { addChild, getChildrenByParent, getChildById, updateChild, deleteChild, 
    updateChildAnswers, addSubjectiveQuestion, addAvatar, getChildProfile, updateJournal, 
    getSummary, getAgeAppropriateContent, getChildImages, getChildVideos, getChildPdfs,
    getChildStats } from "../controllers/childController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();

console.log('Setting up child routes');

// Change the base path back to /childauth
router.post("/add", addChild);  // This will be accessed as /childauth/add
router.get("/getchildren", getChildrenByParent);
router.get("/summary", getSummary);
router.put("/addsubjectivequestion", addSubjectiveQuestion);
router.put("/avatar", addAvatar);
router.get("/getprofile", protect, getChildProfile);
router.get("/getprofile/:email", protect, getChildProfile);
router.put('/journal', updateJournal);
router.put("/answers", updateChildAnswers);

// Content routes
router.get('/content/images', getChildImages);
router.get('/content/videos', getChildVideos);
router.get('/content/pdfs', getChildPdfs);
router.get('/content', getAgeAppropriateContent);

// Profile routes - note the path is now /childauth/getprofile
router.get("/getprofile", protect, getChildProfile);
router.get("/getprofile/:email", protect, getChildProfile);

// Other routes
router.get('/stats/:email', getChildStats);

// Parameter routes last
router.get("/:id", getChildById);
router.put("/:id", updateChild);
router.delete("/:id", deleteChild);

console.log('Child routes setup completed');

export default router;