const express = require('express')
const db = require('./config/db')
const cors = require('cors')
const router = require('./router/routes')
const createUsersTable = require('./models/Users')
const createClientTable = require('./models/AddClients') 
const createProjectTable=require('./models/AddProjects')
const createProposalTables=require('./models/Proposals')
const createAuditLogsTable = require('./models/AuditLogs')
const createAccessLinkTable=require('./models/AccessLinks')
const createSignaturesTable=require('./models/Signatures')
const createProposalStatusTable=require('./models/proposalStatus')
async function createTables() {
    await createProposalStatusTable();
    await createUsersTable();
    await createClientTable();
    await createProjectTable();
    await createProposalTables();
    await createAuditLogsTable();
    await createAccessLinkTable();
    await createSignaturesTable();
}

createTables().catch(console.error);
// createProposalStatusTable()
// createUsersTable()
// createClientTable()
// createProjectTable()
// createProposalTables()
// createAuditLogsTable()
// createAccessLinkTable()  
// createSignaturesTable()
const pmsServer = express()
pmsServer.use(cors())
pmsServer.use(express.json())
pmsServer.use(router)
pmsServer.use('/uploads', express.static('uploads'))
const PORT = 3000
pmsServer.listen(PORT, () => {
    console.log(`pms server start on port ${PORT}`);
})