import express from "express";
import { loginUser, registerUser, getParentProfile, forgotPassword, resetPassword} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/profile",getParentProfile);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
