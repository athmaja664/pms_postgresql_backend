const express = require('express')
const db = require('./config/db')
const cors = require('cors')
const router = require('./router/routes')

console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME)
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY)
console.log('API_SECRET length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 'MISSING')

const pmsServer = express()
pmsServer.use(cors())
pmsServer.use(express.json())
pmsServer.use(router)
pmsServer.use('/uploads', express.static('uploads'))
const PORT = 3000
pmsServer.listen(PORT, () => {
    console.log(`pms server start on port ${PORT}`);
})