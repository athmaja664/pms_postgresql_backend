const con=require('../config/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto')


//GENERATE LINK (admin)
exports.generateLink = async (req, res) => {
    try {
        const { proposalId, password, expiryDate, forceRegenerate } = req.body
        if (!proposalId || !password || !expiryDate) {
            return res.status(400).json({ message: "fill the field" })
        }
        const existingLink = await con.query('SELECT * FROM access_links WHERE proposal_id=$1 AND is_revoked=false',[proposalId])
        if (existingLink.rows.length>0 && !forceRegenerate) {
            return res.status(400).json({ message: "proposalId already exist", hasExistingLink: true })
        }
        if (existingLink.rows.length > 0 && forceRegenerate) {
    await con.query('DELETE FROM access_links WHERE proposal_id=$1', [proposalId])
    await con.query('DELETE FROM signatures WHERE proposal_id=$1', [proposalId])  // ← add this
    await con.query('UPDATE proposals SET status=$1 WHERE id=$2', ['Sent', proposalId])  // ← reset status
}
        console.log(forceRegenerate)
        const token = crypto.randomBytes(32).toString('hex')
        const passwordHash = await bcrypt.hash(password, 10)
        await con.query('INSERT INTO access_links(proposal_id,token,password_hash,expiry_date) VALUES($1,$2,$3,$4) RETURNING *',[proposalId,token,passwordHash,expiryDate])
        
        await con.query('INSERT INTO audit_logs(action,proposal_id,performed_by) VALUES($1,$2,$3)',['link_generated',proposalId,'Admin'])
        const link = `${process.env.FRONTEND_URL}/view/${token}`
        res.status(200).json({ message: "link generated successfully", link, token })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//REVOKE LINK (admin)
exports.revokeLink = async (req, res) => {
    try {
        const { token } = req.body //destr
        const result = await con.query('SELECT * FROM access_links WHERE token=$1',[token])
        const accessLink=result.rows[0]
        if (!accessLink) {
            return res.status(404).json({ message: "Link not found" })
        }
        con.query('UPDATE access_links SET is_revoked=true,updated_at=NOW() WHERE token=$1',[token])
        await con.query('INSERT INTO audit_logs (action,proposal_id,performed_by) VALUES($1,$2,$3)',['link_revoked',accessLink.proposal_id,'Admin'])
        res.status(200).json({ message: "Link Revoked Successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//UNREVOKE THE LINK
exports.unrevokeLink = async (req, res) => {
    try {
        const { token } = req.body
        const result = await con.query('SELECT * FROM access_links WHERE token=$1',[token])
        const accessLink=result.rows[0]
        if (!accessLink) {
            return res.status(404).json({ message: "link not found" })
        }
        con.query('UPDATE access_links SET is_revoked=false,updated_at=NOW() WHERE token=$1',[token])
        await con.query('INSERT INTO audit_logs (action,proposal_id,performed_by) VALUES($1,$2,$3)',['link_revoked',accessLink.proposal_id,'Admin'])
        res.status(200).json({ message: "Link activated succeefully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


//GET PROPOSAL BY TOKEN (client)
exports.getProposalByToken = async (req, res) => {
    try {
        const { token } = req.params
        const result = await con.query('SELECT * FROM access_links WHERE token=$1',[token])
        const accessLink=result.rows[0]
        if (!accessLink) {
            return res.status(400).json({ message: "Link not found" })
        }
        if (accessLink.is_revoked) {
            return res.status(400).json({ message: "Link has been Revoked" })
        }
        if (accessLink.expiry_date < new Date()) {
            return res.status(400).json({ message: "Link has expired" })
        }
        res.status(200).json({ message: "Link is valid", proposalId: accessLink.proposal_id })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//VERIFY BY PASSWORD (client)
exports.verifyByPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        const result = await con.query('SELECT * FROM access_links WHERE token=$1',[token])
        const accessLink=result.rows[0]
        if (!accessLink) {
            return res.status(400).json({ message: "Link not found" })
        }
        if (accessLink.is_revoked) {
            return res.status(400).json({ message: "Link has been revoked" })
        }
        if (accessLink.expiry_date < new Date()) {
            return res.status(400).json({ message: "Link has expired" })
        }
        const isMatch = await bcrypt.compare(password, accessLink.password_hash)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" })
        }
        const proposalResult = await con.query(`
            SELECT proposals.*,
                   clients.name AS client_name, clients.email AS client_email,
                   projects.project_name
            FROM proposals
            LEFT JOIN clients ON proposals.client_id = clients.id
            LEFT JOIN projects ON proposals.project_id = projects.id
            WHERE proposals.id=$1
        `, [accessLink.proposal_id])
        const proposal = proposalResult.rows[0]

        if (proposal.status === "Accepted" || proposal.status === "Rejected") {
    const sigResult = await con.query('SELECT * FROM signatures WHERE proposal_id=$1', [accessLink.proposal_id])
    return res.status(200).json({
        message: "Already responded",
        alreadyResponded: true,
        decision: proposal.status,
        proposal,
        signature: sigResult.rows[0]
    })
}
        res.status(200).json({ message: "Access Granted", proposal })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

//GET LINK BY PROPOSAL
exports.getLinkByProposal = async (req, res) => {
    try {
        const{proposalId}=req.params
        const result = await con.query('SELECT * FROM access_links  WHERE proposal_id=$1',[proposalId])//match
        const link=result.rows[0]
        if (!link) {
            return res.status(404).json({ message: "link not found" })
        } else {
            await con.query('INSERT INTO audit_logs (action,proposal_id,performed_by) VALUES ($1,$2,$3)',
                ['client_accessed',proposalId,'client']
            )
            return res.status(200).json(link)
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
// exports.getLinkByProposal = async (req, res) => {
//     try {
//         const link = await AccessLink.findOne({ proposalId: req.params.proposalId })//match
//         if (!link) {
//             return res.status(404).json({ message: "link not found" })
//         } else {
//             await AuditLogs.create({action:'client_accessed',proposalId: link.proposalId,performedBy:'client'})
//             return res.status(200).json(link)
//         }
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }