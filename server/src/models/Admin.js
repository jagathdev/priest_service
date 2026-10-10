import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  name: {
    type: String,
    required: true
  },
  lastLoginAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
