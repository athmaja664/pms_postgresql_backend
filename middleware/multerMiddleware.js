const multer = require("multer")
const path = require("path")

// memory storage - files go to buffer, not disk
const storage = multer.memoryStorage()

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