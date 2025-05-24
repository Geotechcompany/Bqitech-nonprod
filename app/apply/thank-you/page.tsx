import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-semibold mb-4">Thank You for Your Application!</h1>
      <p className="mb-6">We have received your application and will review it shortly. We'll be in touch if we need any additional information or to schedule an interview.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  );
}
