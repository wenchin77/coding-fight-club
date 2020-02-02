const twoSum = function(nums, target) {
      const comp = {};
      for(let i=0; i<nums.length; i++){
          if(comp[nums[i]]>=0){
              return [ comp[nums[i] ], i]
          }
          comp[target-nums[i]] = i
      }
    };
console.log('[Expected] '+twoSum([1,2,3],5));
console.log('[Expected] '+twoSum([1,2,3],5));
console.log('[Expected] '+twoSum([1,2,3],5));
console.log('[Expected] '+twoSum([1,2,3],5));
console.log('[Expected] '+twoSum([1,2,3],5));