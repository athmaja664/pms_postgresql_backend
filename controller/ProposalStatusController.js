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