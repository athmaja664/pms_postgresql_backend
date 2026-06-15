const mongoose = require('mongoose')
const signatureSchema = new mongoose.Schema({
    proposalId: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Proposal',
        required: true
    },
    clientName:String,
    clientEmail:String,
    decision:{
        type:String,
        enum:['Accepted','Rejected'],
        required:true
    },
    signatureMethod:{
        type:String,
        enum:['draw','upload']
    },
    signatureImageUrl:String,
    ipAddress:String,
    signedAt:{
        type:Date,
        default:Date.now
    }
}, { timestamps: true })
module.exports = mongoose.model('Signature', signatureSchema)