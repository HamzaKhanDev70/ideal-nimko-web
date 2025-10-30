// models/ShopSalesmanAssignment.js
import mongoose from 'mongoose';

const shopSalesmanAssignmentSchema = new mongoose.Schema({
  salesmanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
shopSalesmanAssignmentSchema.index({ salesmanId: 1, shopkeeperId: 1 });
shopSalesmanAssignmentSchema.index({ salesmanId: 1, isActive: 1 });

// Ensure unique active assignments
shopSalesmanAssignmentSchema.index(
  { salesmanId: 1, shopkeeperId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model('ShopSalesmanAssignment', shopSalesmanAssignmentSchema);
