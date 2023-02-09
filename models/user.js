const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    email: { type: String, required: true },
    password: {
        type: String,
        minLength: 6,
        maxLength: 20,
        required: [true, 'Password is required']
    },
    age: { type: Number, min: [18, 'Minimum age should be 18'] },
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }]
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

userSchema.virtual('fullName').get(function() {
    return this.name.first + ' ' + this.name.last;
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    bcrypt.hash(this.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }

        this.password = hash;
        return next();
    });
});

userSchema.methods.comparePassword = function(clientPassword, next) {
    bcrypt.compare(clientPassword, this.password, (err, result) => {
        if (err) return next(err);

        return next(null, result);
    });
}

module.exports = mongoose.model('User', userSchema);