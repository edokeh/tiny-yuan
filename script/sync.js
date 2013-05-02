var child_process = require('child_process');

var packages = ['gallery/moment']

child_process.exec('spm install gallery/moment', function(err, stdout, stderr) {
    if (err || stderr) {
        console.log('error');
    } else {

    }
});