var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var _ = require('underscore');
var async = require('async');
var semver = require('semver');
var util = require('../util');

// 更新 module ，通常是处理上传的 tar
module.exports = function updateModule(req, res, next) {
    var pkgDir = util.getModuleDir(req.params);
    var pkgFile = path.join(pkgDir, req.params.name + '-' + req.params.version + '.tar.gz');
    var pkgJsonFile = path.join(pkgDir, 'index.json');
    var projectJsonFile = path.join(util.getModuleDir(_.omit(req.params, 'version')), 'index.json');
    var familyJsonFile = path.join(util.getModuleDir(_.pick(req.params, 'family')), 'index.json');

    var md5 = req.headers['x-package-md5'];
    var ws = fs.createWriteStream(pkgFile + '.tmp');
    var verifier = crypto.createHash('md5');

    async.waterfall([

        // 读取 req 流
        function (callback) {
            req.pipe(ws);
            req.pipe(verifier, {end : false});
            req.on('end', callback);
        },

        // 校验 MD5
        function (callback) {
            if (verifier.digest('hex') === md5) {
                fs.rename(pkgFile + '.tmp', pkgFile, callback);
            } else {
                callback('md5 error');
            }
        },

        // 读取原有的 package json
        function (callback) {
            fs.readFile(pkgJsonFile, callback);
        },

        // 修改 package json
        function (data, callback) {
            var pkgJson = JSON.parse(data);
            _.extend(pkgJson, {
                "updated_at" : new Date(),
                "filename" : path.basename(pkgFile),
                "md5" : md5
            });
            fs.writeFile(pkgJsonFile, JSON.stringify(pkgJson), function (err) {
                callback(err, pkgJson);
            });
        },

        // 修改 project json
        function (pkgJson, callback) {
            fs.readFile(projectJsonFile, function (err, data) {
                if (err) {
                    data = _.pick(pkgJson, 'family', 'name', 'repository', 'keywords', 'homepage', 'description');
                    data.packages = {};
                    data.created_at = new Date();
                } else {
                    data = JSON.parse(data);
                }

                data.packages[pkgJson.version] = _.clone(pkgJson);
                data.update_at = new Date();

                // 选取最新版本
                var vers = _.keys(data.packages).sort(function (v1, v2) {
                    return semver.compare(v2, v1);
                });
                data.version = vers[0];
                fs.writeFile(projectJsonFile, JSON.stringify(data), function (err) {
                    callback(err, data);
                });
            });
        },

        // 修改 family json
        function (projectJson, callback) {
            fs.readFile(familyJsonFile, function (err, data) {
                if (err) {
                    data = [];
                } else {
                    data = JSON.parse(data);
                }
                projectJson = _.omit(projectJson, 'packages');
                var project = _.findWhere(data, {name : projectJson.name});
                if (project) {
                    _.extend(project, projectJson);
                } else {
                    data.push(projectJson);
                }
                data.sort(function (a, b) {
                    return a.name > b.name;
                });

                fs.writeFile(familyJsonFile, JSON.stringify(data), callback);
            });
        },

        // 返回 OK
        function (callback) {
            res.end('ok');
        }

    ], function (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
            message : error,
            status : 'error'
        }));
    });

};