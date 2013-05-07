var cluster = require('cluster');
var os = require('os');
var program = require('commander');

program
    .version('0.0.2')
    .usage('[options]')
    .option('-p, --port <port>', 'Runs TinyYuan on the specified port.Default: 3000');

program.parse(process.argv);

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
    app.listen(program.port || 3000);

    process.on('SIGTERM', function () {
        for (var pid in workers) {
            process.kill(pid);
        }
        process.exit(0);
    });

}


