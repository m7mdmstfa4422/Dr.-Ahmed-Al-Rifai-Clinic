import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  scheduledAt: { type: Date, required: true },
  queueNumber: { type: Number, default: null },
  title: { type: String, trim: true, default: 'كشف عيادة' },
  amount: { type: Number, min: 0, default: 0 },
  visitType: { type: String, enum: ['كشف', 'متابعة'], default: 'كشف' },
  paymentStatus: { type: String, enum: ['غير محصل', 'محصل'], default: 'غير محصل' },
  arrivedAt: { type: Date, default: null },
  enteredAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  status: { type: String, enum: ['محجوز', 'انتظار', 'دخل للطبيب', 'غادر', 'ملغى'], default: 'محجوز' },
  notes: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

appointmentSchema.index({ clinic: 1, scheduledAt: 1, status: 1 });
export default mongoose.model('Appointment', appointmentSchema);
