const express = require('express')
const db = require('./config/db')
const cors = require('cors')
const router=require('./router/routes')
const pmsServer = express()
pmsServer.use(cors())
pmsServer.use(express.json())
pmsServer.use(router)
pmsServer.use('/uploads', express.static('uploads'))
const PORT = 3000
pmsServer.listen(PORT, () => {
    console.log(`pms server start on port ${PORT}`);

})