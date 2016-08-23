var express = require('express');

var db = require('../db/reply');
var router = express.Router();

router.get('/', function (req, res) {
    if (!req.session.status) {
        res.redirect('/user/login');
        return ;
    }
    res.render('replys/replys', {title: 'reply', account: req.session.account});
});

router.post('/all', function (req, res) {
    db.findReply({targetId: req.body.targetId}, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '004', message: 'doc save error!', result: null});
        } else {
            res.send({code: '001', message: 'success', result: doc});
        }
    });
});

router.post('/add', function (req, res) {
    var data = req.body;
    data.userId = req.session.userId;
    data.account = req.session.account;
    data.createTime = new Date().getTime();
    db.addReply(data, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '004', message: 'doc save error!', result: null});
        } else {
            res.send({code: '001', message: 'success', result: null});
        }
    });
});

router.post('/remove', function (req, res) {
    var data = req.body;
    db.removeReply(data, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '004', message: 'doc save error!', result: null});
        } else {
            res.send({code: '001', message: 'success', result: null});
        }
    });
});

module.exports = router;