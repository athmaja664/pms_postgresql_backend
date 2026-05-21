const jwt=require('jsonwebtoken')
const jwtMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization
    if(!authHeader){
      return res.status(401).json({message:'No token provided'})
    }
    const token=authHeader.slice(7)
    try{
    const jwtVerification=jwt.verify(token,process.env.JWT_SECRET)
    req.payload= jwtVerification.id
    next()
    }
    catch(err){
        return res.status(401).json({message:'Authentication error'})
    }
}
module.exports=jwtMiddleware