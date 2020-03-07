const { getMatchKey, getStranger } = require('../util/match');

describe('getMatchKey', () => {
  test('should return 123', () => {
    expect(getMatchKey('/match/123')).toBe('123');
  })
});

describe('getStranger', () => {
  test('should return stranger id', () => {
    expect(getStranger(1, new Set([1,2]))).toBe(2);
  });
  test('should return false', () => {
    expect(getStranger(1, new Set([1]))).toBe(false);
  })
});
