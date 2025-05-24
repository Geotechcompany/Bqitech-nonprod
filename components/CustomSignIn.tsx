"use client"

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";

export default function CustomSignIn() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .clerk-modal {
        background-color: #ffffff; /* White background */
        border-radius: 8px; /* Rounded corners */
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Soft shadow */
      }
      .clerk-modal h1 {
        color: #4F46E5; /* Match site logo color */
      }
      .clerk-modal .clerk-button {
        background-color: #4F46E5; /* Match site logo color */
        color: white; /* White text */
        border-radius: 4px; /* Rounded corners */
      }
      .clerk-modal .clerk-button:hover {
        background-color: #4338ca; /* Darker shade on hover */
      }
      .clerk-modal .clerk-footer {
        display: none; /* Hide the footer */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          // Customize the appearance here
          footer: { display: "none" }, // Hide the footer
        },
      }}
    />
  );
}