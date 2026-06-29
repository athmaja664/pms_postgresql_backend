const con = require('../config/db')
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

        // get proposal with client and project info
        const proposalResult = await con.query(`
            SELECT proposals.*,
                   clients.name AS client_name, clients.email AS client_email,
                   projects.project_name
            FROM proposals
            LEFT JOIN clients ON proposals.client_id = clients.id
            LEFT JOIN projects ON proposals.project_id = projects.id
            WHERE proposals.id=$1
        `, [proposalId])
        const proposal = proposalResult.rows[0]
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' })
        }

        const ip = req.socket.remoteAddress

     if (decision === 'Rejected') {
    await con.query(`
        INSERT INTO signatures(proposal_id, client_name, client_email, decision, ip_address, signed_at)
        VALUES($1,$2,$3,$4,$5,NOW())
        ON CONFLICT (proposal_id) DO UPDATE SET
        decision=$4, ip_address=$5, signed_at=NOW()
    `, [proposalId, proposal.client_name, proposal.client_email, 'Rejected', ip])

    await con.query('UPDATE proposals SET status=$1 WHERE id=$2', ['Rejected', proposalId])
    
    // fetch the saved signature to return it
    const sigResult = await con.query('SELECT * FROM signatures WHERE proposal_id=$1', [proposalId])
    return res.status(200).json({ message: 'Proposal rejected successfully', newSignature: sigResult.rows[0] })
}

        if (signatureMethod === 'draw' && !signatureBase64) {
            return res.status(400).json({ error: 'Signature drawing is required' })
        }
        if (signatureMethod === 'upload' && !req.file) {
            return res.status(400).json({ error: 'File upload is required' })
        }

        let signatureImageUrl = null
        let sigImageBuffer = null
        let isPng = true

        if (signatureMethod === 'draw') {
            const base64Data = signatureBase64.replace(/^data:image\/png;base64,/, '')
            sigImageBuffer = Buffer.from(base64Data, 'base64')
            const uploadResult = await uploadToCloudinary(sigImageBuffer, 'proposalhub/signatures', 'image')
            signatureImageUrl = uploadResult.secure_url
            isPng = true
        }

        if (signatureMethod === 'upload') {
            sigImageBuffer = req.file.buffer
            const uploadResult = await uploadToCloudinary(sigImageBuffer, 'proposalhub/signatures', 'image')
            signatureImageUrl = uploadResult.secure_url
            isPng = req.file.mimetype === 'image/png'
        }

        // generate PDF certificate
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
            `Client Name   : ${proposal.client_name}`,
            `Client Email  : ${proposal.client_email}`,
            `Project       : ${proposal.project_name || ''}`,
            `Decision      : Accepted`,
            `Signed On     : ${new Date().toISOString().slice(0, 10)}`,
            `IP Address    : ${ip}`,
        ]
        details.forEach((line, i) => {
            page.drawText(line, {
                x: 60, y: 300 - i * 30, size: 13, font: regular, color: rgb(0.2, 0.2, 0.2)
            })
        })

        const sigImage = isPng
            ? await pdfDoc.embedPng(sigImageBuffer)
            : await pdfDoc.embedJpg(sigImageBuffer)
        page.drawText('Signature :', { x: 60, y: 80, size: 12, font: regular, color: rgb(0.4, 0.4, 0.4) })
        page.drawImage(sigImage, { x: 60, y: 20, width: 150, height: 50 })

        const pdfBytes = await pdfDoc.save()
        const certUpload = await uploadToCloudinary(
            Buffer.from(pdfBytes), 'proposalhub/certificates', 'raw'
        )
        const certificateUrl = certUpload.secure_url

        await con.query(`
            INSERT INTO signatures(proposal_id, client_name, client_email, decision, signature_method, signature_image_url, certificate_url, ip_address, signed_at)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())
            ON CONFLICT (proposal_id) DO UPDATE SET
            decision=$4, signature_method=$5, signature_image_url=$6, certificate_url=$7, ip_address=$8, signed_at=NOW()
        `, [proposalId, proposal.client_name, proposal.client_email, 'Accepted', signatureMethod, signatureImageUrl, certificateUrl, ip])

        await con.query(
            'INSERT INTO audit_logs(action,proposal_id,performed_by) VALUES($1,$2,$3)',
            ['signature_submitted', proposalId, proposal.client_name]
        )
        await con.query('UPDATE proposals SET status=$1 WHERE id=$2', ['Accepted', proposalId])

// fetch saved signature to return
const sigResult = await con.query('SELECT * FROM signatures WHERE proposal_id=$1', [proposalId])
res.status(200).json({ message: 'Signature submitted successfully', newSignature: sigResult.rows[0] })
    } catch (err) {
        console.log('Submit signature error:', err)
        res.status(500).json({ error: err.message })
    }
}

exports.getSignatureByProposal = async (req, res) => {
    try {
        const result = await con.query(
            'SELECT * FROM signatures WHERE proposal_id=$1',
            [req.params.proposalId]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No signature found' })
        }
        res.status(200).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}