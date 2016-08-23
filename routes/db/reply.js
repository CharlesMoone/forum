var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var ReplySchema = new Schema({
    userId: String,
    targetId: String,
    account: String,
    replyContent: String,
    createTime: Number
});

var ReplyModel = mongoose.model('Reply', ReplySchema, 'Reply');

function initData(data, db) {
    var query = {};
    for (var key in data) {
        if (db.tree[key]) {
            query[key] = data[key];
        }
    }
    return query;
}

function addReply(data, callback) {
    data = initData(data, ReplySchema);
    (new ReplyModel(data)).save(function (err, doc) {
        callback(err, doc);
    });
}

function findReply(data, callback) {
    data = initData(data, ReplySchema);
    ReplyModel.find(data).exec(function (err, doc) {
        callback(err, doc);
    });
}

function removeReply(data, callback) {
    data = initData(data, ReplySchema);
    ReplyModel.remove(data, function (err, doc) {
        callback(err, doc);
    });
}

module.exports = {
    addReply: addReply,
    findReply: findReply,
    removeReply: removeReply
};