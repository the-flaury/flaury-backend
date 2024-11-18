import bcrypt from 'bcryptjs'
import { passwordValidator, sanitizePhoneNumber, cloudinary, sendEmail } from '../../../utils/index.js'
import { handleErrors } from '../../../middlewares/errorHandler.js'
import { Beautician } from '../../../models/Beautician/beautician-model.js'
import { User } from '../../../models/User/user-model.js'


export const registerBeautician = async (req, res) => {
  try {
    const { email, name, phoneNumber, password, role, specialty } = req.body    

    const existingBeautician = await Beautician.findOne({ email })
    if (existingBeautician) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists.' })
    }
    
    // existing account with user model
    const existingBusinessAccount = await User.findOne({email})
    if (existingBusinessAccount) {
      return res.status(400).json({success: false, messsage: "This email is already associated with a user account. Please use a different email to register."})
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your NIN'
      })
    }

    // Upload file to Cloudinary using a stream
    const streamUpload = (file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((err, result) => {
          if (result) {
            resolve(result)
          } else {
            reject(err)
          }
        })
        stream.end(file.buffer)
      })
    }

    const uploadRes = await streamUpload(req.file)

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

    const beautician = await newBeautician.save()
    await sendEmail(email, subject, text, template, context)
    res
      .status(201)
      .json({data : { success: true, message: 'Account Created Successfully', beautician }})
  } catch (error) {
    handleErrors(error, res)
  }
}