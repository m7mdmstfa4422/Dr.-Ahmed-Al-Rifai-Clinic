import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  title: { type: String, required: true, trim: true },
  notes: { type: String, trim: true, default: '' },
  amount: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['مكتمل', 'انتظار', 'ملغى'], default: 'مكتمل' },
  visitDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Visit', visitSchema);
