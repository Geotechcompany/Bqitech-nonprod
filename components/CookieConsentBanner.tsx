"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { publicApi } from '@/lib/api-backend'

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
  application: boolean
}

interface CookiePolicy {
  required: boolean
  description: string
  duration: string
}

interface CookiePolicyData {
  [key: string]: CookiePolicy
}

interface CookieConsent {
  hasConsent: boolean;
  preferences: {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    application: boolean;
  };
}

const defaultPreferences = {
  essential: true,
  functional: true,
  analytics: true,
  application: true
};

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    functional: false,
    analytics: false,
    application: false
  })
  const [cookiePolicy, setCookiePolicy] = useState<CookiePolicyData>({})

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/cookie-consent`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          console.warn('Cookie consent check failed:', response.status);
          return;
        }

        const data = await response.json();
        setConsent(data);
      } catch (error) {
        console.error('Failed to check cookie consent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsent();
  }, []);

  const handleAccept = async (preferences: CookieConsent['preferences']) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/cookie-consent`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          consent: true,
          ...preferences
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setConsent(data.consent);
    } catch (error) {
      console.error('Failed to update cookie consent:', error);
    }
  };

  if (isLoading || consent?.hasConsent) {
    return null;
  }

  const handleManageChoices = () => {
    setShowPreferences(!showPreferences)
  }

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return // Cannot change essential cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handleAgreeAndProceed = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';
      const response = await fetch(`${baseUrl}/api/cookie-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultPreferences),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save cookie preferences');
      }

      setConsent({
        hasConsent: true,
        preferences: defaultPreferences
      });
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      // Still set consent in local state even if server save fails
      setConsent({
        hasConsent: true,
        preferences: defaultPreferences
      });
    }
  };

  const handleRejectAll = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';
      const response = await fetch(`${baseUrl}/api/cookie-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: false,
          functional: false,
          analytics: false,
          application: false
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save cookie preferences');
      }

      setConsent({
        hasConsent: false,
        preferences: {
          essential: true,
          functional: false,
          analytics: false,
          application: false
        }
      });
    } catch (error) {
      console.error('Failed to set cookie consent:', error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Image src="/bqilogo.png" alt="BQI Tech Logo" width={40} height={40} />
            <h2 className="text-2xl font-bold text-blue-600 ml-2">WE VALUE YOUR PRIVACY</h2>
          </div>
          <button onClick={() => setConsent(null)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          This site uses cookies and related technologies, as described in our privacy policy, for purposes that may include site operation, analytics, enhanced
          user experience, or advertising. You may choose to consent to our use of these technologies, or manage your own preferences.
        </p>
        
        {showPreferences && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-4">Cookie Preferences</h3>
            <div className="space-y-4">
              {Object.entries(cookiePolicy).map(([type, policy]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{type} Cookies</p>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                    <p className="text-xs text-gray-500">Duration: {policy.duration}</p>
                  </div>
                  <Switch
                    checked={preferences[type as keyof CookiePreferences]}
                    onCheckedChange={() => handlePreferenceChange(type as keyof CookiePreferences)}
                    disabled={policy.required}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mb-4">
          <button 
            onClick={handleManageChoices}
            className="flex items-center px-4 py-2 border border-gray-300 rounded font-bold text-black hover:bg-gray-100"
          >
            Manage Choices
            <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showPreferences ? 'rotate-180' : ''}`} />
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
            <Link href="/about/cookie-policy" className="hover:underline">Privacy & Cookie Policy</Link>
          </div>
          <div>Powered by BQI</div>
        </div>
      </div>
    </div>
  )
}
