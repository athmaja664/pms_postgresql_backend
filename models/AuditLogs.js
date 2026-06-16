const mongoose=require('mongoose')
const auditlogSchema=new mongoose.Schema({
action:{
    type:String,
    enum:['proposal_created','link_generated','link_revoked','link_unrevoked','client_accessed','signature_submitted'],
    required:true
},
proposalId:{
    type:mongoose.Schema.Types.Mixed,
    ref: 'Proposal'
},
performedBy:String,
timestamp:{
    type:Date,
    default:Date.now
}
},{ timestamps: true })
module.exports=mongoose.model('AuditLog',auditlogSchema)