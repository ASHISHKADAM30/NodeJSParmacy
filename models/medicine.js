const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);