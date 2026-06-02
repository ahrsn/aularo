"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/ui/wordmark";
import { useToast } from "@/components/ui/toast";
import { completeOnboarding } from "@/lib/actions";
import { isCommunity } from "@/lib/edition";
import { SCREEN_DISPLAY_URL, SITE_NAME } from "@/lib/site";
import type { UseCase, WorkspacePlan } from "@/lib/schema";

type UseCaseOption = { value: UseCase; label: string; hint: string };

type PlanOption = {
  value: WorkspacePlan;
  name: string;
  price: string;
  cadence: string;
  desc: string;
  features: string[];
  cta: string;
  trial: boolean;
  badge?: string;
};

const PLANS: PlanOption[] = [
  {
    value: "free",
    name: "Free",
    price: "$0",
    cadence: "forever, one display",
    desc: "For a single screen, or while you evaluate.",
    features: [
      "1 connected display",
      "3 slideshows",
      "Standard transitions",
      "Community support",
    ],
    cta: "Start free",
    trial: false,
  },
  {
    value: "studio",
    name: "Studio",
    price: "$19",
    cadence: "per display / month",
    desc: "For galleries, hotels, and small venues.",
    features: [
      "Up to 5 displays",
      "Photo slideshows + public preview links",
      "Email support, 1 business day",
      `No ${SITE_NAME} branding on the screen`,
    ],
    cta: "Start 14-day trial",
    trial: true,
    badge: "Most chosen",
  },
  {
    value: "venue",
    name: "Venue",
    price: "$29",
    cadence: "per display / month",
    desc: "For organizations running simultaneous events.",
    features: [
      "Unlimited displays",
      "Scheduling + automations",
      "Drive and Dropbox sync",
      "Insights, team roles, priority sync",
    ],
    cta: "Start 14-day trial",
    trial: true,
  },
];

const USE_CASES: UseCaseOption[] = [
  { value: "event", label: "Events", hint: "Galas, conferences, weddings" },
  { value: "gallery", label: "Galleries", hint: "Museums, exhibits, pop-ups" },
  { value: "kiosk", label: "Lobbies & kiosks", hint: "Hotels, waiting rooms, menus" },
  { value: "church", label: "Churches", hint: "Sermons, announcements, livestreams" },
  { value: "retail", label: "Retail", hint: "Storefronts, showrooms, cafes" },
  { value: "other", label: "Something else", hint: "You can tell us later" },
];

const SOURCES: string[] = [
  "Google search",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "X (Twitter)",
  "Reddit",
  "Facebook",
  "A friend or colleague",
  "A blog or article",
  "A podcast",
  "A newsletter",
  "At an event or conference",
  "Product Hunt",
  "Somewhere else",
];

const TOTAL_STEPS = 5;

