import mongoose from 'mongoose';

const productDistributionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  distributionType: {
    type: String,
    enum: ['admin_to_salesman', 'salesman_to_shopkeeper'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'returned'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  // For tracking delivery
  deliveredAt: {
    type: Date,
    default: null
  },
  // For tracking returns
  returnedAt: {
    type: Date,
    default: null
  },
  returnReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('ProductDistribution', productDistributionSchema);
