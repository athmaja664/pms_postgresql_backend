const con=require('../config/db')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// helper
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

        const existingUser = await con.query('SELECT * FROM proposals WHERE client_id=$1 AND project_id=$2',[clientId,projectId])
        if (existingUser.rows.length>0) {
            return res.status(400).json({ message: "Proposal Already Exist" })
        }

        const result = await con.query('INSERT INTO proposals(client_id,project_id,cost,status,document_url,description) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[clientId,projectId,cost,status,documentUrl,description])

        const newProposal=result.rows[0]

      await con.query(
    'INSERT INTO audit_logs (action, proposal_id, performed_by) VALUES ($1,$2,$3)',
    ['proposal_created', newProposal.id, 'Admin']
)
res.status(200).json({ message: "New Proposal Created", newProposal }) 

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


// LIST ALL PROPOSALS
exports.listProposals = async (req, res) => {
    try {
        const result = await con.query(`
            SELECT proposals.*, 
                   clients.name AS client_name, clients.email AS client_email,
                   projects.project_name
            FROM proposals
            LEFT JOIN clients ON proposals.client_id = clients.id
            LEFT JOIN projects ON proposals.project_id = projects.id
            ORDER BY proposals.created_at DESC
        `)
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// UPDATE PROPOSALS
exports.updateProposals = async (req, res) => {
    try {
        const { id } = req.params
        const { cost, status, description } = req.body
        let documentUrl = req.body.documentUrl || ""
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer)
            documentUrl = uploaded.secure_url
        }
        const existing = await con.query('SELECT * FROM proposals WHERE id=$1', [id])
        const current = existing.rows[0]
        const result = await con.query(
            `UPDATE proposals SET client_id=$1, project_id=$2, cost=$3, status=$4,
             document_url=$5, description=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
            [current.client_id, current.project_id, cost, status, documentUrl || current.document_url, description, id]
        )
        res.status(200).json({ message: "Proposal updated", updatedProposal: result.rows[0] })
    } catch (err) {
        console.log('UPDATE ERROR:', err.message) 
        res.status(500).json({ error: err.message })
    }
}

// DELETE PROPOSALS
exports.deleteProposals = async (req, res) => {
    try {
        const { id } = req.params
        await con.query('DELETE FROM proposals WHERE id=$1',[id])
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
        const result = await con.query('UPDATE proposals SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[status,id])
        res.status(200).json({ message: "status updated", updated:result.rows[0] })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