export function OnboardingWizard({
  defaultName,
  defaultWorkspaceName,
}: {
  defaultName: string;
  defaultWorkspaceName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(defaultName);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [workspaceName, setWorkspaceName] = useState(
    defaultWorkspaceName === "My workspace" && defaultName
      ? `${defaultName.split(" ")[0]}'s workspace`
      : defaultWorkspaceName,
  );
  const [source, setSource] = useState<string | null>(null);
  const [plan, setPlan] = useState<WorkspacePlan | null>(null);

  function nextStep() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function finish(destination: "/app/library?new=1" | "/app/displays") {
    if (!name.trim() || !useCase || !workspaceName.trim() || !plan) {
      toast.error(new Error("Fill out each step first."), "Fill out each step first.");
      return;
    }
    setBusy(true);
    try {
      await completeOnboarding({
        name: name.trim(),
        useCase,
        workspaceName: workspaceName.trim(),
        source: source?.trim() || null,
        plan,
      });
      toast.success("Workspace created.");
      router.push(destination);
      router.refresh();
    } catch (e) {
      toast.error(e, "Couldn't finish setup.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full" style={{ maxWidth: 460 }}>
        <div className="mb-6 flex items-center justify-between">
          <Wordmark size={24} />
          <span className="text-[11px] uppercase tracking-[0.08em] text-muted-2">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="mb-6 h-[3px] w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-ink transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="rounded-[6px] border border-line bg-surface p-8">
          <div key={step} data-motion="step">
            {step === 1 && (
              <StepName
                name={name}
                setName={setName}
                onNext={nextStep}
              />
            )}
            {step === 2 && (
              <StepUseCase
                useCase={useCase}
                setUseCase={setUseCase}
                onBack={prevStep}
                onNext={nextStep}
              />
            )}
            {step === 3 && (
              <StepWorkspace
                workspaceName={workspaceName}
                setWorkspaceName={setWorkspaceName}
                source={source}
                setSource={setSource}
                onBack={prevStep}
                onNext={nextStep}
              />
            )}
            {step === 4 && (
              <StepPlan
                plan={plan}
                setPlan={setPlan}
                onBack={prevStep}
                onNext={nextStep}
                isCommunityEdition={isCommunity}
              />
            )}
            {step === 5 && (
              <StepActivation
                busy={busy}
                onBack={prevStep}
                onCreateSlideshow={() => finish("/app/library?new=1")}
                onPairScreen={() => finish("/app/displays")}
              />
            )}
          </div>

        </div>

        <div className="mt-6 text-center text-[12.5px] tracking-[-0.005em] text-muted-2">
          <Link href="/login" className="underline">
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}

function StepName({
  name,
  setName,
  onNext,
}: {
  name: string;
  setName: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onNext();
      }}
    >
      <h1 className="text-h2">Nice to meet you.</h1>
      <p className="mt-1 text-[13.5px] tracking-[-0.005em] text-muted">
        Four quick questions, then the screens are yours.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-[12.5px] text-muted">
          Your name
        </label>
        <Input
          autoFocus
          type="text"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!name.trim()}
        iconRight="arrow-right"
        className="mt-6 w-full justify-center"
      >
        Continue
      </Button>
    </form>
  );
}

function StepUseCase({
  useCase,
  setUseCase,
  onBack,
  onNext,
}: {
  useCase: UseCase | null;
  setUseCase: (v: UseCase) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 className="text-h2">Where will {SITE_NAME} live?</h1>
      <p className="mt-1 text-[13.5px] tracking-[-0.005em] text-muted">
        Pick what fits best. You can change this anytime.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {USE_CASES.map((opt) => {
          const selected = useCase === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setUseCase(opt.value)}
              className={`rounded-[4px] border p-3 text-left transition-colors ${
                selected
                  ? "border-ink bg-[rgba(25,35,26,0.04)]"
                  : "border-line hover:border-[#D4CFC0]"
              }`}
            >
              <div className="text-[13.5px] font-medium text-ink">
                {opt.label}
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted">{opt.hint}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          icon="arrow-left"
        >
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!useCase}
          iconRight="arrow-right"
          className="flex-1 justify-center"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepWorkspace({
  workspaceName,
  setWorkspaceName,
  source,
  setSource,
  onBack,
  onNext,
}: {
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  source: string | null;
  setSource: (v: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (workspaceName.trim()) onNext();
      }}
    >
      <h1 className="text-h2">Name your workspace.</h1>
      <p className="mt-1 text-[13.5px] tracking-[-0.005em] text-muted">
        It&rsquo;s the home for your slideshows, screens, and teammates.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-[12.5px] text-muted">
          Workspace name
        </label>
        <Input
          autoFocus
          type="text"
          placeholder="Acme Events"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          required
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-[12.5px] text-muted">
          How did you hear about us?{" "}
          <span className="text-muted-2">(optional)</span>
        </label>
        <select
          value={source ?? ""}
          onChange={(e) => setSource(e.target.value || null)}
          className="w-full appearance-none rounded-[4px] border border-line bg-surface px-3 py-2 text-[13.5px] tracking-[-0.005em] text-ink outline-none transition-colors focus-visible:border-moss focus-visible:ring-2 focus-visible:ring-moss/20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%236a6a6a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: 32,
          }}
        >
          <option value="">Select one</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          icon="arrow-left"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!workspaceName.trim()}
          iconRight="arrow-right"
          className="flex-1 justify-center"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

function StepActivation({
  busy,
  onBack,
  onCreateSlideshow,
  onPairScreen,
}: {
  busy: boolean;
  onBack: () => void;
  onCreateSlideshow: () => void;
  onPairScreen: () => void;
}) {
  return (
    <div>
      <h1 className="text-h2">Your workspace is ready.</h1>
      <p className="mt-1 text-[13.5px] tracking-[-0.005em] text-muted">
        14 days free. Pick a first move. Both doors stay open later.
      </p>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onCreateSlideshow}
          className="flex items-start gap-3 rounded-[4px] border border-line bg-surface p-4 text-left transition-colors hover:border-ink disabled:opacity-60"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-ink text-paper">
            <span className="text-[18px]">+</span>
          </div>
          <div>
            <div className="text-[14px] font-medium text-ink">
              Build your first slideshow
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              Start with photos, a program, or a quote card.
            </div>
          </div>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onPairScreen}
          className="flex items-start gap-3 rounded-[4px] border border-line bg-surface p-4 text-left transition-colors hover:border-ink disabled:opacity-60"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-ink text-ink">
            <span className="text-[18px]">⎙</span>
          </div>
          <div>
            <div className="text-[14px] font-medium text-ink">
              Pair a screen
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              Point any display at {SCREEN_DISPLAY_URL} and enter the code.
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          disabled={busy}
          icon="arrow-left"
        >
          Back
        </Button>
        {busy && (
          <span className="text-[12.5px] text-muted">Saving…</span>
        )}
      </div>
    </div>
  );
}

