function allowOnlySpecificUser(req, res, next) {
    if(!req.itIsAdmin) return res.status(400).json({message : "some thing went wrong , you are not allowed to do this action"})
    next()
}

module.exports = allowOnlySpecificUser