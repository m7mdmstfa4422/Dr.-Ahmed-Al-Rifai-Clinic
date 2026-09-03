import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({ username: { type: String, required: true, unique: true, lowercase: true }, name: { type: String, required: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: ['admin', 'doctor', 'developer'], default: 'admin' }, permissions: { type: [String], default: ['patients', 'appointments'] } }, { timestamps: true });
export default mongoose.model('Admin', adminSchema);
