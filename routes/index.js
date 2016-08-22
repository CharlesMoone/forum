var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if (req.path != '/user/login' && !req.session.status) {
        res.redirect('/user/login');
        return ;
    }
    res.render('index', { title: 'Welcome' });
});

module.exports = router;
