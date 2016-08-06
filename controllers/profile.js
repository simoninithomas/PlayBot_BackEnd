var mongoose = require('mongoose');
var User = require('../models/user');
var User = mongoose.model('User');

module.exports.profileRead = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message" : "UnauthorizedError: private profile"
        });
    } else {
        console.log("RESQUEST", req.payload._id)

        User
            .findById(req.payload._id)
            .exec(function(err, user) {
                console.log('USER', User)
                res.status(200).json(user);
                console.log('res statuts', res.status);
            });
    }

};
