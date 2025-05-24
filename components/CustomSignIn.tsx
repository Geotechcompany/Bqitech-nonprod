"use client"

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function CustomSignIn() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .signin-container {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 400px;
        width: 100%;
      }
      .signin-container h1 {
        color: #4F46E5;
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .signin-container button {
        background-color: #4F46E5;
        color: white;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        width: 100%;
        margin: 0.5rem 0;
        border: none;
        cursor: pointer;
      }
      .signin-container button:hover {
        background-color: #4338ca;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="signin-container">
      <h1>Sign In</h1>
      <button onClick={() => signIn()}>
        Sign in with Email
      </button>
    </div>
  );
}