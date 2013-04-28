var crypto = require('crypto');
var path = require('path');
var securityToken = require('../config/security-token');

// 根据 family,name,version 等获取相应的目录名
function getModuleDir(params) {
    return path.join('public', 'repository', params.family, params.name || '', params.version || '');
}

// 计算 HMAC
function getHmac(text) {
    var hmac = crypto.createHmac('sha1', securityToken);
    return hmac.update(text).digest('hex');
}

exports.getModuleDir = getModuleDir;
exports.getHmac = getHmac;