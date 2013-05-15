var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var async = require('async');
var semver = require('semver');
var util = require('../util');
var rimraf = require('rimraf');

// 更新 module ，通常是处理上传的 tar
module.exports = function deleteModule(req, res, next) {
    var pkgDir = util.getModuleDir(req.params);
    var projectDir = util.getModuleDir(_.omit(req.params, 'version'));
    var projectJsonFile = path.join(projectDir, 'index.json');
    var familyJsonFile = path.join(util.getModuleDir(_.pick(req.params, 'family')), 'index.json');

    async.waterfall([

        // 删除 pkg 文件夹
        function (callback) {
            rimraf(pkgDir, callback);
        },

        // 修改 project json
        function (callback) {
            fs.readFile(projectJsonFile, function (err, data) {
                data = JSON.parse(data);
                delete data.packages[req.params.version];

                // 修改最新版本，如果空了就删除 project
                if (_.keys(data.packages).length > 0) {
                    var vers = _.keys(data.packages).sort(function (v1, v2) {
                        return semver.compare(v2, v1);
                    });
                    data.version = vers[0];
                    data.update_at = new Date();
                    fs.writeFile(projectJsonFile, JSON.stringify(data), function (err) {
                        callback(err, data, false);
                    });
                } else {
                    rimraf(projectDir, function (err) {
                        callback(err, data, true);
                    });
                }
            });
        },

        // 修改 family json
        function (projectJson, projectDeleted, callback) {
            fs.readFile(familyJsonFile, function (err, data) {
                data = JSON.parse(data);

                // 修改或删除 project
                if (projectDeleted) {
                    data = _.reject(data, function (project) {
                        return project.name === projectJson.name;
                    });
                } else {
                    var project = _.findWhere(data, {name : projectJson.name});
                    _.extend(project, projectJson);
                }
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