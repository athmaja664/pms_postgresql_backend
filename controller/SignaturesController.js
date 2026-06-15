const Signature = require('../models/Signatures')
const proposals = require('../models/Proposals')
const fs = require('fs')
const AuditLogs = require('../models/AuditLogs')

exports.submitSignature = async (req, res) => {
    try {
        const { proposalId, decision, signatureMethod, signatureBase64 } = req.body

        if (decision === 'Rejected') {
            const proposal = await proposals.findById(proposalId).populate('clientId')
            const newSignature = await Signature.findOneAndUpdate(
                { proposalId },
                {
                    proposalId,
                    clientName: proposal.clientId.name,
                    clientEmail: proposal.clientId.email,
                    decision: 'Rejected',
                    ipAddress: req.socket.remoteAddress,
                    signedAt: Date.now()
                },
    
                { upsert: true, new: true }
            )
            await proposals.findByIdAndUpdate(proposalId, { status: 'Rejected' })
            return res.status(200).json({ message: 'Proposal rejected successfully',newSignature })
        }

        if (signatureMethod === 'draw' && !signatureBase64) {
            return res.status(400).json({ error: 'Signature drawing is required' })
        }
        if (signatureMethod === 'upload' && !req.file) {
            return res.status(400).json({ error: 'File upload is required' })
        }

        const ip = req.socket.remoteAddress
        const proposal = await proposals.findById(proposalId).populate('clientId')
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' })
        }

        let signatureImageUrl = null

        if (signatureMethod === 'draw') {
            const base64Data = signatureBase64.replace(/^data:image\/png;base64,/, '')
            const fileName = `sig_${Date.now()}.png`
            fs.mkdirSync('uploads/signatures', { recursive: true })
            fs.writeFileSync(`uploads/signatures/${fileName}`, base64Data, 'base64')
            signatureImageUrl = `uploads/signatures/${fileName}`
        }

        if (signatureMethod === 'upload') {
            signatureImageUrl = req.file.path
        }

        const newSignature = await Signature.findOneAndUpdate(
            { proposalId },
            {
                proposalId,
                clientName: proposal.clientId.name,
                clientEmail: proposal.clientId.email,
                decision: 'Accepted',
                signatureMethod,
                signatureImageUrl,
                ipAddress: ip,
                signedAt: Date.now()
            },
            { upsert: true, new: true }
        )
    await AuditLogs.create({action:'signature_submitted',proposalId,performedBy:proposal.clientId.name})
        await proposals.findByIdAndUpdate(proposalId, { status: 'Accepted' })
        res.status(200).json({ message: 'Signature submitted successfully', newSignature })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


//GET SIGNATURE BY PROPOSAL
exports.getSignatureByProposal = async (req, res) => {
    try {
        const signature = await Signature.findOne({ proposalId: req.params.proposalId })
        if (!signature) return res.status(404).json({ error: 'No signature found' })
        res.status(200).json(signature)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}