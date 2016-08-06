/***********************************************************************************************************
 *                                                      Modules
 *************************************************************************************************************/
var express = require('express');
var path = require('path'); // Path is uselful to tell where our Angular application files are
var mongoose = require('mongoose');
var bodyParser = require("body-parser"); //Body Parser : Let us pull POST content from our HTTP request
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwtStrategy = require('passport-jwt').Strategy;
var jwt = require('express-jwt');


var auth = jwt({
    secret: "iloveplayingvideogames",
    userProperty: 'payload'
});

var ctrlProfile = require('./controllers/profile');
var ctrlAuth = require('./controllers/authentification');


var config = require('./config/config');
require('./config/passport');
var User = require('./models/user');
var User = mongoose.model('User');

var app = express();
app.use(passport.initialize());

/***********************************************************************************************************
 *                                                      Configuration
 *************************************************************************************************************/
// Set our port
var port = process.env.PORT || 8080;
// Config files
var db = require("./config/db");

// Connexion to the db
mongoose.connect(db.url);

// Secret variable
app.set('superSecret', config.secret);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));


/***********************************************************************************************************
 *                                                  Routes for our API
 *************************************************************************************************************/
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

// Catch unauthorised errors Passport
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({"message": err.name + ": " + err.message});
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'PUT', 'DELETE');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// Get an instance of the express Router
var router = express.Router();


// Register our routes
// All of our routes will be prefixed with /api
app.use('/api/v1', router);

/**********************************************************
 *                          ANDROID GAMES
 *********************************************************/
router.post('/games/android', auth, function (req, res) {
    // Create a new instance of the Game model
    var game = new GameAndroid();

    // Set the game informations (comes from the request)
    if (!(req.body.screenshots)) {
        handleError(res, "Must have a screenshot.", 400);
    }
    if (!(req.body.title)) {
        handleError(res, "Must have a title.", 400);
    }
    if (!(req.body.categories)) {
        handleError(res, "Must have a category.", 400);
    }
    if (!(req.body.link)) {
        handleError(res, "Must have a marketplace link.", 400);
    }
    else {

        game.application_id = req.body.application_id;
        game.addedDate = new Date();
        game.lastModificationDate = new Date();
        game.title.EN = req.body.title.EN;
        game.platform = "Android";
        game.link = req.body.link;
        game.catchphrase.EN = req.body.catchphrase.EN;
        game.icon = req.body.icon;
        game.screenshots = req.body.screenshots;
        game.gifs = req.body.gifs;
        game.promo_videos = req.body.promo_videos;
        game.type = req.body.type;
        game.price = req.body.price;
        game.IAP = req.body.IAP;
        game.categories = req.body.categories;
        game.downloads_max = req.body.downloads_max;
        game.rating = req.body.rating;
        game.minOSVersion = req.body.minOSVersion;
        game.website = req.body.website;
        game.developer.devId = req.body.developer.devId;
        game.developer.name = req.body.developer.name;
        game.developer.email = req.body.developer.email;
        game.developer.website = req.body.developer.website;
        game.isSponsorised = req.body.isSponsorised;
        game.isBroadcasted = req.body.isBroadcasted;

        game.save(function (err) {
                if (err)
                    handleError(res, err.message, "Failed to create new game.");

                console.log({message: 'Game added to the db !'});
            }
        );
    }
})

// Get all the games
router.get('/games/android/all', function (req, res) {

    GameAndroid.find(function (err, games) {
        if (err) {
            handleError(res, err.message, "Failed to get games.");
        }
        else {
            res.json(games);
        }
    })
});


