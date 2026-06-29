const con=require('../config/db')
const createProjectTable=async()=>{
    await con.query(`
        CREATE TABLE IF NOT EXISTS projects(
        id SERIAL PRIMARY KEY,
        project_name VARCHAR(255) NOT NULL,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )`)
        console.log('Project table ready');  
}
module.exports=createProjectTable





// const mongoose=require('mongoose')
// const addprojectSchema=new mongoose.Schema({
// projectName:{
//     type:String,
//     required:true,
//     trim:true
// },
// clientId:{
//     type:mongoose.Schema.Types.ObjectId,
//     required:true,
//     ref: 'AddClient'
// }
// },{timestamps:true})
// module.exports=mongoose.model('AddProject',addprojectSchema)