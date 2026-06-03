const multer = require("multer")
const path = require("path") 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) //is used to keep the original file type/extension when renaming the file.
        cb(null, `pdf-${Date.now()}${ext}`)     
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'application/pdf') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const multerConfig = multer({ storage, fileFilter })
module.exports = multerConfig