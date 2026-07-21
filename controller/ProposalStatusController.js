// const con = require('../config/db')

// // GET ALL PROPOSAL STATUSES
// exports.listProposalStatus = async (req, res) => {
//     try {
//         const result = await con.query('SELECT * FROM proposal_status ORDER BY id ASC')
//         res.status(200).json(result.rows)
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }
const con = require('../config/db')

// GET ALL PROPOSAL STATUSES
exports.listProposalStatus = async (req, res) => {
    try {
        const result = await con.query('SELECT * FROM proposal_status ORDER BY id ASC')
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// GET SINGLE PROPOSAL STATUS
exports.getProposalStatusById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await con.query('SELECT * FROM proposal_status WHERE id=$1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Status not found" })
        }

        res.status(200).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// CREATE PROPOSAL STATUS
exports.createProposalStatus = async (req, res) => {
    try {
        const { statusName } = req.body

        if (!statusName || !statusName.trim()) {
            return res.status(400).json({ message: "statusName is required" })
        }

        const existing = await con.query('SELECT * FROM proposal_status WHERE status_name=$1', [statusName.trim()])
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Status Already Exist" })
        }

        const result = await con.query(
            'INSERT INTO proposal_status(status_name) VALUES($1) RETURNING *',
            [statusName.trim()]
        )

        res.status(200).json({ message: "New Status Created", newStatus: result.rows[0] })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// UPDATE PROPOSAL STATUS (the status_name itself, e.g. rename "Sent" -> "Submitted")
exports.updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { statusName } = req.body

        if (!statusName || !statusName.trim()) {
            return res.status(400).json({ message: "statusName is required" })
        }

        const result = await con.query(
            'UPDATE proposal_status SET status_name=$1 WHERE id=$2 RETURNING *',
            [statusName.trim(), id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Status not found" })
        }

        res.status(200).json({ message: "Status updated", updatedStatus: result.rows[0] })
    } catch (err) {
        console.log('UPDATE STATUS ERROR:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// DELETE PROPOSAL STATUS
exports.deleteProposalStatus = async (req, res) => {
    try {
        const { id } = req.params

        // block delete if any proposal is still using this status
        const inUse = await con.query('SELECT COUNT(*) FROM proposals WHERE status_id=$1', [id])
        if (parseInt(inUse.rows[0].count) > 0) {
            return res.status(400).json({ message: `Cannot delete. ${inUse.rows[0].count} proposal(s) are using this status.` })
        }

        const result = await con.query('DELETE FROM proposal_status WHERE id=$1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Status not found" })
        }

        res.status(200).json({ message: "Proposal Status Deleted Successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}