router.get('/games/android', function (req, res) {


    /**********************************************************************************************************
     *                                                 GET GAMES
     *                                                 More information : https://drive.google.com/file/d/0B01PLHcW45KLUmxzSzdpd0todWM/view?usp=sharing
     ************************************************************************************************************/
    var requestCategory = req.query.categories;

    var querySponsorisedGameWithNOcategories = [
        {
            $match: {
                isSponsorised: true
            }

        },
        {
            $sample: {
                size: 1
            }
        }

    ];

    var querySponsorisedGameWithANDcategories = [
        {
            $match: {

                $and: [
                    {isSponsorised: true},
                    {categories: requestCategory}
                ]
            }
        },
        {
            $sample: {
                size: 1
            }
        }
    ];

    var queryGamesWithNOcategories = [
        {
            $match: {
                isSponsorised: false
            }

        },
        {
            $sample: {
                size: 4
            }
        }
    ];

    var queryGamesWithANDcategories = [
        {
            $match: {

                $and: [
                    {isSponsorised: false},
                    {categories: requestCategory}
                ]
            }
        },
        {
            $sample: {
                size: 4
            }
        }
    ];


    /********************************************************************************************
     * getOneSponsorisedGame()
     * */
    var sponsorisedGame;

    // if no categories
    if (!requestCategory) {
        console.log('Undefined');
        GameAndroid.aggregate(querySponsorisedGameWithNOcategories).exec(function (err, games) {
            if (err) {
                handleError(res, err.message, "Failed to get games.");
            }
            else {
                sponsorisedGame = games;

                GameAndroid.aggregate(queryGamesWithNOcategories).exec(function (err, games2) {
                    if (err) {
                        handleError(res, err.message, "Failed to get games.");
                    }
                    else {
                        jsonArray1 = games.concat(games2);
                        res.json(jsonArray1);

                    }
                })

            }
        })
    }
    else {
        GameAndroid.aggregate(querySponsorisedGameWithANDcategories).exec(function (err, games) {
            if (err) {
                handleError(res, err.message, "Failed to get a sponsorised game.");
            }
            else {
                sponsorisedGame = games;

                GameAndroid.aggregate(queryGamesWithANDcategories).exec(function (err, games2) {
                    if (err) {
                        handleError(res, err.message, "Failed to get a sponsorised game.");
                    }
                    else {
                        jsonArray1 = games.concat(games2);

                        //  GameAndroid.update({_id: {$in: jsonArray1}},{$set: {impressionNumber: impressionNumber + 1}})

                        res.json(jsonArray1);

                    }
                })
            }


        })
    }
    console.log(sponsorisedGame);

})


/*  "/android/:id"
 *    GET: find android game by id
 *    PUT: update android game by id
 *    DELETE: deletes android game by id
 */
router.route('/games/android/:games_id')
    // Get game
    .get(function (req, res) {
        GameAndroid.findById(req.params.games_id, function (err, game) {
            if (err)
                handleError(res, err.message, "Failed to get game");
            res.json(game);
        });
    })

router.put('/games/android/:games_id', auth, function (req, res) {
    var gameModified = new GameAndroid();
    // Modify game
    GameAndroid.findById(req.params.games_id, function (err, gameModified) {

        console.log('gameModified', gameModified);
        if (err) {
            handleError(res, err.message, "Failed to get game");
        }
        else {
            gameModified.application_id = req.body.application_id;
            gameModified.lastModificationDate = new Date();
            gameModified.title.EN = req.body.title.EN;
            gameModified.platform = "Android";
            gameModified.link = req.body.link;
            gameModified.catchphrase.EN = req.body.catchphrase.EN;
            gameModified.icon = req.body.icon;
            gameModified.screenshots = req.body.screenshots;
            gameModified.gifs = req.body.gifs;
            gameModified.promo_videos = req.body.promo_videos;
            gameModified.type = req.body.type;
            gameModified.price = req.body.price;
            gameModified.IAP = req.body.IAP;
            gameModified.categories = req.body.categories;
            gameModified.downloads_max = req.body.downloads_max;
            gameModified.website = req.body.website;
            gameModified.rating = req.body.rating;
            gameModified.minOSVersion = req.body.minOSVersion;
            gameModified.developer.devId = req.body.developer.devId;
            gameModified.developer.name = req.body.developer.name;
            gameModified.developer.email = req.body.developer.email;
            gameModified.developer.website = req.body.developer.website;
            gameModified.isSponsorised = req.body.isSponsorised;
            gameModified.isBroadcasted = req.body.isBroadcasted;

            // Save the game
            gameModified.save(function (err) {
                if (err)
                    handleError(res, err.message, "Failed to update game");


                res.json({
                    message: 'Game updated!'
                });
                console.log("Game updated");
            });
        }
    })
})


