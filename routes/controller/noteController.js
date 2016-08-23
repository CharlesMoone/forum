var express = require('express');

var db = require('../db/note');
var replyDb = require('../db/reply');

var router = express.Router();

router.post('/all', function (req, res) {
    if (!req.session.status) {
        res.redirect('/user/login');
        return ;
    }
    db.findNote({}, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '004', message: 'doc save error!', result: null});
        } else {
            res.send({code: '001', message: 'success', result: doc});
        }
    });
});

router.post('/new', function (req, res) {
    if (!req.session.status) {
        res.redirect('/user/login');
        return ;
    }
    var data = req.body;
    data.userId = req.session.userId;
    data.account = req.session.account;
    var time = new Date().getTime();
    data.createTime = time;
    db.addNote(data, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '004', message: 'doc save error!', result: null});
        } else {
            data = {
                userId: req.session.userId,
                targetId: doc._id,
                account: req.session.account,
                replyContent: req.body.noteContent,
                createTime: time
            };
            replyDb.addReply(data, function (err, doc) {
                if (err) {
                    res.send({code: '003', message: 'database error!', result: null});
                } else if (!doc) {
                    res.send({code: '004', message: 'doc is null!', result: null});
                } else {
                    res.send({code: '001', message: 'success', result: null});
                }
            });
        }
    });
});

router.post('/remove', function (req, res) {
    if (!req.session.status) {
        res.redirect('/user/login');
        return ;
    }
    var data = req.body;
    db.removeNote(data, function (err, doc) {
        if (err) {
            res.send({code: '003', message: 'database error!', result: null});
        } else if (!doc) {
            res.send({code: '004', message: 'doc save error!', result: null});
        } else {
            data = {
                targetId: req.body._id
            };
            replyDb.removeReply(data, function (err, doc) {
                if (err) {
                    res.send({code: '003', message: 'database error!', result: null});
                } else if (!doc) {
                    res.send({code: '004', message: 'doc is null!', result: null});
                } else {
                    res.send({code: '001', message: 'success', result: null});
                }
            });
        }
    });
});

module.exports = router;