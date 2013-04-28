var util = require('../util');

// 是否授权
module.exports = function checkAuth(req, res, next) {
    var auth = req.headers.authorization + '';
    var arr = auth.replace('Yuan', '').trim().split('-');
    if (arr[1] === util.getHmac(arr[0])) {
        req.author = arr[0];
        next();
    } else {
        res.writeHead(401);
        res.end('');
    }
}