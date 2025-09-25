'use client'

import { useState } from 'react'

interface TokenIdDisplayProps {
  tokenId: string | number
}

export default function TokenIdDisplay({ tokenId }: TokenIdDisplayProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const idStr = String(tokenId)
  const truncated = idStr.length > 12 ? `${idStr.slice(0, 6)}…${idStr.slice(-6)}` : idStr

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(idStr)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <span
        className="font-mono text-sm text-gray-900"
        title={idStr} /* shows full id on hover */
        aria-label={`Token ID ${idStr}`}
      >
        #{expanded ? idStr : truncated}
      </span>

      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {expanded ? 'Hide' : 'Show'}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}