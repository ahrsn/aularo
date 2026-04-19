"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PromptDialog } from "@/components/ui/alert-dialog";
import { createSlideshow } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";

export function NewSlideshowButton() {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function onConfirm(name: string) {
    setOpen(false);
    startTransition(async () => {
      try {
        await createSlideshow({ name });
        router.refresh();
        toast.success("Slideshow created");
      } catch (e) {
        toast.error(e, "Couldn't create slideshow.");
      }
    });
  }

  return (
    <>
      <Button
        variant="primary"
        icon="plus"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        New slideshow
      </Button>
      <PromptDialog
        open={open}
        title="New slideshow"
        description="Give it a name to get started."
        placeholder="Slideshow name"
        confirmLabel="Create"
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
