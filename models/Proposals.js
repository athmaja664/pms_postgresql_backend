const mongoose = require('mongoose')
const proposalSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    cost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    documentUrl: {
        type: String,
        required: true
    }

}, { timestamps: true })
module.exports = mongoose.model('Proposal', proposalSchema)