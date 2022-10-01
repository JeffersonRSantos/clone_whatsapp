HomeController = {
    async index(req, res, next){
        try {
            if(typeof(req.session.data) != 'undefined'){
                res.render('index', {
                    session: req.session.data
                });
            }else{
                res.redirect('/')
            }
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = HomeController