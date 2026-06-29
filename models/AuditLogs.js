const con = require('../config/db')

const createAuditLogsTable = async () => {
    await con.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            action VARCHAR(255) NOT NULL,
            proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL,
            performed_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW()
        )
    `)
    console.log('Audit logs table ready')
}

module.exports = createAuditLogsTable