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
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '002', message: 'account or password wrong!', result: null});
        } else {
            req.session.status = true;
            req.session.userId = doc._id;
            req.session.account = doc.account;
            res.send({code: '001', message: 'success', result: null});
        }
    });
});

router.post('/register', function (req, res, next) {
    db.findUser({account: req.body.account}, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (doc) {
            res.send({code: '002', message: 'account repeat!', result: null});
        } else {
            db.addUser(req.body, function (err, doc) {
                if (err) {
                    res.send({code: '003', message: 'database error!', result: null});
                } else if (!doc) {
                    res.send({code: '002', message: 'account or password wrong!', result: null});
                } else {
                    req.session.status = true;
                    req.session.userId = doc._id;
                    req.session.account = doc.account;
                    res.send({code: '001', message: 'success', result: null});
                }
            });
        }
    });
});

router.post('/quit', function (req, res) {
    req.session.status = false;
    res.send({code: '001', message: 'success', result: null});
});

module.exports = router;
