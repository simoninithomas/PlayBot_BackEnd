/***********************************************************************************************************
 *                                                      Game Model
 *************************************************************************************************************/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var random = require('mongoose-random');
var gameAndroidSchema = new Schema({

    application_id: String,
    addedDate: String,
    lastModificationDate:String,
    title:{
        EN: String
    },
    link:String,
    platform:String,
    catchphrase:{
        EN: String
    },
    screenshots: String,
    gifs:String,
    promo_videos: String,
    type: String,
    price : Number,
    IAP: Boolean,
    categories: Array,
    downloads_max: Number,
    website: String,
    rating: Number,
    icon: String,
    minOSVersion: String,
    developer: {
        devId : String,
        name: String,
        email: String,
        website: String
    },
    isSponsorised: Boolean,
    isBroadcasted: Boolean,
    impressionNumber: Number,
    clickNumber: Number
});



module.exports = mongoose.model('GameAndroid', gameAndroidSchema);



