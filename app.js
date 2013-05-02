var connect = require('connect');
var connectRoute = require('connect-route');
var WriteStream = require('fs').WriteStream;
var action = require('./action');

var app = connect.createServer(
    connect.logger('dev'),
    connect.static('public'),
    connect.bodyParser(),
    connect.query(),

    connectRoute(function (router) {
        // auth
        router.post('/repository/:family/:name/:version/', action.checkAuth);
        router.put('/repository/:family/:name/:version/', action.checkAuth);
    }),

    connectRoute(function (router) {
        router.get('/repository/:family/', action.getModule);
        router.get('/repository/:family/:name/', action.getModule);
        router.get('/repository/:family/:name/:version/', action.getModule);

        router.post('/repository/:family/:name/:version/', action.createModule);
        router.put('/repository/:family/:name/:version/', action.updateModule);

        router.post('/account/login', action.login);
    }),

    connect.errorHandler()
);

if (!module.parent) {
    app.listen(3000);
}

module.exports = app;