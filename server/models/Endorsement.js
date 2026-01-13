const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Ensure user can't endorse themselves
endorsementSchema.pre('save', function(next) {
  if (this.from.toString() === this.to.toString()) {
    next(new Error('Cannot endorse yourself'));
  } else {
    next();
  }
});

// Index for faster queries
endorsementSchema.index({ to: 1, skill: 1 });
endorsementSchema.index({ from: 1 });

module.exports = mongoose.model('Endorsement', endorsementSchema);
