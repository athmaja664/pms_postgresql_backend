const AddClient = require('../models/AddClients')

// ADD CLIENT
exports.addClients = async (req, res) => {
    const { name, email } = req.body
    try {
        const existingClient = await AddClient.findOne({ email })
        if (existingClient) {
            return res.status(400).json({ message: "Client already exists" })
        }
        const newClient = new AddClient({
            name,
            email
        })
        await newClient.save()
        res.status(200).json({
            message: "Client added successfully",
            newClient
        })
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//GET CLIENT FOR ADD PROJECT
exports.getClients=async(req,res)=>{
    try{
        const clients=await AddClient.find()
        res.status(200).json(clients)

    }catch(err){
        res.status(500).json({error:err.message})
    }
}