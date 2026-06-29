const con=require('../config/db')
//ADD PROJECT
exports.addProjects = async (req, res) => {

    try {
        const { projectName, clientId } = req.body
        const existingProject = await con.query('SELECT * FROM projects WHERE project_name=$1 AND client_id=$2',[projectName,clientId])
        if (existingProject.rows.length>0) {
            return res.status(400).json({ message: "Project already exists" })
        }
        const result = await con.query('INSERT INTO projects(project_name,client_id) VALUES($1,$2) RETURNING *',[projectName,clientId]) 
      
        res.status(200).json({
            message: "client added successfully", newProject:result.rows[0]
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}



//GET PROJECT
exports.getProjects=async(req,res)=>{
    try{
    const projects=await con.query('SELECT * FROM projects ORDER BY created_at DESC')
    res.status(200).json(projects.rows)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}

