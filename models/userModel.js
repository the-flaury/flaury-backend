import mongoose from "mongoose";
import { Schema } from 'mongoose'

const userSchema = new Schema({
  email : {
    type: String,
    required: [true, "Please provide your email"],
    lowercase: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, "Please provide your name"]
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide your phone number"]
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minLength: [6, "Please your password must not be less than 6 chracters."],
  },
  profilePics: {
    type: String,
    default: "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671116.jpg?w=740&t=st=1717845409~exp=1717846009~hmac=ad4ba572994aab89a1eecd54770c5b1313ef6dfd2e81e6a9f8d352309b7d2a2a"
  },
  gender: {
    type: String
  },
  role: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export const User = mongoose.model('User', userSchema)
