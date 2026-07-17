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
exports.getClients = async (req, res) => {
    try {
        const clients = await con.query(`
            SELECT clients.*, COUNT(proposals.id) AS proposal_count
            FROM clients
            LEFT JOIN proposals ON proposals.client_id = clients.id
            GROUP BY clients.id
            ORDER BY clients.created_at DESC
        `)
        res.status(200).json(clients.rows)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
}

//UPDATE CLIENTS
exports.updateClient=async(req,res)=>{
   try{
    const{id}=req.params
    const{name,email}=req.body
    const existing=await con.query('SELECT * FROM clients WHERE id=$1',[id])
    if(existing.rows.length===0){
        return res.status(404).json({message:"Client not found"})
    }
    const current=existing.rows[0]
    const updatedName=name||current.name
    const updatedeEmail=email||current.email
    const result=await con.query(`UPDATE clients SET name=$1,email=$2 WHERE id=$3 RETURNING *`,[updatedName,updatedeEmail,id])
    res.status(200).json({message:"Client updated",updatedClient:result.rows[0]})
   }catch(err){
    res.status(500).json({error:err.message})
   }
}

//DELETE CLIENTS
exports.deleteClients=async(req,res)=>{
    try{
   const{id}=req.params
   await con.query('DELETE FROM clients WHERE id=$1',[id])
   res.status(200).json({message:"Client Deleted Successfully"})
    }catch(err){
        res.status(500).json({error:err.message})
    }
}