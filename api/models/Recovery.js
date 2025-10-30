import mongoose from 'mongoose';

const RecoverySchema = new mongoose.Schema({
  // Recovery details
  recoveryType: {
    type: String,
    enum: ['payment_only', 'payment_with_items'],
    required: true
  },
  
  // Shopkeeper information
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'shopkeeper';
      },
      message: props => `${props.value} is not a valid Shopkeeper ID or user is not a shopkeeper!`
    }
  },
  
  // Salesman who collected the recovery
  salesman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'salesman';
      },
      message: props => `${props.value} is not a valid Salesman ID or user is not a salesman!`
    }
  },
  
  // Payment details
  amountCollected: {
    type: Number,
    required: true,
    min: 0
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'other'],
    required: true
  },
  
  // Items delivered (if any)
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: function() {
        return this.recoveryType === 'payment_with_items';
      }
    },
    quantity: {
      type: Number,
      required: function() {
        return this.recoveryType === 'payment_with_items';
      },
      min: 1
    },
    unitPrice: {
      type: Number,
      required: function() {
        return this.recoveryType === 'payment_with_items';
      },
      min: 0
    },
    totalPrice: {
      type: Number,
      required: function() {
        return this.recoveryType === 'payment_with_items';
      },
      min: 0
    }
  }],
  
  // Total value of items delivered
  itemsValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Net payment collected (amountCollected - itemsValue)
  netPayment: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Previous pending amount
  previousPendingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // New pending amount after recovery
  newPendingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Recovery status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true
  },
  
  // Recovery date and time
  recoveryDate: {
    type: Date,
    default: Date.now
  },
  
  // Location of recovery
  recoveryLocation: {
    type: String,
    trim: true
  },
  
  // Receipt/Proof of payment
  receiptNumber: {
    type: String,
    trim: true
  },
  
  // Bank details (if bank transfer)
  bankDetails: {
    bankName: String,
    accountNumber: String,
    transactionId: String,
    chequeNumber: String
  }
}, {
  timestamps: true
});

// Calculate net payment before saving
RecoverySchema.pre('save', function(next) {
  if (this.recoveryType === 'payment_with_items') {
    this.itemsValue = this.items.reduce((total, item) => total + item.totalPrice, 0);
  }
  this.netPayment = this.amountCollected - this.itemsValue;
  this.newPendingAmount = Math.max(0, this.previousPendingAmount - this.netPayment);
  next();
});

// Index for better query performance
RecoverySchema.index({ shopkeeper: 1, salesman: 1, recoveryDate: -1 });
RecoverySchema.index({ status: 1, recoveryDate: -1 });

const Recovery = mongoose.model('Recovery', RecoverySchema);

export default Recovery;
