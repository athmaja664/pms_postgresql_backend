const con = require('../config/db')

const createSignaturesTable = async () => {
    await con.query(`
        CREATE TABLE IF NOT EXISTS signatures (
            id SERIAL PRIMARY KEY,
            proposal_id INTEGER UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
            client_name VARCHAR(255),
            client_email VARCHAR(255),
            decision VARCHAR(50) CHECK(decision IN('Accepted','Rejected')),
            signature_method VARCHAR(50) CHECK(signature_method IN('draw','upload')),
            signature_image_url TEXT,
            certificate_url TEXT,
            ip_address VARCHAR(255),
            signed_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `)
    console.log('Signatures table ready')
}

module.exports = createSignaturesTable