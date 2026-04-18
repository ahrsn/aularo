"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";

const qs = [
  {
    q: "What hardware do I need?",
    a: "Anything with a browser. A cheap TV with a streaming stick, a kiosk PC, a spare laptop — all work. Pair it with a short code at clarra.show/screen.",
  },
  {
    q: "What happens if the display loses internet?",
    a: "It keeps playing the last loop it had. When it reconnects, Clarra quietly catches up with any changes.",
  },
  {
    q: "Can multiple people on my team edit at once?",
    a: "Yes. Roles are split between producers (who can edit) and venue staff (who can pause and resume). Every change is attributed in the audit log.",
  },
  {
    q: "Do you support vertical displays and video walls?",
    a: "Portrait orientation is supported on every plan. Video wall layouts are available on Venue.",
  },
  {
    q: "How fast do edits reach the screen?",
    a: "Under two seconds in the normal case. Hard cuts take longer only if you're uploading large media alongside the edit.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto" style={{ maxWidth: 820 }}>
        <Eyebrow className="mb-[10px] text-center">Questions</Eyebrow>
        <h2
          className="mx-auto text-center font-serif text-[30px] leading-[1.15] md:text-[40px] md:leading-[1.1]"
          style={{
            letterSpacing: "-0.026em",
            fontWeight: 400,
            color: "#0E1410",
            margin: "0 0 32px",
            fontVariationSettings: "'opsz' 72",
            textWrap: "balance",
          }}
        >
          Before you ask.
        </h2>
        <div className="border-t border-line">
          {qs.map((item, i) => (
            <div
              key={item.q}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="cursor-pointer border-b border-line"
              style={{ padding: "18px 4px" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  className="font-serif text-[17px] leading-[1.3] md:text-[20px] md:leading-normal"
                  style={{
                    fontWeight: 500,
                    color: "#0E1410",
                    letterSpacing: "-0.016em",
                    fontVariationSettings: "'opsz' 48",
                  }}
                >
                  {item.q}
                </div>
                <Icon
                  name={open === i ? "minus" : "plus"}
                  size={16}
                  style={{ color: "#6B7268" }}
                />
              </div>
              {open === i && (
                <div
                  className="mt-[10px] text-[14.5px] leading-[1.6] text-muted"
                  style={{
                    maxWidth: 680,
                    letterSpacing: "-0.005em",
                    textWrap: "pretty",
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
