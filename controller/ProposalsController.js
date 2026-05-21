const Proposal = require('../models/Proposals')

//CREATE PROPOSALS
exports.createProposals=async(req,res)=>{
    try{
    const{clientId,projectId,cost,status,description}=req.body
    const documentUrl=req.file?req.file.path:""
    const existingUser=await Proposal.findOne({clientId,projectId})
    if(existingUser){
        return res.status(400).json({message:"Proposal Already Exist"})
    }
    const newProposal=new Proposal({clientId,projectId,cost,status,documentUrl,description})
    await newProposal.save()
    res.status(200).json({message:"New Proposal Created",newProposal})
    }
    catch(err){
    res.status(500).json({error: err.message})
        
    }
}


//LIST ALL PROPOSAL
exports.listProposals=async(req,res)=>{
    try{
    const proposals=await Proposal.find().populate('clientId').populate('projectId')
    res.status(200).json(proposals)
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }
}


//UPDATE THE PROPOSALS
exports.updateProposals=async(req,res)=>{
    try{
      const{id}=req.params
      const documentUrl=req.file?req.file.path:undefined
      const updateData={...req.body}
      if(documentUrl) updateData.documentUrl=documentUrl
      const updatedProposal=await Proposal.findByIdAndUpdate(id,updateData,{new:true})
      res.status(200).json({message:"proposal updated",updatedProposal})
    }catch(err){
        res.status(500).json({error:err.message})
    }
}

//DELETE THE PROPOSALS
exports.deleteProposals=async(req,res)=>{
    try{
     const{id}=req.params
     const deleteProposal=await Proposal.findByIdAndDelete(id)
     res.status(200).json({message:"Proposal Deleted Successfully"})
    }catch(err){
        res.status(500).json({error:err.message})
    }
}