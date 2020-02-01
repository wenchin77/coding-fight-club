const { spawn } = require('child_process');
const child = spawn('ls', ['-lh']);
child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
});
child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});
child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

