const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = file.mimetype === 'application/pdf' 
            ? './uploads' 
            : './uploads/signatures'
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath) 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const prefix = file.mimetype === 'application/pdf' ? 'pdf' : 'sig'
        cb(null, `${prefix}-${Date.now()}${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const multerConfig = multer({ storage, fileFilter })
module.exports = multerConfig