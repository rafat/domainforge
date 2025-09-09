// src/utils/tokenIdUtils.test.ts
import { isLikelyShortenedTokenId, isValidFullTokenId, formatTokenIdDisplay } from './tokenIdUtils';

describe('tokenIdUtils', () => {
  describe('isLikelyShortenedTokenId', () => {
    it('should detect shortened token IDs', () => {
      // Shortened token ID examples
      expect(isLikelyShortenedTokenId('ed3q3wnqpmfbt2rix')).toBe(true);
      expect(isLikelyShortenedTokenId('abc123xyz')).toBe(true);
      
      // Full token IDs should not be detected as shortened
      expect(isLikelyShortenedTokenId('66000548733257909498078276909066599866840390563859996912928568865638437021019')).toBe(false);
      expect(isLikelyShortenedTokenId('0x1234567890123456789012345678901234567890')).toBe(false);
      
      // Edge cases
      expect(isLikelyShortenedTokenId('')).toBe(false);
      expect(isLikelyShortenedTokenId(null as any)).toBe(false);
      expect(isLikelyShortenedTokenId(undefined as any)).toBe(false);
    });
  });

  describe('isValidFullTokenId', () => {
    it('should validate full token IDs', () => {
      // Valid full token IDs
      expect(isValidFullTokenId('66000548733257909498078276909066599866840390563859996912928568865638437021019')).toBe(true);
      expect(isValidFullTokenId('0x1234567890123456789012345678901234567890')).toBe(true);
      
      // Invalid/short token IDs
      expect(isValidFullTokenId('ed3q3wnqpmfbt2rix')).toBe(false);
      expect(isValidFullTokenId('abc123xyz')).toBe(false);
      
      // Edge cases
      expect(isValidFullTokenId('')).toBe(false);
      expect(isValidFullTokenId(null as any)).toBe(false);
      expect(isValidFullTokenId(undefined as any)).toBe(false);
    });
  });

  describe('formatTokenIdDisplay', () => {
    it('should format token IDs for display', () => {
      // Short token IDs should remain unchanged
      expect(formatTokenIdDisplay('12345')).toBe('12345');
      
      // Medium length token IDs should be truncated
      expect(formatTokenIdDisplay('123456789012345678901234567890')).toBe('1234567890...67890');
      
      // Very long token IDs should be truncated with different pattern
      const longTokenId = '66000548733257909498078276909066599866840390563859996912928568865638437021019';
      expect(formatTokenIdDisplay(longTokenId)).toBe('66000548...8437021019');
      
      // Edge cases
      expect(formatTokenIdDisplay('')).toBe('N/A');
      expect(formatTokenIdDisplay(null as any)).toBe('N/A');
      expect(formatTokenIdDisplay(undefined as any)).toBe('N/A');
    });
  });
});