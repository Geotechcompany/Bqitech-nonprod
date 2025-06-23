import ClientHomePage from "@/components/ClientHomePage";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import CookieConsentBanner from '@/components/CookieConsentBanner';

export default async function HomePage() {
  return (
    <>
      <ClientHomePage />
      <ChatbotWidget />
      <CookieConsentBanner />
    </>
  );
}


