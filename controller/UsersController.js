const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// ADMIN REGISTER
exports.adminRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Admin already exist" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()
        res.status(200).json({ message: "Admin registered successfullyy" })
    }
    catch (err) {
         res.status(500).json({ error: err.message })
    }
}



// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.status(200).json({ message: "Login successful", token,user })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
} 


//UPDATE ADMIN PANEL
exports.updateAdmin=async(req,res)=>{
    try{
     const{name,email,currentPassword,newPassword}=req.body
     const admin=await User.findById(req.payload)
     if(!admin){
        return res.status(400).json({message:'Admin not found'})
     }
        const isMatch=await bcrypt.compare(currentPassword,admin.password)
        if(!isMatch){
            return res.status(400).json({message:"current password is incorrect"})
        }
        admin.name=name||admin.name
        admin.email=email||admin.email
        if(newPassword){
            admin.password=await bcrypt.hash(newPassword,10)
        }
        await admin.save()
        const updateAdmin={_id:admin._id,name:admin.name,email:admin.email}
        return res.status(200).json({message:"Profile updated successfully",user:updateAdmin})
    }catch(err){
        return res.status(500).json({error:err.message})
    }
}
