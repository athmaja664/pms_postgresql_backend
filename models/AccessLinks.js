const mongoose = require('mongoose')
const accesslinkSchema = new mongoose.Schema({
    proposalId: {
        type: mongoose.Schema.Types.ObjectId,//auto-generated, unique
         ref: 'Proposal',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique:true
    },
    passwordHash: {
        type: String,
        required: true

    },
    expiryDate: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default:false
    }
}, { timestamps: true })
module.exports = mongoose.model('AccessLink', accesslinkSchema)