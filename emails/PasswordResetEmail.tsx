interface Props {
  resetToken: string;
}

export default function PasswordResetEmail({ resetToken }: Props) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Request</h1>
      <p className="text-gray-600 mb-4">
        We received a request to reset your password. Click the link below to proceed:
      </p>
      <a
        href={resetLink}
        className="inline-block bg-[#31CDFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#31CDFF]/90 transition-colors"
      >
        Reset Password
      </a>
      <p className="text-gray-600 mt-6 text-sm">
        If you didn't request this password reset, you can safely ignore this email.
      </p>
    </div>
  );
} 