function StepPlan({
  plan,
  setPlan,
  onBack,
  onNext,
  isCommunityEdition,
}: {
  plan: WorkspacePlan | null;
  setPlan: (v: WorkspacePlan) => void;
  onBack: () => void;
  onNext: () => void;
  isCommunityEdition: boolean;
}) {
  // In community edition, auto-select "free" and show a confirmation instead
  // of a paid plan picker. This runs once on render — effect-free by design
  // since isCommunityEdition is a build-time constant.
  if (isCommunityEdition && plan !== "free") {
    setPlan("free");
  }

  if (isCommunityEdition) {
    return (
      <div>
        <h1 className="text-h2">Everything included.</h1>
        <p className="mt-1 text-[13.5px] tracking-[-0.005em] text-muted">
          The {SITE_NAME} Community Edition unlocks every feature — unlimited
          displays, slideshows, schedules, and automations — with no billing
          and no plan limits.
        </p>

        <div
          className="mt-6 rounded-[4px] border p-5"
          style={{
            background: "#FBF8F0",
            borderColor: "#19231A",
            boxShadow: "0 0 0 1px #19231A inset",
          }}
        >
          <div
            className="font-serif"
            style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}
          >
            Community Edition
          </div>
          <div
            className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted"
            style={{ textWrap: "pretty" }}
          >
            Self-hosted. You own your data and infrastructure.
          </div>
          <ul className="mt-3 flex list-none flex-col gap-y-1.5 p-0">
            {[
              "Unlimited displays",
              "Unlimited slideshows",
              "Scheduling + automations",
              "All transitions and media types",
              "No branding. No billing. No limits.",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-[6px] text-[12px] tracking-[-0.005em] text-ink"
              >
                <Icon
                  name="check"
                  size={12}
                  style={{ color: "#3B5A41", flexShrink: 0 }}
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            icon="arrow-left"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onNext}
            iconRight="arrow-right"
            className="flex-1 justify-center"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2">Pick your plan.</h1>
      <p className="mt-1 text-[13.5px] tracking-[-0.005em] text-muted">
        14 days free on Studio or Venue. Change your plan later in Settings.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {PLANS.map((t) => {
          const selected = plan === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setPlan(t.value)}
              className="relative rounded-[4px] border p-4 text-left transition-colors"
              style={{
                background: "#FBF8F0",
                color: "#0E1410",
                borderColor: selected ? "#19231A" : "var(--line)",
                boxShadow: selected
                  ? "0 0 0 1px #19231A inset"
                  : "none",
              }}
            >
              {t.badge && (
                <div
                  className="absolute right-3 rounded-[10px] text-[10.5px] font-medium tracking-[0.02em]"
                  style={{
                    top: 12,
                    background: "#3B5A41",
                    color: "#F5F1E8",
                    padding: "2px 8px",
                  }}
                >
                  {t.badge}
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 pr-20">
                <div
                  className="font-serif"
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.name}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {t.price}
                  </div>
                  <div className="text-[11.5px] tracking-[-0.005em] text-muted">
                    {t.cadence}
                  </div>
                </div>
              </div>
              <div
                className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted"
                style={{ textWrap: "pretty" }}
              >
                {t.desc}
              </div>
              <ul className="mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-[6px] text-[12px] tracking-[-0.005em] text-ink"
                  >
                    <Icon
                      name="check"
                      size={12}
                      style={{ color: "#3B5A41", flexShrink: 0 }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          icon="arrow-left"
        >
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!plan}
          iconRight="arrow-right"
          className="flex-1 justify-center"
        >
          {plan === "free"
            ? "Continue with Free"
            : plan
              ? "Start 14-day trial"
              : "Continue"}
        </Button>
      </div>
    </div>
  );
}
