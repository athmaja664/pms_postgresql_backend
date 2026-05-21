const mongoose = require('mongoose')
const proposalSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'AddClient',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'AddProject',
        required: true
    },
    cost: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Archived'], //not aloww cmplt done anything elsein the box
        default: 'Draft'
    },
    documentUrl: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true })
module.exports = mongoose.model('Proposal', proposalSchema)