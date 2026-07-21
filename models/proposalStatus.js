const con = require('../config/db')

const createProposalStatusTable = async () => {
    await con.query(`
        CREATE TABLE IF NOT EXISTS proposal_status (
            id SERIAL PRIMARY KEY,
            status_name VARCHAR(50) UNIQUE NOT NULL
        )
    `)
    console.log('Proposal Status table ready')

    // seed the fixed statuses only if table is empty
    const existing = await con.query('SELECT COUNT(*) FROM proposal_status')
    if (parseInt(existing.rows[0].count) === 0) {
        await con.query(`
            INSERT INTO proposal_status (status_name) VALUES
            ('Draft'), ('Sent'), ('Accepted'), ('Rejected'), ('Archived')
        `)
        console.log('Proposal Status seeded')
    }
}

module.exports = createProposalStatusTable