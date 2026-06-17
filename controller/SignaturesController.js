const Signature = require('../models/Signatures')
const proposals = require('../models/Proposals')
const AuditLogs = require('../models/AuditLogs')
const cloudinary = require('cloudinary').v2
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        stream.end(buffer)
    })
}

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
            return res.status(200).json({ message: 'Proposal rejected successfully', newSignature })
        }

        if (signatureMethod === 'draw' && !signatureBase64) {
            return res.status(400).json({ error: 'Signature drawing is required' })
        }
        if (signatureMethod === 'upload' && !req.file) {
            return res.status(400).json({ error: 'File upload is required' })
        }

        const ip = req.socket.remoteAddress
        const proposal = await proposals.findById(proposalId).populate('clientId').populate('projectId')
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' })
        }

        let signatureImageUrl = null
        let sigImageBuffer = null  // keep buffer for PDF embedding

        if (signatureMethod === 'draw') {
            // convert base64 to buffer
            const base64Data = signatureBase64.replace(/^data:image\/png;base64,/, '')
            sigImageBuffer = Buffer.from(base64Data, 'base64')
            // upload to cloudinary
            const uploadResult = await uploadToCloudinary(sigImageBuffer, 'proposalhub/signatures', 'image')
            signatureImageUrl = uploadResult.secure_url
        }

        if (signatureMethod === 'upload') {
            sigImageBuffer = req.file.buffer  // keep buffer for PDF
            const uploadResult = await uploadToCloudinary(sigImageBuffer, 'proposalhub/signatures', 'image')
            signatureImageUrl = uploadResult.secure_url
        }

        // --- GENERATE PDF CERTIFICATE using buffer directly ---
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([600, 400])
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)

        page.drawText('Proposal Acceptance Certificate', {
            x: 80, y: 350, size: 20, font, color: rgb(0, 0, 0)
        })
        page.drawLine({
            start: { x: 50, y: 335 }, end: { x: 550, y: 335 },
            thickness: 1, color: rgb(0.8, 0.8, 0.8)
        })

        const details = [
            `Client Name   : ${proposal.clientId.name}`,
            `Client Email  : ${proposal.clientId.email}`,
            `Project       : ${proposal.projectId?.projectName || ''}`,
            `Decision      : Accepted`,
            `Signed On     : ${new Date().toISOString().slice(0, 10)}`,
            `IP Address    : ${ip}`,
        ]
        details.forEach((line, i) => {
            page.drawText(line, {
                x: 60, y: 300 - i * 30, size: 13, font: regular, color: rgb(0.2, 0.2, 0.2)
            })
        })

        // embed signature using buffer directly — no fetch needed!
        const sigImage = await pdfDoc.embedPng(sigImageBuffer)
        page.drawText('Signature :', { x: 60, y: 80, size: 12, font: regular, color: rgb(0.4, 0.4, 0.4) })
        page.drawImage(sigImage, { x: 60, y: 20, width: 150, height: 50 })

        const pdfBytes = await pdfDoc.save()

        // upload certificate to cloudinary
        const certUpload = await uploadToCloudinary(
            Buffer.from(pdfBytes),
            'proposalhub/certificates',
            'raw'
        )
        const certificateUrl = certUpload.secure_url

        const newSignature = await Signature.findOneAndUpdate(
            { proposalId },
            {
                proposalId,
                clientName: proposal.clientId.name,
                clientEmail: proposal.clientId.email,
                decision: 'Accepted',
                signatureMethod,
                signatureImageUrl,
                certificateUrl,
                ipAddress: ip,
                signedAt: Date.now()
            },
            { upsert: true, new: true }
        )

        await AuditLogs.create({ action: 'signature_submitted', proposalId, performedBy: proposal.clientId.name })
        await proposals.findByIdAndUpdate(proposalId, { status: 'Accepted' })
        res.status(200).json({ message: 'Signature submitted successfully', newSignature })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.getSignatureByProposal = async (req, res) => {
    try {
        const signature = await Signature.findOne({ proposalId: req.params.proposalId })
        if (!signature) return res.status(404).json({ error: 'No signature found' })
        res.status(200).json(signature)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}