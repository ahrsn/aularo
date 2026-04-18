"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createSlideshow } from "@/lib/actions";

export function NewSlideshowButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon="plus"
      disabled={pending}
      onClick={() => {
        const name = window.prompt("Slideshow name?");
        if (!name) return;
        startTransition(async () => {
          await createSlideshow({ name });
          router.refresh();
        });
      }}
    >
      New slideshow
    </Button>
  );
}
