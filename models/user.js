var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // created by combining the password provided by the user and the salt, and then applying one-way encryption.
    hash: String,
    //string of characters unique to each user
    salt: String
});

// method will then use crypto.randomBytes to set the salt, and crypto.pbkdf2Sync to set the hash.
userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
// sign method that we can use to create a JWT
    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(expiry.getTime() / 1000),
    }, "iloveplayingvideogames"); // DO NOT KEEP YOUR SECRET IN THE CODE!  It is best practice to set the secret as an environment variable, and not have it in the source code, especially if your code is stored in version control somewhere.
};

mongoose.model('User', userSchema);