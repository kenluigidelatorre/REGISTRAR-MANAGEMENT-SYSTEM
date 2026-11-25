module.exports = function requireRegistrarService(req,res,next){
  const expected = process.env.REGISTRAR_SERVICE_KEY;
  const supplied = req.get("X-Registrar-Service-Key");
  if (!expected || expected.length < 32 || expected.startsWith("replace_with_")) return res.status(503).json({status:"error",message:"Registrar service integration is not configured with a strong key."});
  if (!supplied || supplied !== expected) return res.status(401).json({status:"error",message:"Unauthorized service request."});
  next();
};
