const AuditLogs = require('../models/AuditLogs')
const Proposal = require('../models/Proposals')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// helper to upload buffer to cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: 'proposalhub/proposals', 
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        stream.end(buffer)
    })
}
// CREATE PROPOSALS
exports.createProposals = async (req, res) => {
    try {
        const { clientId, projectId, cost, status, description } = req.body

        let documentUrl = ""
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer)
            documentUrl = result.secure_url
        }

        const existingUser = await Proposal.findOne({ clientId, projectId })
        if (existingUser) {
            return res.status(400).json({ message: "Proposal Already Exist" })
        }

        const newProposal = new Proposal({ clientId, projectId, cost, status, documentUrl, description })
        await newProposal.save()
        await AuditLogs.create({ action: 'proposal_created', proposalId: newProposal._id, performedBy: 'Admin' })
        res.status(200).json({ message: "New Proposal Created", newProposal })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// LIST ALL PROPOSALS
exports.listProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find().populate('clientId').populate('projectId')
        res.status(200).json(proposals)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// UPDATE PROPOSALS
exports.updateProposals = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = { ...req.body }

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer)
            updateData.documentUrl = result.secure_url
        }

        const updatedProposal = await Proposal.findByIdAndUpdate(id, updateData, { new: true })
        res.status(200).json({ message: "proposal updated", updatedProposal })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// DELETE PROPOSALS
exports.deleteProposals = async (req, res) => {
    try {
        const { id } = req.params
        await Proposal.findByIdAndDelete(id)
        res.status(200).json({ message: "Proposal Deleted Successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// UPDATE STATUS TO SENT
exports.updatePrposalStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        const updated = await Proposal.findByIdAndUpdate(id, { status }, { new: true })
        res.status(200).json({ message: "status updated", updated })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}