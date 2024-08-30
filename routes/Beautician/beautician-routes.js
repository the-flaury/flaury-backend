import express from 'express'
import { registerBeautician } from "../../controllers/Beautician/Auth/auth-controller.js";
import { upload } from "../../utils/index.js"

export const beauticianRoutes = express.Router()

beauticianRoutes.post('/register', upload.single('NIN'), registerBeautician)

