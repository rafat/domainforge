// src/utils/tokenIdUtils.ts
// Utility functions for handling and validating token IDs

/**
 * Checks if a token ID appears to be shortened/mutated
 * @param tokenId The token ID to check
 * @returns boolean indicating if the token ID is likely shortened
 */
export function isLikelyShortenedTokenId(tokenId: string): boolean {
  if (!tokenId) return false;
  
  // Check if it contains letters (indicating base32 encoding or similar)
  // But doesn't start with 0x (which would indicate a proper hex format)
  // And is suspiciously short for a numeric token ID (should be 70+ characters for large numbers)
  return Boolean(
    tokenId.match(/[a-z]/i) && 
    !tokenId.match(/^0x/) && 
    tokenId.length < 70
  );
}

/**
 * Validates if a token ID appears to be in the correct full format
 * @param tokenId The token ID to validate
 * @returns boolean indicating if the token ID appears valid
 */
export function isValidFullTokenId(tokenId: string): boolean {
  if (!tokenId) return false;
  
  // A valid full token ID should either:
  // 1. Be a long numeric string (70+ characters)
  // 2. Be a proper hex string starting with 0x
  const isLongNumeric = tokenId.length >= 70;
  const isHex = !!tokenId.match(/^0x[0-9a-fA-F]+$/);
  return isLongNumeric || isHex;
}

/**
 * Formats a token ID for display, truncating if it's too long
 * @param tokenId The token ID to format
 * @param maxLength Maximum length before truncation (default: 20)
 * @returns Formatted token ID string
 */
export function formatTokenIdDisplay(tokenId: string, maxLength: number = 20): string {
  if (!tokenId) return 'N/A';
  
  if (tokenId.length <= maxLength) {
    return tokenId;
  }
  
  // For very long token IDs, show first 8 and last 8 characters
  if (tokenId.length > 40) {
    return `${tokenId.slice(0, 8)}...${tokenId.slice(-8)}`;
  }
  
  // For moderately long token IDs, show first 10 and last 6 characters
  return `${tokenId.slice(0, 10)}...${tokenId.slice(-6)}`;
}

// Helper function to format price from Wei to ETH
export function formatWeiToEth(weiValue: string | number | undefined | null): string {
  if (!weiValue) return '0';
  
  const weiStr = weiValue.toString();
  
  // Check if this looks like a Wei value (large integer string)
  if (weiStr.length > 10 && !weiStr.includes('.')) {
    // Convert from Wei to ETH (1 ETH = 10^18 Wei)
    try {
      const weiBig = BigInt(weiStr);
      const ethValue = Number(weiBig) / 1e18;
      
      // Format to up to 6 decimal places, removing trailing zeros
      return parseFloat(ethValue.toFixed(6)).toString();
    } catch (e) {
      // If BigInt conversion fails, return the original value
      return weiStr;
    }
  }
  
  // If it already looks like an ETH value, return as is but format consistently
  const numValue = parseFloat(weiStr);
  if (!isNaN(numValue)) {
    // Format to up to 6 decimal places, removing trailing zeros
    return parseFloat(numValue.toFixed(6)).toString();
  }
  
  // If it's not a valid number, return as is
  return weiStr;
}