const AuditLog = require('../models/AuditLogs')
 const Proposal = require('../models/Proposals')
        
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'proposalId',
                populate: [
                    { path: 'clientId', select: 'name' },
                    { path: 'projectId', select: 'projectName' }
                ]
            })
        const cleanLogs = logs.filter(log => 
            !log.proposalId || typeof log.proposalId === 'object'
        )
        res.status(200).json(cleanLogs)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
// DELETE EMPTY LOGS
 exports.clearEmptyLogs = async (req, res) => {
    try {
       
        const validProposals = await Proposal.find({}, '_id')
        const validIds = validProposals.map(p => p._id.toString())
        const allLogs = await AuditLog.collection.find({}).toArray()
        const orphanIds = allLogs
            .filter(log => log.proposalId && !validIds.includes(log.proposalId.toString()))
            .map(log => log._id)

        const result = await AuditLog.collection.deleteMany({ _id: { $in: orphanIds } })
        
        console.log('Deleted count:', result.deletedCount)
        res.status(200).json({ message: 'Empty logs cleared', deleted: result.deletedCount })
    } catch (err) {
        console.log('Clear logs error:', err.message)
        res.status(500).json({ error: err.message })
    }
}