import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateEmail,
} from '@/lib/utils';

describe('Utils', () => {
  describe('hashPassword', () => {
    it('パスワードをハッシュ化できる', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
      // bcryptハッシュは$2a$、$2b$、$2y$で始まる
      expect(hashed).toMatch(/^\$2[aby]\$/);
    });

    it('同じパスワードでも異なるハッシュを生成する', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('正しいパスワードを検証できる', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('間違ったパスワードを拒否する', async () => {
      const correctPassword = 'testpassword123';
      const hashed = await hashPassword(correctPassword);
      
      const isValid = await verifyPassword('wrongpassword', hashed);
      
      expect(isValid).toBe(false);
    });

    it('空のパスワードを拒否する', async () => {
      const hashed = await hashPassword('password');
      
      const isValid = await verifyPassword('', hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('8文字以上のパスワードを検証できる', () => {
      expect(validatePassword('password')).toBe(true);
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('password123')).toBe(true);
    });

    it('8文字未満のパスワードを拒否する', () => {
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('pass')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('有効なメールアドレスを検証できる', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('user123@test-domain.com')).toBe(true);
    });

    it('無効なメールアドレスを拒否する', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@tld')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('nodomain@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('spaces in@email.com')).toBe(false);
    });
  });
});