router.delete('/games/android/:games_id', auth, function (req, res) {
    // Deleting game
    GameAndroid.remove({
        _id: req.params.games_id
    }, function (err, game) {
        if (err) {
            handleError(res, err.message, "Failed to delete the game");
        }
        else {
            res.json({message: 'Successfully deleted'});
        }
    });
});

/**********************************************************
 *                          IOS GAMES
 *********************************************************/
router.post('/games/ios', auth, function (req, res) {

    var game = new GameIos();

    // Create a new instance of the Game model
    var game = new GameAndroid();

    // Set the game informations (comes from the request)
    if (!(req.body.screenshots)) {
        handleError(res, "Must have a screenshot.", 400);
    }
    if (!(req.body.title)) {
        handleError(res, "Must have a title.", 400);
    }
    if (!(req.body.categories)) {
        handleError(res, "Must have a category.", 400);
    }
    if (!(req.body.link)) {
        handleError(res, "Must have a marketplace link.", 400);
    }
    else {

        game.application_id = req.body.application_id;
        game.addedDate = new Date();
        game.lastModificationDate = new Date();
        game.title.EN = req.body.title.EN;
        game.platform = "Android";
        game.link = req.body.link;
        game.catchphrase.EN = req.body.catchphrase.EN;
        game.icon = req.body.icon;
        game.screenshots = req.body.screenshots;
        game.gifs = req.body.gifs;
        game.promo_videos = req.body.promo_videos;
        game.type = req.body.type;
        game.price = req.body.price;
        game.IAP = req.body.IAP;
        game.categories = req.body.categories;
        game.downloads_max = req.body.downloads_max;
        game.rating = req.body.rating;
        game.minOSVersion = req.body.minOSVersion;
        game.website = req.body.website;
        game.developer.devId = req.body.developer.devId;
        game.developer.name = req.body.developer.name;
        game.developer.email = req.body.developer.email;
        game.developer.website = req.body.developer.website;
        game.isSponsorised = req.body.isSponsorised;
        game.isBroadcasted = req.body.isBroadcasted;

        game.save(function (err) {
                if (err)
                    handleError(res, err.message, "Failed to create new game.");

                console.log({message: 'Game added to the db !'});
            }
        );
    }
})

router.get('/games/ios/all', function (req, res) {

    GameIos.find(function (err, games) {
        if (err) {
            handleError(res, err.message, "Failed to get games.");
        }
        else {
            res.json(games);
        }
    })
});

router.get('/games/ios', function (req, res) {

    /**********************************************************************************************************
     *                                                 GET GAMES
     *                                                 More information : https://drive.google.com/file/d/0B01PLHcW45KLUmxzSzdpd0todWM/view?usp=sharing
     ************************************************************************************************************/
    var requestCategory = req.query.categories;
    console.log('requestCategory', requestCategory);
    var querySponsorisedGameWithNOcategories = [
        {
            $match: {
                isSponsorised: true
            }

        },
        {
            $sample: {
                size: 1
            }
        }

    ];

    var querySponsorisedGameWithANDcategories = [
        {
            $match: {

                $and: [
                    {isSponsorised: true},
                    {categories: requestCategory}
                ]
            }
        },
        {
            $sample: {
                size: 1
            }
        }
    ];

    var queryGamesWithNOcategories = [
        {
            $match: {
                isSponsorised: false
            }

        },
        {
            $sample: {
                size: 4
            }
        }
    ];

    var queryGamesWithANDcategories = [
        {
            $match: {

                $and: [
                    {isSponsorised: false},
                    {categories: requestCategory}
                ]
            }
        },
        {
            $sample: {
                size: 4
            }
        }
    ];


    /********************************************************************************************
     * getOneSponsorisedGame()
     * */
    var sponsorisedGame;
    // if no categories
    if (!requestCategory) {
        console.log('No category');
        GameIos.aggregate(querySponsorisedGameWithNOcategories).exec(function (err, games) {
            if (err) {
                handleError(res, err.message, "Failed to get games.");
            }
            else {
                sponsorisedGame = games;

                GameIos.aggregate(queryGamesWithNOcategories).exec(function (err, games2) {
                    if (err) {
                        handleError(res, err.message, "Failed to get games.");
                    }
                    else {
                        jsonArray1 = games.concat(games2);
                        res.json(jsonArray1);

                    }
                })

            }
        })
    }
    else {
        GameIos.aggregate(querySponsorisedGameWithANDcategories).exec(function (err, games) {
            console.log('querySponsorisedGameWithANDcategories', querySponsorisedGameWithANDcategories);
            if (err) {
                handleError(res, err.message, "Failed to get a sponsorised game.");
            }
            else {
                sponsorisedGame = games;

                GameIos.aggregate(queryGamesWithANDcategories).exec(function (err, games2) {
                    if (err) {
                        handleError(res, err.message, "Failed to get a sponsorised game.");
                    }
                    else {
                        jsonArray1 = games.concat(games2);

                        // GameIos.update({_id: {$in: jsonArray1}},{$set: {impressionNumber: impressionNumber + 1}})

                        res.json(jsonArray1);

                    }
                })
            }


        })
    }
    console.log(sponsorisedGame);

})


