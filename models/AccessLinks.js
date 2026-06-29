const con=require('../config/db')
const createAccessLinkTable=async()=>{
    await con.query(`CREATE TABLE IF NOT EXISTS access_links(
        id SERIAL PRIMARY KEY,
        proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        expiry_date TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `)
        console.log('AccessLink table ready');
}
module.exports=createAccessLinkTable
// const mongoose = require('mongoose')
// const accesslinkSchema = new mongoose.Schema({
//     proposalId: {
//         type: mongoose.Schema.Types.ObjectId,//auto-generated, unique
//          ref: 'Proposal',
//         required: true,
//     },
//     token: {
//         type: String,
//         required: true,
//         unique:true
//     },
//     passwordHash: {
//         type: String,
//         required: true

//     },
//     expiryDate: {
//         type: Date,
//         required: true
//     },
//     isRevoked: {
//         type: Boolean,
//         default:false
//     }
// }, { timestamps: true })
// module.exports = mongoose.model('AccessLink', accesslinkSchema)