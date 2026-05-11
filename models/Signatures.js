const mongoose = require('mongoose')
const signatureSchema = new mongoose.Schema({
    proposalId: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Proposal',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },
    ipAddress: {
        type: String,
        required: true,
    }
}, { timestamps: true })
module.exports = mongoose.model('Signature', signatureSchema)