/*  "/ios/:id"
 *    GET: find android game by id
 *    PUT: update android game by id
 *    DELETE: deletes android game by id
 */
router.route('/games/ios/:games_id')
    // Get game
    .get(function (req, res) {
        GameIos.findById(req.params.games_id, function (err, game) {
            if (err)
                handleError(res, err.message, "Failed to get game");
            res.json(game);
        });
    })

router.put('/games/ios/:games_id', auth, function (req, res) {
    // Modify game
    var gameModified = new GameIos();
    GameIos.findById(req.params.games_id, function (err, gameModified) {
        if (err) {
            handleError(res, err.message, "Failed to get game");
        }
        else {

            gameModified.application_id = req.body.application_id;
            gameModified.lastModificationDate = new Date();
            gameModified.title.EN = req.body.title.EN;
            gameModified.platform = "Android";
            gameModified.link = req.body.link;
            gameModified.catchphrase.EN = req.body.catchphrase.EN;
            gameModified.icon = req.body.icon;
            gameModified.screenshots = req.body.screenshots;
            gameModified.gifs = req.body.gifs;
            gameModified.promo_videos = req.body.promo_videos;
            gameModified.type = req.body.type;
            gameModified.price = req.body.price;
            gameModified.IAP = req.body.IAP;
            gameModified.categories = req.body.categories;
            gameModified.downloads_max = req.body.downloads_max;
            gameModified.website = req.body.website;
            gameModified.rating = req.body.rating;
            gameModified.minOSVersion = req.body.minOSVersion;
            gameModified.developer.devId = req.body.developer.devId;
            gameModified.developer.name = req.body.developer.name;
            gameModified.developer.email = req.body.developer.email;
            gameModified.developer.website = req.body.developer.website;
            gameModified.isSponsorised = req.body.isSponsorised;
            gameModified.isBroadcasted = req.body.isBroadcasted;


            // Save the game
            gameModified.save(function (err) {
                if (err)
                    handleError(res, err.message, "Failed to update game");


                res.json({
                    message: 'Game updated!'
                });
                console.log("Game updated");
            });
        }
    })
})


router.delete('/games/ios/:games_id', auth, function (req, res) {
    // Deleting game
    GameIos.remove({
        _id: req.params.games_id
    }, function (err, game) {
        if (err) {
            handleError(res, err.message, "Failed to delete the game");
        }
        else {
            res.json({message: 'Successfully deleted'});
        }
    });
});

/***********************************************************************************************************
 *                                                  Start the server
 *************************************************************************************************************/
app.listen(port);
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;

// Load GameSchema
var GameAndroid = require('./models/gameAndroid');

var GameIos = require('./models/gameIos');


/******************************************************************************************************
 *                                          Passport
 * *****************************************************************************************************/
// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

