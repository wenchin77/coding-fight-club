const {getMatchKey} = require('../util/socket');
const assert = require('assert');

describe('getMatchKey', () => {
  test('should return 123', () => {
    assert.deepEqual(getMatchKey('/match/123'),123);
  })
});
