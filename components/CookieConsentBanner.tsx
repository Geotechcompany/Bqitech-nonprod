"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

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
  const [cookiePolicy, setCookiePolicy] = useState<CookiePolicyData>({
    essential: {
      required: true,
      description: "Required for the website to function properly, including authentication and security features",
      duration: "Session"
    },
    functional: {
      required: false,
      description: "Remember your preferences and settings to enhance your experience",
      duration: "1 year"
    },
    analytics: {
      required: false,
      description: "Help us understand how visitors use our website",
      duration: "2 years"
    },
    application: {
      required: false,
      description: "Maintain your application status and progress",
      duration: "30 days"
    }
  })
  const [isVisible, setIsVisible] = useState(false)

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
          // Show banner if we can't check consent
          setIsVisible(true);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setConsent(data);
        
        // Update cookie policy if available from API
        if (data.cookiePolicy) {
          setCookiePolicy(data.cookiePolicy);
        }
        
        // Show banner only if user hasn't made a choice
        setIsVisible(!data.hasConsent && data.hasConsent !== false);
      } catch (error) {
        console.error('Failed to check cookie consent:', error);
        // Show banner on error
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsent();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAgreeAndProceed = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';
      const response = await fetch(`${baseUrl}/api/cookie-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consent: true,
          essential: true,
          functional: true,
          analytics: true,
          application: true
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save cookie preferences');
      }

      setConsent({
        hasConsent: true,
        preferences: defaultPreferences
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      // Still hide banner and set consent in local state even if server save fails
      setConsent({
        hasConsent: true,
        preferences: defaultPreferences
      });
      setIsVisible(false);
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
          essential: true,
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
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to set cookie consent:', error);
      // Still hide banner even on error
      setIsVisible(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';
      const response = await fetch(`${baseUrl}/api/cookie-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consent: true,
          essential: preferences.essential,
          functional: preferences.functional,
          analytics: preferences.analytics,
          application: preferences.application
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save cookie preferences');
      }

      setConsent({
        hasConsent: true,
        preferences: preferences
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      // Still hide banner and set consent in local state even if server save fails
      setConsent({
        hasConsent: true,
        preferences: preferences
      });
      setIsVisible(false);
    }
  };

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

  // Don't render if loading or not visible
  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Image src="/bqilogo.png" alt="BQI Tech Logo" width={40} height={40} />
            <h2 className="text-xl sm:text-2xl font-bold text-blue-600 ml-2">WE VALUE YOUR PRIVACY</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="Close cookie banner"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-700 mb-4 text-sm sm:text-base">
          This site uses cookies and related technologies, as described in our privacy policy, for purposes that may include site operation, analytics, enhanced
          user experience, or advertising. You may choose to consent to our use of these technologies, or manage your own preferences.
        </p>
        
        {showPreferences && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-4">Cookie Preferences</h3>
            <div className="space-y-4">
              {Object.entries(cookiePolicy).map(([type, policy]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="font-medium capitalize">{type} Cookies</p>
                    <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Duration: {policy.duration}</p>
                  </div>
                  <Switch
                    checked={preferences[type as keyof CookiePreferences]}
                    onCheckedChange={() => handlePreferenceChange(type as keyof CookiePreferences)}
                    disabled={policy.required}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleSavePreferences}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
          <button 
            onClick={handleManageChoices}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded font-bold text-black hover:bg-gray-100 transition-colors"
          >
            {showPreferences ? 'Hide' : 'Manage'} Choices
            <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showPreferences ? 'rotate-180' : ''}`} />
          </button>
          <button 
            onClick={handleRejectAll}
            className="px-4 py-2 border border-gray-300 rounded font-bold text-black hover:bg-gray-100 transition-colors"
          >
            Reject All
          </button>
          <button 
            onClick={handleAgreeAndProceed}
            className="px-4 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600 transition-colors"
          >
            Accept All
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
          <div>
            <Link href="/about/cookie-policy" className="hover:underline transition-colors">
              Privacy & Cookie Policy
            </Link>
          </div>
          <div>Powered by BQI Tech</div>
        </div>
      </div>
    </div>
  )
}
