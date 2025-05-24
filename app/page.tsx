import { auth } from "@clerk/nextjs/server";
import ClientHomePage from "@/components/ClientHomePage";
import { ChatbotWidget } from "@/components/ChatbotWidget";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <>
      <ClientHomePage userId={userId} />
      <ChatbotWidget />
    </>
  );
}

export const metadata = {
  title: 'BQI Tech - Innovating for a Better World',
  description: 'BQI Tech provides innovative technology solutions and professional services to help government agencies succeed in their digital transformation journey.',
  keywords: ['government technology', 'digital transformation', 'IT solutions', 'professional services'],
  alternates: {
    canonical: 'https://bqitech.com'
  }
}
