import { generateToken, verifyToken } from '../src/utils/jwt';

describe('JWT utilities', () => {
  it('embeds tokenVersion and verifies payload', () => {
    const payload = {
      id: 1,
      userId: 1,
      username: 'alice',
      email: 'alice@example.com',
      role: 'user',
      tokenVersion: 2,
    };

    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.tokenVersion).toBe(payload.tokenVersion);
    expect(decoded.username).toBe(payload.username);
  });
});
