var cluster = require('cluster');
var os = require('os');

var numCPU = os.cpus().length;
var workers = {};

if (cluster.isMaster) {
    cluster.on('death', function (worker) {
        delete worker[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });

    for (var i = 0; i < numCPU; i++) {
        var worker = cluster.fork();
        workers[worker.pid] = worker;
    }
} else {
    var app = require('./app');
    app.listen(3000);

    process.on('SIGTERM', function () {
        for (var pid in workers) {
            process.kill(pid);
        }
        process.exit(0);
    });

}


