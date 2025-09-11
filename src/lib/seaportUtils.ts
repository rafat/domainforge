// src/lib/seaportUtils.ts
import { parseEther } from 'viem'

/**
 * Creates a Seaport order structure for domain listing
 * This function ensures consistency between frontend signing and backend submission
 */
export function createSeaportOrderParameters(params: {
  sellerAddress: string;
  contractAddress: string;
  tokenId: string;
  price: string;
  startTime?: string;  // Optional, if provided use this instead of generating
  endTime?: string;    // Optional, if provided use this instead of generating
}) {
  const { sellerAddress, contractAddress, tokenId, price, startTime, endTime } = params;
  
  // Convert price to wei
  const priceInWei = parseEther(price.toString());
  
  // Use provided timestamps or generate new ones
  const currentTime = startTime ? parseInt(startTime) : Math.floor(Date.now() / 1000);
  const oneHundredEightyDaysFromNow = endTime ? parseInt(endTime) : currentTime + 180 * 24 * 60 * 60; // 180 days in seconds
  
  return {
    offerer: sellerAddress,
    zone: "0x0000000000000000000000000000000000000000",
    orderType: 2, // FULL_RESTRICTED
    startTime: currentTime.toString(),
    endTime: oneHundredEightyDaysFromNow.toString(),
    zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt: "0",
    conduitKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
    counter: "0",
    offer: [
      {
        itemType: 2, // ERC721
        token: contractAddress || "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: tokenId,
        startAmount: "1",
        endAmount: "1"
      }
    ],
    consideration: [
      {
        itemType: 0, // NATIVE (ETH)
        token: "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: "0",
        startAmount: priceInWei.toString(),
        endAmount: priceInWei.toString(),
        recipient: sellerAddress
      }
    ],
    totalOriginalConsiderationItems: 1
  };
}

/**
 * Creates EIP-712 types structure for Seaport order signing
 */
export function createSeaportEip712Types() {
  return {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ],
    OrderComponents: [
      { name: 'offerer', type: 'address' },
      { name: 'zone', type: 'address' },
      { name: 'offer', type: 'OfferItem[]' },
      { name: 'consideration', type: 'ConsiderationItem[]' },
      { name: 'orderType', type: 'uint8' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'zoneHash', type: 'bytes32' },
      { name: 'salt', type: 'uint256' },
      { name: 'conduitKey', type: 'bytes32' },
      { name: 'counter', type: 'uint256' }
    ],
    OfferItem: [
      { name: 'itemType', type: 'uint8' },
      { name: 'token', type: 'address' },
      { name: 'identifierOrCriteria', type: 'uint256' },
      { name: 'startAmount', type: 'uint256' },
      { name: 'endAmount', type: 'uint256' }
    ],
    ConsiderationItem: [
      { name: 'itemType', type: 'uint8' },
      { name: 'token', type: 'address' },
      { name: 'identifierOrCriteria', type: 'uint256' },
      { name: 'startAmount', type: 'uint256' },
      { name: 'endAmount', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ]
  };
}