const multer=require("multer")
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
cb(null,'./uploads')
    },
    filename:(req,file,cb)=>{
const date=new Date().toDateString()
cb(null,`pdf-${file.originalname}-${date}`)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype=='application/pdf'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

const multerConfig=multer({storage,fileFilter})

module.exports=multerConfig

