// src/lib/pinata.ts
interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export class PinataService {
  private apiKey: string
  private secretKey: string
  private baseUrl = 'https://api.pinata.cloud'

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey
    this.secretKey = secretKey
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey
    }
  }

  async pinJSON(data: any, name?: string): Promise<string> {
    const body = {
      pinataContent: data,
      pinataMetadata: {
        name: name || `domain-metadata-${Date.now()}`
      }
    }

    const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Failed to pin JSON: ${response.statusText}`)
    }

    const result: PinataResponse = await response.json()
    return result.IpfsHash
  }

  async pinFile(file: File, name?: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (name) {
      formData.append('pinataMetadata', JSON.stringify({
        name
      }))
    }

    const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to pin file: ${response.statusText}`)
    }

    const result: PinataResponse = await response.json()
    return result.IpfsHash
  }

  async pinHTML(htmlContent: string, name?: string): Promise<string> {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const file = new File([blob], `${name || 'index'}.html`, { type: 'text/html' })
    return this.pinFile(file, name)
  }

  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }

  async unpin(hash: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to unpin: ${response.statusText}`)
    }
  }

  async listPinned(limit = 10, offset = 0): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/data/pinList?pageLimit=${limit}&pageOffset=${offset}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to list pinned files: ${response.statusText}`)
    }

    const result = await response.json()
    return result.rows || []
  }
}

// Create singleton instance
export const pinataService = new PinataService(
  process.env.NEXT_PUBLIC_PINATA_API_KEY!,
  process.env.PINATA_SECRET_KEY!
)
