var path = require('path');
var fs = require('fs');
var util = require('../util');

// 获取 module ，返回目录下的 index.json
module.exports = function getModule(req, res, next) {
    var dir = util.getModuleDir(req.params);
    var rs = fs.createReadStream(path.join(dir, 'index.json'));
    rs.pipe(res);
    rs.on('error', function () {
        next();
    });
}
