const express = require('express')
const jwtMiddleware=require('../middleware/jwtMiddleware')
const multerConfig=require('../middleware/multerMiddleware')
const UsersController = require('../controller/UsersController')
const AddClientsController=require('../controller/AddClientsController')
const AddProjectsController=require('../controller/AddProjectsContoller')
const ProposalaController=require('../controller/ProposalsController')
const AccessLinksController=require('../controller/AccessLinksController')
const Signaturestroller=require('../controller/SignaturesController')
const AuditLogsController=require('../controller/AuditLogsController')
const proposalStatusController=require('../controller/ProposalStatusController')
const router = express.Router()
// ADMIN REGISTER
router.post('/api/adminregister', UsersController.adminRegister)
//ADMIN LOGIN
router.post('/api/adminlogin', UsersController.adminLogin)
//FORGOT PASSWORD
router.post('/api/forgot-password', UsersController.forgotPassword)
//RESET PASSWORD
router.post('/api/reset-password/:token', UsersController.resetPassword)
//ADD CLIENT
router.post('/api/addclient',jwtMiddleware,AddClientsController.addClients)
//GET CLIENT FOR ADD PROJECT
router.get('/api/getclient',jwtMiddleware,AddClientsController.getClients)
//UPDATE CLIENT
router.put('/api/updateClient/:id',jwtMiddleware,AddClientsController.updateClient)
//DELETE CLIENTS
router.delete('/api/deleteclient/:id',jwtMiddleware,AddClientsController.deleteClients)
//ADD PROJECT
router.post('/api/addproject',jwtMiddleware,AddProjectsController.addProjects)
//GET PROJECT
router.get('/api/getproject',jwtMiddleware,AddProjectsController.getProjects)
//CREATE PROPOSAL
router.post('/api/createproposal',jwtMiddleware,multerConfig.single('document'),ProposalaController.createProposals)
//GET PROPOSAL
router.get('/api/getproposal',jwtMiddleware,ProposalaController.listProposals)
//UPDATE PROPOSALS
router.put('/api/updateproposal/:id',jwtMiddleware,multerConfig.single('document'),ProposalaController.updateProposals)
//DELETE PROPOSALS
router.delete('/api/deleteproposal/:id',jwtMiddleware,ProposalaController.deleteProposals)
//GET PROPOSAL STATUS
router.get('/api/proposalstatus',jwtMiddleware,proposalStatusController.listProposalStatus)
//GENEATE LINK(ADMIN)
router.post('/api/links/generate',jwtMiddleware,AccessLinksController.generateLink)
//REVOKE LINK(ADMIN)
router.post('/api/links/revoke',jwtMiddleware,AccessLinksController.revokeLink)
//UNREVOKED LINK
router.post('/api/links/unrevoke',jwtMiddleware,AccessLinksController.unrevokeLink)
//GET PROPOSAL BY TOKEN (CLIENT)
router.get('/api/public/proposal/:token',AccessLinksController.getProposalByToken)
//VERIFY BY PASSWORD
router.post('/api/public/verify-password',AccessLinksController.verifyByPassword)
//GET LINK BY PROPOSAL
router.get('/api/links/proposal/:proposalId',jwtMiddleware,AccessLinksController.getLinkByProposal)
//SUBMITSIGNATURE
router.post('/api/submitsignature',multerConfig.single('signatureFile'),Signaturestroller.submitSignature)
//GET AUDITLOG
router.get('/api/auditlogs',jwtMiddleware,AuditLogsController.getAuditLogs)
//GET SIGNATURE BY PROPOSAL
router.get('/api/signature/:proposalId', jwtMiddleware, Signaturestroller.getSignatureByProposal)
//UPDATE STATUS TO SENT
router.put('/api/updatestatus/:id',jwtMiddleware,ProposalaController.updatePrposalStatus)
// DELETE EMPTY LOGS
router.delete('/api/auditlogs/clear-empty', jwtMiddleware, AuditLogsController.clearEmptyLogs)
//UPDATE ADMIN PROFILE
router.put('/api/updateadmin',jwtMiddleware,UsersController.updateAdmin)
module.exports = router
