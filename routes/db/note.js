var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    noteTitle: String,
    noteContent: String,
    createTime: Number,
    userId: String,
    account: String
});

var NoteModel = mongoose.model('Note', NoteSchema, 'Note');

function initData(data, db) {
    var query = {};
    for (var key in data) {
        if (db.tree[key]) {
            query[key] = data[key];
        }
    }
    return query;
}

function addNote(data, callback) {
    data = initData(data, NoteSchema);
    (new NoteModel(data)).save(function (err, doc) {
        callback(err, doc);
    });
}

function findNote(data, callback) {
    data = initData(data, NoteSchema);
    NoteModel.find(data).exec(function (err, doc) {
        callback(err, doc);
    });
}

function removeNote(data, callback) {
    data = initData(data, NoteSchema);
    NoteModel.remove(data, function (err, doc) {
        callback(err, doc);
    });
}

module.exports = {
    addNote: addNote,
    findNote: findNote,
    removeNote: removeNote
};