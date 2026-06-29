const con = require('../config/db')

const createProposalTable = async () => {
    await con.query(`
        CREATE TABLE IF NOT EXISTS proposals (
            id SERIAL PRIMARY KEY,
            client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            cost NUMERIC,
            status VARCHAR(255) DEFAULT 'Draft' CHECK(status IN('Draft','Sent','Accepted','Rejected','Archived')),
            document_url TEXT,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `)
    console.log('Proposal table ready')
}

module.exports = createProposalTable

// const mongoose = require('mongoose')
// const proposalSchema = new mongoose.Schema({
//     clientId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref:'AddClient',
//         required: true
//     },
//     projectId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref:'AddProject',
//         required: true
//     },
//     cost: {
//         type: Number,
//         required: false
//     },
//     status: {
//         type: String,
//         enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Archived'], //not aloww cmplt done anything elsein the box
//         default: 'Draft'
//     },
//     documentUrl: {
//         type: String,
//         required: false
//     },
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     }

// }, { timestamps: true })
// module.exports = mongoose.model('Proposal', proposalSchema)