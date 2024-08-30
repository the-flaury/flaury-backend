import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { passwordValidator, sanitizePhoneNumber, cloudinary, sendEmail } from '../../../utils/index.js'
import { handleErrors } from '../../../middlewares/errorHandler.js'
import { User } from '../../../models/User/user-model.js'
import { Beautician } from '../../../models/Beautician/beautician-model.js'

const period = 60 * 60 * 24 * 3
const baseUrl = 'https://flaury-backend.onrender.com/api/v1/user'


export const registerUser = async (req, res) => {
  try {
    const { email, name, phoneNumber, password, role } = req.body    

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists.' })
    }

    const existingBusinessAccount = await Beautician.findOne({email})
    if (existingBusinessAccount) {
      return res.status(400).json({success: false, messsage: "This email is already associated with a business account. Please use a different email to register."})
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

    let imageUrl = User.schema.path('profilePics').defaultValue
    if (req.file && req.file.path){
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'Flaury-backend'
      })
  
       imageUrl = uploadRes.secure_url
    }
    
    const firstName = name.split(' ')[0]

    const newUser = User({
      email,
      name,
      password: hashPassword,
      phoneNumber: sanitizedPhone.phone,
      profilePics: imageUrl,
      role
    }) 

    const subject = 'Welcome to Flaury!'
    const text = 'Thank you for registering with us!'
    const template = 'welcomeMessage'
    const context = {
      firstname: firstName
    }    

    const user = await newUser.save()
    await sendEmail(email, subject, text, template, context)
    res
      .status(201)
      .json({data :{ success: true, message: 'Account Created Successfully', user }})
  } catch (error) {
    handleErrors(error, res)
  }
}


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    // console.log(req.body)

    if(!email || !password){
      return res.status(401).json({success: false, message:"All fields are required"})
    }

    let user = await User.findOne({email})
    let role = "Customer"
    
   if(!user){
      user = await Beautician.findOne({email})
      role = "Beautician"
    }
    
    // console.log(user)
    if(!user){
      return res.status(404).json({ success: false, message: 'User with the email or password not found' });
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
      return res.status(401).json({ success: false, message: 'Invalid Password' })
    }

    jwt.sign(
      { id: user._id },
      process.env.SECRET,
      { expiresIn: '1hr' },
      (err, token) => {
        if (err) throw err;
        res.cookie(`${role.toLowerCase()}Id`, user._id, { maxAge: period, httpOnly: true })
        res.status(200).json({ data : {
          success: true,
          message: `${role} Login Successfully`,
          user,
          token
        }
        })
      }
    )
}
  catch(error){
    handleErrors(error, res)
  }
}


export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body
    // check if email exists
    const existingEmail = await User.findOne({email})
    if(!existingEmail){
      return res.status(404).json({success: false, message: "User with this email does not exist."})
    }
    const token = jwt.sign({email : existingEmail.email, id: existingEmail._id}, process.env.SECRET, {
      expiresIn: "5m"
    })
    const link = `${baseUrl}/reset-password/${existingEmail._id}/${token}`

    const subject = 'Reset Your Password'
    const text = 'Reset Your Password!'
    const template = 'forgetPassword'
    const context = {
      resetLink: link
    }    
    await sendEmail(email, text, subject, template, context)
    res.status(200).json({success: true, message: "Reset link successfully sent, kindly check your email to set a new password"})
  }
  catch(error){
    handleErrors(error, res)
  }
}

export const getResetPassword = async (req, res) => {
try {
  const {id, token} = req.params
  const exisintigUser = await User.findOne({_id: id})
  if(!exisintigUser){
    return res.status(404).json({success: false, message: "User does not exists."})
  }
  jwt.verify(token, process.env.SECRET) 
  res.status(200).json({success: true, message: "Reset password link is valid."})
}
catch(error){
  handleErrors(error, res)
}
}

export const postResetPassword = async (req, res) => {
  try {
  const {id, token} = req.params
  const { password } = req.body
  const exisintigUser = await User.findOne({_id: id})
  if(!exisintigUser){
    return res.status(404).json({success: false, message: "User does not exists."})
  }
  jwt.verify(token, process.env.SECRET) 
  const hashPassword = await bcrypt.hash(password, 10)  
  await User.updateOne({_id: id}, {
    $set : {
      password: hashPassword
    }
  })
  res.status(201).json({success: true, message: "Password changed successfully"})
}
catch(error){
  handleErrors(error, res)
}
}