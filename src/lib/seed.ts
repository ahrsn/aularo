import { randomUUID } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import type {
  Automation,
  Display,
  EventDoc,
  MediaAsset,
  ScheduleBlock,
  Slide,
  Slideshow,
} from "./schema";

/**
 * Seeds mock data for Chaos Digital Office — one week of content across
 * events, slideshows, displays, schedule, media, and automations.
 * Idempotent: wipes any existing `seed: true` docs before writing.
 */

const IMG = {
  lobby:     "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  boardroom: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80",
  kitchen:   "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80",
  studio:    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80",
  reception: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
  goodbye:   "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  client:    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
  openhouse: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
  birthday:  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1600&q=80",
  team:      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  workshop:  "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1600&q=80",
  hallway:   "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1600&q=80",
};

const photo = (img: string, title: string, caption?: string): Slide => ({
  id: randomUUID(),
  kind: "photo",
  data: { img, title, caption: caption ?? null },
});

const quote = (body: string, by: string): Slide => ({
  id: randomUUID(),
  kind: "quote",
  data: { quote: body, by },
});

const program = (eyebrow: string, title: string, items: string[]): Slide => ({
  id: randomUUID(),
  kind: "program",
  data: { eyebrow, title, items },
});

function mkSlideshow(
  partial: Pick<Slideshow, "id" | "name" | "eventId" | "status" | "slides"> &
    Partial<Slideshow>,
  now: number,
  uid: string,
): Slideshow & { seed: true } {
  return {
    id: partial.id,
    name: partial.name,
    eventId: partial.eventId ?? null,
    status: partial.status ?? "draft",
    slides: partial.slides,
    duration: partial.duration ?? 6500,
    shuffle: partial.shuffle ?? false,
    loop: partial.loop ?? true,
    transition: partial.transition ?? "fade",
    kenBurns: partial.kenBurns ?? true,
    theme: partial.theme ?? "dark",
    captions: partial.captions ?? true,
    publicSlug: partial.publicSlug ?? null,
    submissionSlug: partial.submissionSlug ?? null,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    updatedBy: partial.updatedBy ?? uid,
    seed: true,
  };
}

async function wipeSeed(db: Firestore, workspaceId: string) {
  const ws = db.collection("workspaces").doc(workspaceId);
  const collections = [
    "slideshows",
    "displays",
    "events",
    "schedule",
    "media",
    "automations",
  ] as const;
  for (const col of collections) {
    const snap = await ws.collection(col).where("seed", "==", true).get();
    const batches: FirebaseFirestore.WriteBatch[] = [];
    let current = ws.firestore.batch();
    let count = 0;
    for (const doc of snap.docs) {
      current.delete(doc.ref);
      count++;
      if (count % 400 === 0) {
        batches.push(current);
        current = ws.firestore.batch();
      }
    }
    batches.push(current);
    await Promise.all(batches.map((b) => b.commit()));
  }
}

