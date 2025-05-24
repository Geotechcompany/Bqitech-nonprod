import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkConsent = async () => {
      const response = await fetch('/api/cookie-consent')
      const { hasConsent } = await response.json()
      setIsVisible(!hasConsent)
    }
    checkConsent()
  }, [])

  if (!isVisible) return null

  const handleManageChoices = () => {
    console.log('Manage choices clicked')
  }

  const handleAgreeAndProceed = async () => {
    try {
      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true }),
      })
      setIsVisible(false)
    } catch (error) {
      console.error('Failed to set cookie consent:', error)
    }
  }

  const handleRejectAll = async () => {
    try {
      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: false }),
      })
      setIsVisible(false)
    } catch (error) {
      console.error('Failed to set cookie consent:', error)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Image src="/bqilogo.png" alt="BQI Tech Logo" width={40} height={40} />
            <h2 className="text-2xl font-bold text-blue-600 ml-2">WE VALUE YOUR PRIVACY</h2>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          This site uses cookies and related technologies, as described in our privacy policy, for purposes that may include site operation, analytics, enhanced
          user experience, or advertising. You may choose to consent to our use of these technologies, or manage your own preferences.
        </p>
        <div className="flex justify-end space-x-4 mb-4">
          <button 
            onClick={handleManageChoices}
            className="px-4 py-2 border border-gray-300 rounded font-bold text-black hover:bg-gray-100"
          >
            Manage Choices
          </button>
          <button 
            onClick={handleAgreeAndProceed}
            className="px-4 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600"
          >
            Agree & Proceed
          </button>
          <button 
            onClick={handleRejectAll}
            className="px-4 py-2 border border-gray-300 rounded font-bold text-black hover:bg-gray-100"
          >
            Reject All
          </button>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            <Link href="/privacy-policy" className="hover:underline">Privacy & Cookie Policy</Link>
            {' | '}
            <Link href="/tracker-details" className="hover:underline">Tracker Details</Link>
          </div>
          <div>Powered by BQI</div>
        </div>
      </div>
    </div>
  )
}
