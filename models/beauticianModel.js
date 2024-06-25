import mongoose from "mongoose";
import { Schema } from 'mongoose'

const beauticianSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: true,
    required: [true, "Please enter your specialty"]
  },
  experience: {
    type: Number, 
    required: [true, "Please enter your years of experience"]
  },
  salonName: {
    type: String
   },
   salonAddress: {
    type: String
  }
})

export const Beautician = mongoose.model('Beautician', beauticianSchema) 

