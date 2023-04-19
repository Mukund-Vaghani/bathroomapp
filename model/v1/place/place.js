const common = require('../../../config/common');
var con = require('../../../config/database');
var asyncLoop = require('node-async-loop');
var global = require('../../../config/constant');
var middleware = require('../../../middleware/validation');

var auth = {

    addplace: function (request, callback) {

        var placeDetail = {
            user_id: request.user_id,
            name: request.name,
            about: request.about,
            location: request.location,
            latitude: request.latitude,
            longitude: request.longitude
        }

        con.query(`INSERT INTO tbl_add_place SET ?`, [placeDetail], function (error, result) {
            if (!error) {
                var id = result.insertId;
                asyncLoop(request.image, (item, next) => {
                    var images = {
                        place_id: id,
                        image: item
                    }

                    con.query("INSERT INTO tbl_place_image SET ?", [images], (error, result) => {
                        if (!error) {
                            next()
                        } else {
                            next()
                        }
                    })
                }, () => {
                    auth.getPlaceDetail(id, function (place_data) {
                        if (place_data) {
                            callback("1", "place add", place_data)
                        } else {
                            callback("0", "reset_keyword_something_wrong_message", error)
                        }
                    });
                })
            } else {
                console.log(error);
                callback('0', "reset_keyword_something_wrong_message", null);
            }
        })
    },

    addPlaceRating: function (request, callback) {
        var placeRating = {
            user_id: request.user_id,
            place_id: request.place_id,
            review: (request.review == "" && request.review == undefined) ? "" : request.review, 
            rating: request.rating
        }

        con.query(`INSERT INTO tbl_rating SET ?`, [placeRating], function (error, result) {
            if (!error) {
                callback("1", "reset_keyword_add_message", result);
            } else {
                console.log(error)
                callback("0", "rating not add, Pls try againe later", null)
            }
        })
    },

    getPlace:function(request,id,callback){
        auth.getUserDetail(id,function(result){
            if(result){
                var lattitude = result[0].lattitude;
                var longitude = result[0].longitude;
                con.query(`SELECT ap.*,(6371 * acos ( cos (radians(${lattitude}) ) * cos( radians(ap.latitude) ) * cos( radians(ap.longitude ) - radians(${longitude}
                    ) ) + sin (radians(${lattitude}) ) * sin( radians(ap.latitude ) ) ) ) AS distance FROM tbl_add_place ap where ap.id = ?`,[request.place_id],function(error,place){
                        if(!error){
                            con.query(`SELECT * FROM tbl_place_image where place_id = ?`,[request.place_id],function(error,image){
                                if(!error){
                                    place[0].image = image
                                    con.query(`SELECT r.*,u.user_name,u.user_profile FROM tbl_rating r join tbl_user u on r.user_id = u.id where place_id = ?`,[request.place_id],function(error,review){
                                        if(!error){
                                            place[0].review = review;
                                            callback("1","success",place)
                                        }else{
                                            callback("0","review not found",null);
                                        }
                                    })
                                }else{
                                    callback("0","place image not found",null)
                                }
                            })
                        }else{
                            callback("0","something went wrong",null)
                        }
                    })
            }else{
                callback("0","something went wrong",null);
            }
        })
    },

    homePage: function(request,id,callback){

        if(request.search != undefined){
            var condition = `where ap.name like '%${request.search}%'`;
        }else{
            var condition = `ORDER BY distance`
        }
        auth.getUserDetail(id,function(result){
            if(result == null){
                callback("0","data not found",null)
            }else{
                var lattitude = result[0].lattitude;
                var longitude = result[0].longitude;
                var sql = `SELECT ap.*,(6371 * acos ( cos (radians(${lattitude}) ) * cos( radians(ap.latitude) ) * cos( radians(ap.longitude ) - radians(${longitude}
                    ) ) + sin (radians(${lattitude}) ) * sin( radians(ap.latitude ) ) ) ) AS distance FROM tbl_add_place ap `;
                    sql += condition;

                    con.query(sql,function(error,result){
                        if(!error && result.length > 0){
                            callback("1","success",result);
                        }else{
                            console.log("AAAAA",error)
                            callback("0","something went wrong",null);
                        }
                    })
            }
        })
    },


    // common function
    getPlaceDetail: function (id, callback) {
        con.query(`SELECT * FROM tbl_add_place WHERE id = ?`, [id], function (error, result) {
            if (!error && result.length > 0) {
                con.query(`SELECT * FROM tbl_place_image WHERE place_id = ?`,[id],function(error,image){
                    if(!error && image.length > 0){
                        result[0].place_image = image
                        callback(result);
                    }else{
                        callback(null);
                    }
                })
            } else {
                callback(null);
            }
        })
    },

    getUserDetail: function(id,callback){
        con.query(`SELECT lattitude,longitude FROM tbl_user WHERE id = ?`, [id], function (error, result) {
            if (!error && result.length > 0) {
                callback(result);
            } else {
                callback(null);
            }
        })
    }

}

module.exports = auth;


// con.query(`select tc.id,tc.category_type from tbl_categories as tc where id = ?`, [id], function (error, result) {
//     var parent_category = result[0];
//     if (!error && result.length > 0) {

//         var qu="select * from tbl_categories where parent_id = "+id+"";
//         if (request.search != '' && request.search != undefined) {
//             var search= request.search;
//             qu+=" and category_type like '%"+search+"%'";
            
//         }
//         console.log(qu);
//         con.query( qu, function (error, result) {
//             if (!error) {
//                 parent_category.category = result;
//                 callback('1', 'data display', parent_category)

//             } else {
//                 callback('2', 'keyword_error', null)
//             }
//         })
//     } else {
//         callback('3', 'keyword_error', null)
//     }
// });