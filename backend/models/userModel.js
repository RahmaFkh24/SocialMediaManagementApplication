const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false
        },
        subscription: {
            status: { type: String, enum: ['active', 'trialing', 'inactive'], default: 'inactive' },
            stripeCustomerId: { type: String },
            stripeSubscriptionId: { type: String },
            trialEnd: { type: Date }
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);