const express = require('express')
const jwtMiddleware=require('../middleware/jwtMiddleware')
const multerConfig=require('../middleware/multerMiddleware')
const UsersController = require('../controller/UsersController')
const AddClientsController=require('../controller/AddClientsController')
const AddProjectsController=require('../controller/AddProjectsContoller')
const ProposalaController=require('../controller/ProposalsController')
const AccessLinksController=require('../controller/AccessLinksController')
const router = express.Router()
// ADMIN REGISTER
router.post('/api/adminregister', UsersController.adminRegister)
//ADMIN LOGIN
router.post('/api/adminlogin', UsersController.adminLogin)
//ADD CLIENT
router.post('/api/addclient',jwtMiddleware,AddClientsController.addClients)
//GET CLIENT FOR ADD PROJECT
router.get('/api/getclient',jwtMiddleware,AddClientsController.getClients)
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
module.exports = router
