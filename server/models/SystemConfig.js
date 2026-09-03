import mongoose from 'mongoose';
const systemConfigSchema = new mongoose.Schema({ clinicName: { type: String, default: 'DocPoint' } }, { timestamps: true });
export default mongoose.model('SystemConfig', systemConfigSchema);
