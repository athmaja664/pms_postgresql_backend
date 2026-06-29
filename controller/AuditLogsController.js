const con = require('../config/db')

// GET AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
    try {
        const result = await con.query(`
            SELECT audit_logs.*,
                   proposals.description,
                   clients.name AS client_name,
                   projects.project_name
            FROM audit_logs
            LEFT JOIN proposals ON audit_logs.proposal_id = proposals.id
            LEFT JOIN clients ON proposals.client_id = clients.id
            LEFT JOIN projects ON proposals.project_id = projects.id
            ORDER BY audit_logs.created_at DESC
        `)
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// DELETE EMPTY LOGS
exports.clearEmptyLogs = async (req, res) => {
    try {
        const result = await con.query(
            'DELETE FROM audit_logs WHERE proposal_id IS NULL'
        )
        res.status(200).json({ message: 'Empty logs cleared', deleted: result.rowCount })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}