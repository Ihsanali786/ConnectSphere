import { escapeRegex } from '../utils/escapeRegex.js';
import { hashToken, generateSecureToken } from '../utils/tokens.js';

describe('Utils', () => {
  it('escapes special regex characters', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
    expect(escapeRegex('test(user)')).toBe('test\\(user\\)');
  });
});

describe('tokens', () => {
  it('hashes tokens consistently', () => {
    const raw = 'my-token';
    expect(hashToken(raw)).toBe(hashToken(raw));
    expect(hashToken(raw)).not.toBe(raw);
  });

  it('generates unique secure tokens', () => {
    expect(generateSecureToken()).not.toBe(generateSecureToken());
  });
});
