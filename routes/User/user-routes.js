import express from 'express'
import { registerUser, loginUser, forgetPassword, getResetPassword , postResetPassword} from "../../controllers/User/Auth/auth-controllers.js"
import { upload } from "../../utils/index.js"


export const userRoutes = express.Router()

userRoutes.post('/register', upload.single('profilePics'), registerUser)
userRoutes.post('/login', loginUser)
userRoutes.post('/forget-password', forgetPassword)
userRoutes.get('/reset-password/:id/:token', getResetPassword)
userRoutes.post('/reset-password/:id/:token', postResetPassword)
