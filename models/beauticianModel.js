import mongoose from "mongoose";
import { Schema } from 'mongoose'

const beauticianSchema = new Schema({
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
  specialty: {
    type: String,
    required: [true, "Please enter your specialty"]
  },
  NIN: {
    type: String,
    required: [true, "Please provide your National Identification Number"]
  },
  experience: {
    type: Number,     
  },
  salonName: {
    type: String
   },
   salonAddress: {
    type: String
  },
  isApproved: {
    type: Boolean,
    deafault: false 
  }
})

export const Beautician = mongoose.model('Beautician', beauticianSchema) 

