const con=require('../config/db')
// ADD CLIENT
exports.addClients = async (req, res) => {
    const { name, email } = req.body
    try {
        const existingClient = await con.query('SELECT * FROM clients WHERE email=$1',[email])
        if (existingClient.rows.length>0) {
            return res.status(400).json({ message: "Client already exists" })
        }
       const result = await con.query('INSERT INTO clients(name,email) VALUES($1,$2) RETURNING *', [name,email])
      
       res.status(200).json({ message: "Client added successfully", newClient: result.rows[0] })
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//GET CLIENT FOR ADD PROJECT
exports.getClients=async(req,res)=>{
    try{
        const clients=await con.query('SELECT * FROM clients ORDER BY created_at DESC')
        res.status(200).json(clients.rows)

    }catch(err){
        res.status(500).json({error:err.message})
    }
}