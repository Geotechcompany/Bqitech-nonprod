import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 mt-16 sm:mt-32 mb-8 sm:mb-16 text-center bg-white shadow-lg rounded-lg">
      <div>
        <CheckCircle className="w-16 h-16 sm:w-24 sm:h-24 text-green-500 mx-auto mb-4 sm:mb-8" />
      </div>

      <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-gray-800">
        Thank You!
      </h1>

      <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-8">
        Your message has been sent successfully. We will get back to you soon.
      </p>

      <Link href="/contact-us" className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-[#36C9FD] text-white font-semibold rounded-lg shadow-md hover:bg-[#272055] transition duration-300">
        Return to Contact Us
      </Link>
    </div>
  );
}
