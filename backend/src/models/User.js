import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  following: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
