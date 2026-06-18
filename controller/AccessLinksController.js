const AccessLink = require('../models/AccessLinks')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Proposals = require('../models/Proposals')
const AuditLogs = require('../models/AuditLogs')


//GENERATE LINK (admin)
exports.generateLink = async (req, res) => {
    try {
        const { proposalId, password, expiryDate, forceRegenerate } = req.body
        if (!proposalId || !password || !expiryDate) {
            return res.status(400).json({ message: "fill the field" })
        }
        const existingLink = await AccessLink.findOne({ proposalId, isRevoked: false })
        if (existingLink && !forceRegenerate) {
            return res.status(400).json({ message: "proposalId already exist", hasExistingLink: true })
        }
        if (existingLink && forceRegenerate) {
            await AccessLink.findOneAndDelete({ proposalId })
        }
        console.log(forceRegenerate)
        const token = crypto.randomBytes(32).toString('hex')
        const passwordHash = await bcrypt.hash(password, 10)
        const newLink = new AccessLink({ proposalId, token, passwordHash, expiryDate })
        await newLink.save()
        await AuditLogs.create({ action: 'link_generated', proposalId, performedBy: 'Admin' })
        const link = `${process.env.FRONTEND_URL}/view/${token}`
        res.status(200).json({ message: "link generated successfully", link, token })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//REVOKE LINK (admin)
exports.revokeLink = async (req, res) => {
    try {
        const { token } = req.body //destr
        const accessLink = await AccessLink.findOne({ token })
        if (!accessLink) {
            return res.status(404).json({ message: "Link not found" })
        }
        accessLink.isRevoked = true
        await accessLink.save()
        await AuditLogs.create({ action: 'link_revoked', proposalId: accessLink.proposalId, performedBy: 'Admin' })
        res.status(200).json({ message: "Link Revoked Successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//UNREVOKE THE LINK
exports.unrevokeLink = async (req, res) => {
    try {
        const { token } = req.body
        const accessLink = await AccessLink.findOne({ token })
        if (!accessLink) {
            return res.status(404).json({ message: "link not found" })
        }
        accessLink.isRevoked = false
        await accessLink.save()
        await AuditLogs.create({action:'link_unrevoked',proposalId:accessLink.proposalId,performedBy:'Admin'})
        res.status(200).json({ message: "Link activated succeefully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//GET PROPOSAL BY TOKEN (client)
exports.getProposalByToken = async (req, res) => {
    try {
        const { token } = req.params
        const accessLink = await AccessLink.findOne({ token })
        if (!accessLink) {
            return res.status(400).json({ message: "Link not found" })
        }
        if (accessLink.isRevoked) {
            return res.status(400).json({ message: "Link has been Revoked" })
        }
        if (accessLink.expiryDate < new Date()) {
            return res.status(400).json({ message: "Link has expired" })
        }
        res.status(200).json({ message: "Link is valid", proposalId: accessLink.proposalId })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//VERIFY BY PASSWORD (client)
exports.verifyByPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        const accessLink = await AccessLink.findOne({ token })
        if (!accessLink) {
            return res.status(400).json({ message: "Link not found" })
        }
        if (accessLink.isRevoked) {
            return res.status(400).json({ message: "Link has been revoked" })
        }
        if (accessLink.expiryDate < new Date()) {
            return res.status(400).json({ message: "Link has expired" })
        }
        const isMatch = await bcrypt.compare(password, accessLink.passwordHash)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" })
        }
        const proposal = await Proposals.findById(accessLink.proposalId).populate('clientId').populate('projectId')
        if(proposal.status==="Accepted" ||proposal.status==="Rejected"){
            return res.status(200).json({message: "Already responded",alreadyResponded: true,decision: proposal.status,proposal})
        }
        res.status(200).json({ message: "Access Granted", proposal })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

//GET LINK BY PROPOSAL
exports.getLinkByProposal = async (req, res) => {
    try {
        const link = await AccessLink.findOne({ proposalId: req.params.proposalId })//match
        if (!link) {
            return res.status(404).json({ message: "link not found" })
        } else {
            await AuditLogs.create({action:'client_accessed',proposalId: link.proposalId,performedBy:'client'})
            return res.status(200).json(link)
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}