// const { spawn } = require('child_process');
// const child = spawn('ls', ['-lh']);
// child.on('exit', (code) => {
//     console.log(`Child process exited with code ${code}`);
// });
// child.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });
// child.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
// });






// var child_process = require('child_process');

// var ls = child_process.spawn('node', ['sessions/Test.js']);
// ls.stdout.on('data', function (data) {
//   console.log('stdout: ' + data);
// });

// ls.stderr.on('data', function (data) {
//   console.log('stderr: ' + data);
// });

// ls.on('close', function (code) {
//   console.log('child process exited with code ' + code);
// });



// const child_process = require('child_process');
// for(var i=0; i<3; i  ) {
//   var childProcess = child_process.spawn('node', ['node-childPro-spawn.js', i]);  
//   childProcess.stdout.on('data', function (data) {
//     console.log('stdout: '   data);
//   });
//   childProcess.stderr.on('data', function (data) {
//     console.log('stderr: '   data);
//   });
//   childProcess.on('close', function (code) {
//     console.log('子程序已退出，退出碼 ' code);
//   });
// }



const execFile = require('child_process').execFile;
const child = execFile('node', ['sessions/Test.js'], (error, stdout, stderr) => {
    if (error) {
        console.error('stderr', stderr);
        throw error;
    }
    console.log('stdout', stdout);
});