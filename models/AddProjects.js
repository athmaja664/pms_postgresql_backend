const mongoose=require('mongoose')
const addprojectSchema=new mongoose.Schema({
projectName:{
    type:String,
    required:true,
    trim:true
},
clientId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'AddClient'
}
},{timestamps:true})
module.exports=mongoose.model('AddProject',addprojectSchema)