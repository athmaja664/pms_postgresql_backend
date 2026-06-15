const AuditLog = require('../models/AuditLogs')

exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .populate({
                path: 'proposalId',
                populate: [
                    {
                        path: 'clientId',
                        select: 'name'
                    },
                    {
                        path: 'projectId',
                        select: 'projectName'
                    }
                ]
            })
        res.status(200).json(logs)
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

