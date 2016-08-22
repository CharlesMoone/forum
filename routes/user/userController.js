var express = require('express');
var db = require('../db/user');
var router = express.Router();

router.get('/login', function (req, res) {
    if (req.session.status) {
        res.redirect('/');
        return ;
    }
    res.render('./user/login', { title: 'login' });
});

router.post('/login', function (req, res, next) {
    db.findUser(req.body, function (err, doc) {
        if (err || !doc) {
            res.send({code: '003', message: 'database error!', result: null});
            return ;
        }
        req.session.status = true;
        req.session.userId = doc._id;
        res.send({code: '001', message: 'success', result: null});
    });
});

router.post('/register', function (req, res, next) {
    db.addUser(req.body, function (err, doc) {
        if (err || !doc) {
            res.send({code: '003', message: 'database error!', result: null});
            return ;
        }
        req.session.status = true;
        req.session.userId = doc._id;
        res.send({code: '001', message: 'success', result: null});
    });
});

router.post('/quit', function (req, res) {
    req.session.status = false;
    res.send({code: '001', message: 'success', result: null});
});

module.exports = router;
