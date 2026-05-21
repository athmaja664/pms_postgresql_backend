const AddProject = require('../models/AddProjects')

//ADD PROJECT
exports.addProjects = async (req, res) => {

    try {
        const { projectName, clientId } = req.body
        const existingProject = await AddProject.findOne({ projectName, clientId })
        if (existingProject) {
            return res.status(400).json({ message: "Project already exists" })
        }
        const newProject = new AddProject({
            projectName, clientId
        })
        await newProject.save()
        res.status(200).json({
            message: "client added successfully", newProject
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//GET PROJECT

exports.getProjects=async(req,res)=>{
    try{
    const projects=await AddProject.find()
    res.status(200).json(projects)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}