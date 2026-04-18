"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createSlideshow } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";

export function NewSlideshowButton() {
  const router = useRouter();
  const toast = useToast();
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
          try {
            await createSlideshow({ name });
            router.refresh();
            toast.success("Slideshow created");
          } catch (e) {
            toast.error(e, "Couldn't create slideshow.");
          }
        });
      }}
    >
      New slideshow
    </Button>
  );
}
