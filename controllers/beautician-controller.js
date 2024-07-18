import bcrypt from 'bcryptjs'
import { passwordValidator, sanitizePhoneNumber, cloudinary, sendEmail } from '../utils/index.js'
import { handleErrors } from '../middlewares/errorHandler.js'
import { Beautician } from '../models/beauticianModel.js'


export const registerBeautician = async (req, res) => {
  try {
    const { email, name, phoneNumber, password, role, specialty } = req.body    

    const existingBeautician = await Beautician.findOne({ email })
    if (existingBeautician) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists.' })
    }
    
   // Validate phone number
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber)
    if (!sanitizedPhone.status) {
      return res.status(400).json({ success: false, message: sanitizedPhone.message })
    }

    // Validate password
    if (!passwordValidator(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, one symbol (@#$%^&*!), and have a minimum length of 8 characters'
      })
    }

    const hashPassword = await bcrypt.hash(password, 10)  

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your NIN'
      })
    }

    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: 'Flaury-backend'
    })
    const ninUrl = uploadRes.secure_url
    
    const firstName = name.split(' ')[0]

    const newBeautician = Beautician({
      email,
      name,
      password: hashPassword,
      phoneNumber: sanitizedPhone.phone,
      NIN: ninUrl,
      specialty,
      role,
      isApproved: false
    }) 

    const subject = 'Your Hustle Has Met With Success!'
    const text = 'Thank you for registering with us!'
    const template = 'welcomeBeautician'    
    const context = {
        firstname: firstName
    }

    const savedBeautician = await newBeautician.save()
    await sendEmail(email, subject, text, template, context)
    res
      .status(201)
      .json({ success: true, message: 'Account Created Successfully', savedBeautician })
  } catch (error) {
    handleErrors(error, res)
  }
}