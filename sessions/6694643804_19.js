console.time('Time');
const twoSum = function(nums, target) {
	const comp = {};
	for(let i=0; i<nums.length; i++){
		if(comp[nums[i] ]>=0){
			return [ comp[nums[i] ] , i]
		}
	comp[target-nums[i]] = i
	}
};
console.log('Sample test case: '+'[2, 7, 11, 15],9');
let result_sample = JSON.stringify(twoSum([2, 7, 11, 15],9));
console.log('Sample output: '+result_sample);
console.log('Sample output expected: '+"[0,1]")
console.log('')
console.timeEnd('Time');