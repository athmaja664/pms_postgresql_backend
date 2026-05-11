const mongoose=require('mongoose')
const auditlogSchema=new mongoose.Schema({
action:{
    type:String,
    required:true
},
proposalId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'Proposal'//without only get proposlid otherwise get proposal document data
},
performedBy:{
    type:String,
    required:true
}
},{timestamps:true})
module.exports=mongoose.model('AuditLog',auditlogSchema)