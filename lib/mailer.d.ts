declare module '@/lib/mailer' {
  export function sendVerificationEmail(email: string, token: string): Promise<void>;
} 