export async function seedChaosOffice(
  db: Firestore,
  workspaceId: string,
  uid: string,
) {
  const ws = db.collection("workspaces").doc(workspaceId);

  await wipeSeed(db, workspaceId);

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  // Anchor to Monday of the current week (local time) so today is always in range.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay(); // 0=Sun..6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);
  const monday = mondayDate.getTime();
  const dayKey = (offset: number) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + offset);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // ── Events ────────────────────────────────────────────────────────
  const events: (EventDoc & { seed: true })[] = [
    {
      id: "seed-event-client-week",
      name: "Client Visit Week",
      startAt: monday,
      endAt: monday + 5 * DAY,
      timezone: "America/Chicago",
      colorTag: "#3B5A41",
      seed: true,
    },
    {
      id: "seed-event-all-hands",
      name: "Q2 All-Hands",
      startAt: monday + 9 * DAY,
      endAt: monday + 9 * DAY,
      timezone: "America/Chicago",
      colorTag: "#8B6B2F",
      seed: true,
    },
    {
      id: "seed-event-open-house",
      name: "Studio Open House",
      startAt: monday + 30 * DAY,
      endAt: monday + 30 * DAY,
      timezone: "America/Chicago",
      colorTag: "#6B5B8B",
      seed: true,
    },
  ];

  // ── Slideshows ────────────────────────────────────────────────────
  const slideshows: (Slideshow & { seed: true })[] = [
    mkSlideshow(
      {
        id: "seed-show-lobby-welcome",
        name: "Lobby — welcome loop",
        eventId: "seed-event-client-week",
        status: "live",
        slides: [
          photo(IMG.lobby, "Welcome to Chaos Digital", "5th floor · Studio"),
          photo(IMG.reception, "Make yourself at home", "Coffee & water to your left"),
          program("Today", "Who's visiting", [
            "09:30 — Acme Co. walkthrough",
            "11:00 — Northwind design review",
            "14:00 — Studio tour with Lumen Health",
          ]),
          quote("Design is how it works — not just how it looks.", "Studio ethos"),
          photo(IMG.team, "Meet the team", "Say hi at reception"),
        ],
        updatedBy: "Ahmaad",
        updatedAt: now - 2 * 60 * 1000,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-boardroom-agenda",
        name: "Boardroom — Acme rotation",
        eventId: "seed-event-client-week",
        status: "live",
        duration: 8000,
        slides: [
          photo(IMG.boardroom, "Acme Co. · Q2 Review", "Chaos Digital Office"),
          program("Agenda", "10:30 – 12:00", [
            "Brand refresh — case progress",
            "Campaign plan — spring",
            "Open questions",
            "Next steps & owners",
          ]),
          photo(IMG.workshop, "Working session", "Sticky notes encouraged"),
          quote("Clarity over cleverness.", "Chaos Digital"),
        ],
        updatedBy: "Ahmaad",
        updatedAt: now - 18 * 60 * 1000,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-kitchen",
        name: "Kitchen — menu & birthdays",
        eventId: "seed-event-client-week",
        status: "live",
        slides: [
          photo(IMG.kitchen, "What's on today", "Thursday, April 23"),
          program("Lunch", "From the kitchen", [
            "Roasted veg bowl",
            "Grain salad with tahini",
            "Chicken shawarma wrap",
            "Coffee bar open all day",
          ]),
          photo(IMG.birthday, "Happy birthday, Jules!", "Cake at 3:00pm in the lounge"),
        ],
        updatedBy: "Ahmaad",
        updatedAt: now - 55 * 60 * 1000,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-studio-b",
        name: "Studio B — project showcase",
        eventId: "seed-event-client-week",
        status: "live",
        slides: [
          photo(IMG.studio, "Studio B", "What we're making this week"),
          photo(IMG.workshop, "Northwind — brand system v2", "In progress"),
          photo(IMG.team, "Lumen Health — launch art", "Shipping Friday"),
          quote("Show the work. Then ship it.", "Studio principle"),
        ],
        updatedBy: "Mira",
        updatedAt: now - 3 * 60 * 60 * 1000,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-reception-hello",
        name: "Reception — morning hellos",
        eventId: "seed-event-client-week",
        status: "live",
        duration: 5000,
        slides: [
          photo(IMG.reception, "Good morning", "Chaos Digital Office"),
          photo(IMG.hallway, "Head up to the 5th floor", "Elevators on your right"),
          photo(IMG.team, "We're glad you're here", "Wi-Fi: ChaosGuest · ask for the password"),
        ],
        updatedBy: "Jules",
        updatedAt: now - 5 * 60 * 60 * 1000,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-goodnight",
        name: "After hours — goodbye loop",
        eventId: "seed-event-client-week",
        status: "paused",
        slides: [
          photo(IMG.goodbye, "Goodnight, Chaos Digital", "See you tomorrow"),
          quote("Rest is part of the work.", "Studio"),
        ],
        updatedBy: "Ahmaad",
        updatedAt: now - 2 * DAY,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-all-hands",
        name: "Q2 All-Hands — program",
        eventId: "seed-event-all-hands",
        status: "draft",
        slides: [
          photo(IMG.boardroom, "Q2 All-Hands", "Tuesday · 10:00am"),
          program("Run of show", "Ninety minutes", [
            "Q1 recap — what shipped",
            "Q2 bets & roadmap",
            "New hires & welcomes",
            "Open floor",
          ]),
          quote("Small team. Long memory. Big plans.", "Ahmaad"),
        ],
        updatedBy: "Ahmaad",
        updatedAt: now - 1 * DAY,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-hiring",
        name: "Open roles — now hiring",
        eventId: null,
        status: "draft",
        slides: [
          photo(IMG.team, "We're hiring", "Come build with us"),
          program("Open roles", "Chaos Digital", [
            "Senior product designer",
            "Full-stack engineer",
            "Producer, client services",
          ]),
          photo(IMG.hallway, "chaosdigital.studio/careers", "Scan the QR at reception"),
        ],
        updatedBy: "Mira",
        updatedAt: now - 3 * DAY,
      },
      now,
      uid,
    ),
    mkSlideshow(
      {
        id: "seed-show-open-house",
        name: "Open house — floor map",
        eventId: "seed-event-open-house",
        status: "draft",
        slides: [
          photo(IMG.openhouse, "Studio Open House", "May 20 · 6 – 9pm"),
          program("What's where", "5th floor", [
            "Reception — start here",
            "Studio A — brand work",
            "Studio B — motion & web",
            "Kitchen — drinks & snacks",
          ]),
        ],
        updatedBy: "Jules",
        updatedAt: now - 4 * DAY,
      },
      now,
      uid,
    ),
  ];

  // ── Displays ──────────────────────────────────────────────────────
  const displays: (Display & { seed: true })[] = [
    {
      id: "seed-display-lobby",
      name: "Lobby",
      room: "Ground floor · entrance",
      location: "Chaos Digital Office",
      status: "online",
      currentSlideshowId: "seed-show-lobby-welcome",
      screenId: "screen-lobby-001",
      pairedAt: now - 30 * DAY,
      lastHeartbeat: now - 3 * 1000,
      browserInfo: "Samsung QM · Chrome 120",
      shortCode: null,
      seed: true,
    },
    {
      id: "seed-display-boardroom",
      name: "Boardroom",
      room: "5th floor · conference",
      location: "Chaos Digital Office",
      status: "online",
      currentSlideshowId: "seed-show-boardroom-agenda",
      screenId: "screen-boardroom-001",
      pairedAt: now - 22 * DAY,
      lastHeartbeat: now - 2 * 1000,
      browserInfo: "LG UR · Chrome 120",
      shortCode: null,
      seed: true,
    },
    {
      id: "seed-display-kitchen",
      name: "Kitchen",
      room: "5th floor · breakroom",
      location: "Chaos Digital Office",
      status: "online",
      currentSlideshowId: "seed-show-kitchen",
      screenId: "screen-kitchen-001",
      pairedAt: now - 60 * DAY,
      lastHeartbeat: now - 5 * 1000,
      browserInfo: "Sony Bravia · Chrome 120",
      shortCode: null,
      seed: true,
    },
    {
      id: "seed-display-studio-b",
      name: "Studio B",
      room: "5th floor · creative",
      location: "Chaos Digital Office",
      status: "online",
      currentSlideshowId: "seed-show-studio-b",
      screenId: "screen-studio-b-001",
      pairedAt: now - 15 * DAY,
      lastHeartbeat: now - 4 * 1000,
      browserInfo: "Mac mini · Chrome 120",
      shortCode: null,
      seed: true,
    },
    {
      id: "seed-display-reception",
      name: "Reception desk",
      room: "5th floor · entry",
      location: "Chaos Digital Office",
      status: "online",
      currentSlideshowId: "seed-show-reception-hello",
      screenId: "screen-reception-001",
      pairedAt: now - 45 * DAY,
      lastHeartbeat: now - 1 * 1000,
      browserInfo: "iPad · Safari 17",
      shortCode: null,
      seed: true,
    },
    {
      id: "seed-display-phone-booth",
      name: "Phone booth",
      room: "5th floor · quiet room",
      location: "Chaos Digital Office",
      status: "offline",
      currentSlideshowId: null,
      screenId: "screen-phone-booth-001",
      pairedAt: now - 90 * DAY,
      lastHeartbeat: now - 34 * 60 * 1000,
      browserInfo: "Kiosk PC · Chrome 118",
      shortCode: null,
      seed: true,
    },
  ];

  // ── Schedule blocks (Mon–Fri, per display) ───────────────────────
  const scheduleBlocks: (ScheduleBlock & { seed: true })[] = [];
  const addBlock = (
    displayId: string,
    dayOffset: number,
    start: number,
    end: number,
    slideshowId: string | null,
    name: string,
    note?: string,
    automated = false,
  ) => {
    scheduleBlocks.push({
      id: randomUUID(),
      displayId,
      dayKey: dayKey(dayOffset),
      start,
      end,
      slideshowId,
      name,
      note: note ?? null,
      automated,
      createdBy: uid,
      createdAt: now,
      seed: true,
    });
  };

  // Seed Mon–Fri for this week AND next week so "today" always has content.
  for (const week of [0, 7]) {
    for (let d = 0; d < 5; d++) {
      const day = week + d;
      addBlock("seed-display-reception", day, 8, 10, "seed-show-reception-hello", "Morning hellos", "Doors open", true);
      addBlock("seed-display-lobby",     day, 8, 18, "seed-show-lobby-welcome",  "Welcome loop");
      addBlock("seed-display-kitchen",   day, 11, 14, "seed-show-kitchen",       "Lunch program");
      addBlock("seed-display-studio-b",  day, 10, 18, "seed-show-studio-b",      "Project showcase");
    }
    addBlock("seed-display-boardroom", week + 1, 10.5, 12, "seed-show-boardroom-agenda", "Acme Q2 Review");
    addBlock("seed-display-boardroom", week + 2, 14, 15.5, "seed-show-boardroom-agenda", "Northwind working session");
    addBlock("seed-display-boardroom", week + 3, 10, 11, "seed-show-boardroom-agenda", "Lumen design review");
    addBlock("seed-display-lobby",     week + 4, 18, 20, "seed-show-goodnight", "After-hours goodbye", "End of day", true);
  }
  // Weekend lobby loop for today/tomorrow if we're on a weekend.
  addBlock("seed-display-lobby", 5, 10, 16, "seed-show-lobby-welcome", "Weekend loop");
  addBlock("seed-display-lobby", 6, 10, 16, "seed-show-lobby-welcome", "Weekend loop");

  // ── Automations ───────────────────────────────────────────────────
  const automations: (Automation & { seed: true })[] = [
    {
      id: "seed-auto-doors-open",
      trigger: "doors_open",
      triggerLabel: "Doors open",
      when: "Weekdays · 08:00",
      action: "Start Reception — morning hellos",
      icon: "door-open",
      on: true,
      createdAt: now - 30 * DAY,
      seed: true,
    },
    {
      id: "seed-auto-lunch",
      trigger: "custom_time",
      triggerLabel: "Lunch",
      when: "Weekdays · 11:00",
      action: "Swap Kitchen display to lunch program",
      icon: "coffee",
      on: true,
      createdAt: now - 20 * DAY,
      seed: true,
    },
    {
      id: "seed-auto-close",
      trigger: "doors_close",
      triggerLabel: "Doors close",
      when: "Weekdays · 18:00",
      action: "Lobby → After hours goodbye",
      icon: "moon",
      on: true,
      createdAt: now - 10 * DAY,
      seed: true,
    },
    {
      id: "seed-auto-offline-alert",
      trigger: "custom_time",
      triggerLabel: "Offline alert",
      when: "Any display offline > 5 min",
      action: "Ping #studio-ops in Slack",
      icon: "warning",
      on: false,
      createdAt: now - 5 * DAY,
      seed: true,
    },
  ];

  // ── Media assets (unsplash-sourced visual library) ───────────────
  const media: (MediaAsset & { seed: true })[] = Object.entries(IMG).map(
    ([name, url], i) => ({
      id: `seed-media-${name}`,
      name: `${name}.jpg`,
      mime: "image/jpeg",
      size: 420_000 + i * 13_000,
      r2Key: `seed/${name}.jpg`,
      publicUrl: url,
      width: 1600,
      height: 1067,
      source: "unsplash",
      sourceRefId: null,
      uploadedBy: uid,
      status: "ready",
      eventId: null,
      createdAt: now - i * 6 * 60 * 60 * 1000,
      seed: true,
    }),
  );

  // ── Write everything ──────────────────────────────────────────────
  const write = async <T extends { id: string }>(col: string, items: T[]) => {
    let batch = ws.firestore.batch();
    let n = 0;
    for (const item of items) {
      batch.set(ws.collection(col).doc(item.id), item);
      n++;
      if (n % 400 === 0) {
        await batch.commit();
        batch = ws.firestore.batch();
      }
    }
    await batch.commit();
  };

  await Promise.all([
    write("events", events),
    write("slideshows", slideshows),
    write("displays", displays),
    write("schedule", scheduleBlocks),
    write("automations", automations),
    write("media", media),
  ]);

  return {
    workspaceId,
    counts: {
      events: events.length,
      slideshows: slideshows.length,
      displays: displays.length,
      schedule: scheduleBlocks.length,
      automations: automations.length,
      media: media.length,
    },
  };
}
