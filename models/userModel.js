import mongoose from "mongoose";
import { Schema } from 'mongoose'

const userSchema = new Schema({
  email : {
    type: String,
    required: [true, "Please provide your email."],
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
  role: {
    type: String, 
    required: true,
    enum: ['Beautician', 'Customer']
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
