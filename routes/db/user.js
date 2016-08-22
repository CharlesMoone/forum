var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/forumDb', function (err) {
    if (!err) {
        console.log('db is already');
    } else {
        throw err;
    }
});

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    account: String,
    password: String
});

var UserModel = mongoose.model('User', UserSchema, 'User');

function initData(data, db) {
    var query = {};
    for (var key in data) {
        if (db.tree[key]) {
            query[key] = data[key];
        }
    }
    return query;
}

function addUser(data, callback) {
    data = initData(data, UserSchema);
    (new UserModel(data)).save(function (err, doc) {
        callback(err, doc);
    });
}

function findUser(data, callback) {
    data = initData(data, UserSchema);
    UserModel.findOne(data).exec(function (err, doc) {
        callback(err, doc);
    });
}

module.exports = {
    addUser: addUser,
    findUser: findUser
};