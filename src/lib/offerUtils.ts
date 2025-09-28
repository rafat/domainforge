// src/lib/offerUtils.ts
import { parseEther } from 'viem'

/**
 * Creates a Seaport order structure for domain offers
 * This function ensures consistency between frontend and backend for offer creation
 */
export function createSeaportOfferParameters(params: {
  offererAddress: string;
  contractAddress: string;
  tokenId: string;
  price: string;
  startTime?: string;  // Optional, if provided use this instead of generating
  endTime?: string;    // Optional, if provided use this instead of generating
}) {
  const { offererAddress, contractAddress, tokenId, price, startTime, endTime } = params;
  
  // Convert price to wei
  const priceInWei = parseEther(price.toString());
  
  // Use provided timestamps or generate new ones
  const currentTime = startTime ? parseInt(startTime) : Math.floor(Date.now() / 1000);
  // Default to 30 days from now for offers
  const thirtyDaysFromNow = endTime ? parseInt(endTime) : currentTime + 30 * 24 * 60 * 60; // 30 days in seconds
  
  return {
    offerer: offererAddress,
    zone: "0x0000000000000000000000000000000000000000",
    orderType: 0, // FULL_OPEN
    startTime: currentTime.toString(),
    endTime: thirtyDaysFromNow.toString(),
    zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt: Math.floor(Math.random() * 1000000000000000000).toString(), // Random salt
    conduitKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
    counter: "0",
    offer: [
      {
        itemType: 0, // NATIVE (ETH)
        token: "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: "0",
        startAmount: priceInWei.toString(),
        endAmount: priceInWei.toString()
      }
    ],
    consideration: [
      {
        itemType: 2, // ERC721
        token: contractAddress || "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: tokenId,
        startAmount: "1",
        endAmount: "1",
        recipient: offererAddress
      }
    ],
    totalOriginalConsiderationItems: 1
  };
}

/**
 * Creates EIP-712 types structure for Seaport offer signing
 */
export function createSeaportOfferEip712Types() {
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