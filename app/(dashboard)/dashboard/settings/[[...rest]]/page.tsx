// app/dashboard/settings/page.tsx
"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Account Settings 
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your professional account preferences and security settings
        </p>
      </header>

      <div className="">
        <UserProfile
          appearance={{
            variables: {
              colorPrimary: "#3b82f6",
              colorTextOnPrimaryBackground: "#fff",
              colorTextSecondary: "#64748b",
              colorBackground: "transparent",
              colorInputBackground: "#f8fafc",
              colorInputText: "#0f172a",
              colorDanger: "#ef4444",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full font-sans [&_div]:last-child:hidden",
              card: "bg-transparent shadow-none border-0 p-0",
              navbar: "hidden",
              navbarButton: "hidden",
              pageScrollBox: "p-6 [&_div]:last-child:hidden",
              headerTitle: "text-2xl font-bold text-gray-900 dark:text-gray-100",
              headerSubtitle: "text-gray-500 dark:text-gray-400 mt-1",
              profileSectionTitle: "text-lg font-semibold text-gray-800 dark:text-gray-200",
              profileSectionContent: "space-y-4",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors",
              formButtonReset:
                "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 font-medium px-4 py-2.5 rounded-lg transition-colors",
              formFieldInput:
                "rounded-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800/30 dark:text-gray-100 h-11",
              formFieldLabel: "font-medium text-gray-700 dark:text-gray-300 mb-1.5",
              accordionTriggerButton: "hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-3",
              avatarBox: "w-14 h-14 border-2 border-white dark:border-gray-800 shadow-sm",
              badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
              footer: "hidden",
              footerActionText: "hidden",
              footerActionLink: "hidden",
            },
          }}
        />
      </div>
         {/* Additional styles to hide elements on mobile */}
         <style jsx>{`
        @media (max-width: 768px) {
          .cl-powered-by, .cl-development-mode {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
