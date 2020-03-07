const user_table = [
  {
    id: 1,
    provider: "native",
    email: "test1@gmail.com",
    user_password: "test1password",
    user_name: "test1",
    picture: null,
    github_url: null,
    token: "test1accesstoken",
    access_expired: 1582992000,
  },
  {
    id: 2,
    provider: "github",
    email: "test2@gmail.com",
    user_password: null,
    user_name: "test2",
    picture: "pic2",
    github_url: "https://github.com/wenchin77",
    token: "test2accesstoken",
    access_expired: 1582992000,
  },
  {
    id: 3,
    provider: "google",
    email: "test3@gmail.com",
    user_password: null,
    user_name: "test3",
    picture: "pic3",
    github_url: null,
    token: "test3accesstoken",
    access_expired: 1582992000,
  },
  {
    id: 4,
    provider: "native",
    email: "test4@gmail.com",
    user_password: "test4password",
    user_name: "test4",
    picture: null,
    github_url: null,
    token: "test4accesstoken",
    access_expired: 1577808000 // expired
  },
];

const level_table = [
  {
    id: 1,
    level_name: "Beginner Fighter",
    min_points: 0
  },
  {
    id: 2,
    level_name: "Skilled Fighter",
    min_points: 200
  },
  {
    id: 3,
    level_name: "Advanced Fighter",
    min_points: 500
  },
  {
    id: 4,
    level_name: "Expert Fighter",
    min_points: 1000
  },
  {
    id: 5,
    level_name: "Master Fighter",
    min_points: 2000
  },
];

const match_table = [
  {
    id: 1,
    question_id: 1,
    match_key: 1111111111,
    winner_user_id: 1,
    match_start_time: 1582999000,
    match_status: 1
  },
  {
    id: 2,
    question_id: 1,
    match_key: 2222222222,
    winner_user_id: 3,
    match_start_time: 1582999000,
    match_status: 1
  },
  {
    id: 3,
    question_id: 1,
    match_key: 3333333333,
    winner_user_id: null,
    match_start_time: Date.now(),
    match_status: 0
  },
];

const match_detail = [
  {
    id: 1,
    match_id: 1,
    user_id: 1,
    answer_code: "const twoSum = function(nums, target) { 	const comp = {}; 	for(let i=0; i<nums.length; i++){ 		if(comp[nums[i] ]>=0){ 			return [ comp[nums[i] ] , i] 		} 	comp[target-nums[i]] = i 	} };",
    small_correctness: "6/6",
    large_correctness: "1/1",
    correctness: 100,
    large_passed: "1/1",
    large_exec_time: 1111,
    performance: 100,
    answer_time: 10,
    points: 100
  },
  {
    id: 2,
    match_id: 1,
    user_id: 2,
    answer_code: "const twoSum = function(nums, target) { return 123 };",
    small_correctness: "0/0",
    large_correctness: "0/0",
    correctness: 0,
    large_passed: "0/0",
    large_exec_time: null,
    performance: 0,
    answer_time: 20,
    points: 0
  },
  {
    id: 3,
    match_id: 2,
    user_id: 3,
    answer_code: "const searchInsert = (nums, target) => { return 1 };",
    small_correctness: "1/9",
    large_correctness: "0/3",
    correctness: 8.33,
    large_passed: "0/3",
    large_exec_time: null,
    performance: 0,
    answer_time: 30,
    points: 4
  },
  {
    id: 4,
    match_id: 2,
    user_id: 4,
    answer_code: "// You did not submit in this match",
    small_correctness: "N/A",
    large_correctness: "N/A",
    correctness: 0,
    large_passed: "N/A",
    large_exec_time: null,
    performance: 0,
    answer_time: 40,
    points: 0
  },
  {
    id: 5,
    match_id: 3,
    user_id: 3,
    answer_code: null,
    small_correctness: null,
    large_correctness: null,
    correctness: null,
    large_passed: null,
    large_exec_time: null,
    performance: null,
    answer_time: null,
    points: null
  },
  {
    id: 6,
    match_id: 3,
    user_id: 4,
    answer_code: null,
    small_correctness: null,
    large_correctness: null,
    correctness: null,
    large_passed: null,
    large_exec_time: null,
    performance: null,
    answer_time: null,
    points: null
  }
];

const question = [
  {
    id: 1,
    question_name: "Two Sum",
    question_text: "Test question text 1",
    question_code: `const twoSum = function(nums, target) {
      // Write your code here
    };`,
    question_const: "twoSum",
    difficulty: "easy",
    category: "array"
  },
  {
    id: 2,
    question_name: "Search Insert Position",
    question_text: "Test question text 2",
    question_code: `const searchInsert = function(nums, target) {
      // Write your code here
    };`,
    question_const: "searchInsert",
    difficulty: "easy",
    category: "binary_search"
  }
];

const test = [
  {
    id: 1,
    question_id: 1,
    test_case_path: "testcases_1_0.json",
    test_result: "[0,2]",
    threshold_ms: null,
    is_large_case: 0
  },
  {
    id: 2,
    question_id: 1,
    test_case_path: "testcases_1_1.json",
    test_result: "[0,1]",
    threshold_ms: null,
    is_large_case: 0
  },
  {
    id: 3,
    question_id: 1,
    test_case_path: "testcases_1_2.json",
    test_result: "[3,4]",
    threshold_ms: null,
    is_large_case: 0
  },
  {
    id: 4,
    question_id: 1,
    test_case_path: "testcases_1_3.json",
    test_result: "[100000,200000]",
    threshold_ms: 3000,
    is_large_case: 1
  },
  {
    id: 5,
    question_id: 2,
    test_case_path: "testcases_2_0.json",
    test_result: 0,
    threshold_ms: null,
    is_large_case: 0
  },
  {
    id: 6,
    question_id: 2,
    test_case_path: "testcases_2_1.json",
    test_result: 1,
    threshold_ms: null,
    is_large_case: 0
  },
  {
    id: 7,
    question_id: 2,
    test_case_path: "testcases_2_2.json",
    test_result: 2,
    threshold_ms: null,
    is_large_case: 0
  },
  {
    id: 8,
    question_id: 2,
    test_case_path: "testcases_2_3.json",
    test_result: 300000,
    threshold_ms: 300,
    is_large_case: 1
  }
];

module.exports = {
  user_table,
  match_table,
  match_detail,
  level_table,
  question,
  test
};
