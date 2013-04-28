var fs = require('fs');
var _ = require('underscore');
var util = require('../util');
var accounts = require('../../config/account.json');

// 登录
module.exports = function login(req, res) {
    var user = _(accounts).findWhere({
        username : req.body.account,
        password : req.body.password
    });

    if (user) {
        res.end(JSON.stringify({
            data : user.username + '-' + util.getHmac(user.username)
        }));
    } else {
        res.writeHead(403);
        res.end(JSON.stringify({
            message : 'Login Failed!'
        }));
    }
}
