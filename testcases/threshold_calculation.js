// run test in child process
const fs = require("fs");
const { spawn } = require("child_process");

const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// ADD DATA HERE!!!!!!!!!
const path = './testcases/35/11.json'
const code = `const searchInsert = function(nums, target) {
  for (let i = 0; i < nums.length; i++){
      if (nums[i] >= target){
          return i;
      }
  }
  return nums.length;
};`

const code = `const searchInsert = function(nums, target) {
  const toBeInserted = () => {
      const rightIndex = nums.length -1;
      for (let i = rightIndex; i >= 0; i--) {
          if(target > nums[i]) {
           return i + 1;
          }
      }
      return 0;
  }
  const includes = nums.includes(target);
  return includes 
      ?  nums.indexOf(target)
      :  toBeInserted();
};`


const codeConst = 'searchInsert'
const test = (fs.readFileSync(path))

const putTogetherCodeOnRun = (code, codeConst, test) => {
  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\n`;
  // sample test case
  let consoleLogCode = `let result = JSON.stringify(${codeConst}(${test}));`;
  // format
  finalCode += (consoleLogCode + `\nconsole.log(result)`);
  finalCode += `\nconsole.timeEnd('Time');`;
  return finalCode;
};

let finalCode = putTogetherCodeOnRun(code, codeConst, test);



let file = fs.openSync(`./testcases/threshold_test.js`, "w");
fs.writeSync(file, finalCode, (encoding = "utf-8"));
fs.closeSync(file);



const runCodeInChildProcess = () => {
  return new Promise((resolve, reject) => {
    console.log('entered child_process')
    let ls = spawn('node', [`./testcases/threshold_test.js`]);
    let result = '';
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      result += arrayBufferToStr(data);
    });
    
    ls.stderr.on('data', (data) => {
      result += arrayBufferToStr(data);
      console.error(`stderr: ${data}`);
    });

    ls.on('error', reject)
      .on('close', code => {
      if (code === 0) {
        console.log(result);
        resolve(result);
      } else {
        reject(result);
      }
      console.log(`exited child_process at with code ${code}`);
    });

    // timeout error setting
    setTimeout(() => {
      ls.kill();
      reject('EXECUTION TIMED OUT');
    }, 30000); // 30 sec time out
  });
}

async function run(finalCode) {
    try {
    let result = await runCodeInChildProcess(finalCode);
    console.log(result)

  } catch (e) {
    console.log(e)
  }
}

run(finalCode);

