var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var async = require('async');
var semver = require('semver');
var util = require('../util');
var rimraf = require('rimraf');

// 删除 project
module.exports = function deleteProject(req, res, next) {
    var projectDir = util.getModuleDir(req.params);
    var familyJsonFile = path.join(util.getModuleDir(_.pick(req.params, 'family')), 'index.json');

    async.waterfall([
        // 检查是否存在
        function (callback) {
            fs.exists(projectDir, function (exists) {
                if (exists) {
                    callback();
                } else {
                    callback('no such repo!')
                }
            });
        },

        // 删除 pkg 文件夹
        function (callback) {
            rimraf(projectDir, callback);
        },

        // 修改 family json
        function (callback) {
            fs.readFile(familyJsonFile, function (err, data) {
                data = JSON.parse(data);

                data = _.reject(data, function (project) {
                    return project.name === req.params.name;
                });
                fs.writeFile(familyJsonFile, JSON.stringify(data), callback);
            });
        },

        // 返回 OK
        function (callback) {
            res.end(JSON.stringify({
                status : 'info',
                message : 'repo deleted'
            }));
        }

    ], function (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
            message : error,
            status : 'error'
        }));
    });

};