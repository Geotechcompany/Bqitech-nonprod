"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileMenuToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-40"
      onClick={onClick}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
} 