"use client";

import { useMemo, useState } from "react";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long"
});

type AgeSnapshot = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  weeks: number;
  nextBirthday: Date;
  daysUntilNextBirthday: number;
  milestones: Milestone[];
};

type Milestone = {
  label: string;
  status: "reached" | "upcoming";
  descriptor: string;
  eta?: number;
};

function calculateAge(birthDateStr: string, referenceDateStr: string): AgeSnapshot {
  const birth = new Date(birthDateStr);
  const reference = new Date(referenceDateStr);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) {
    throw new Error("Please provide valid dates.");
  }

  if (birth > reference) {
    throw new Error("Birth date must be before the reference date.");
  }

  const diffMs = reference.getTime() - birth.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const weeks = Math.floor(totalDays / 7);

  let years = reference.getFullYear() - birth.getFullYear();
  let months = reference.getMonth() - birth.getMonth();
  let days = reference.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(reference.getFullYear(), reference.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let nextBirthday = new Date(reference.getFullYear(), birth.getMonth(), birth.getDate());
  if (
    nextBirthday.getTime() < reference.getTime() ||
    (nextBirthday.getTime() === reference.getTime() && reference.getHours() > 0)
  ) {
    nextBirthday = new Date(reference.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }

  const daysUntilNextBirthday = Math.ceil(
    (nextBirthday.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24)
  );

  const milestones = generateMilestones({
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds
  });

  return {
    years,
    months,
    days,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    weeks,
    nextBirthday,
    daysUntilNextBirthday,
    milestones
  };
}

function generateMilestones(metrics: {
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}): Milestone[] {
  const blueprint = [
    {
      label: "10,000 days on Earth",
      target: 10_000,
      unit: "days",
      descriptor: "Celebrate a quintuple-digit day count."
    },
    {
      label: "1,000 weeks milestone",
      target: 1_000,
      unit: "weeks",
      descriptor: "A millennium of weeks lived."
    },
    {
      label: "Half-century marker",
      target: 50,
      unit: "years",
      descriptor: "The golden jubilee of life experience."
    },
    {
      label: "One billion heartbeats (estimated)",
      target: 1_000_000_000 / 115_200,
      unit: "days",
      descriptor: "Approximate based on 80 bpm average."
    },
    {
      label: "One gigasecond old",
      target: 1_000_000_000,
      unit: "seconds",
      descriptor: "A billion seconds of stories."
    },
    {
      label: "20 million minutes",
      target: 20_000_000,
      unit: "minutes",
      descriptor: "Minutes that shaped your narrative."
    }
  ];

  return blueprint.map((milestone) => {
    const value =
      milestone.unit === "days"
        ? metrics.totalDays
        : milestone.unit === "weeks"
          ? Math.floor(metrics.totalDays / 7)
          : milestone.unit === "years"
            ? metrics.totalDays / 365.25
            : milestone.unit === "minutes"
              ? metrics.totalMinutes
              : milestone.unit === "seconds"
                ? metrics.totalSeconds
                : 0;

    if (value >= milestone.target) {
      return { ...milestone, status: "reached" as const };
    }

    const remaining =
      milestone.unit === "days"
        ? milestone.target - metrics.totalDays
        : milestone.unit === "weeks"
          ? milestone.target - Math.floor(metrics.totalDays / 7)
          : milestone.unit === "years"
            ? Math.ceil((milestone.target - value) * 365.25)
            : milestone.unit === "minutes"
              ? milestone.target - metrics.totalMinutes
              : milestone.unit === "seconds"
                ? milestone.target - metrics.totalSeconds
                : 0;

    return {
      ...milestone,
      status: "upcoming" as const,
      eta: Math.max(remaining, 0)
    };
  });
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDuration(days: number): string {
  const years = Math.floor(days / 365.25);
  const remainingDaysAfterYears = days - years * 365.25;
  const months = Math.floor(remainingDaysAfterYears / 30.4375);
  const remainingDays = Math.round(
    remainingDaysAfterYears - months * 30.4375
  );

  const segments = [
    years > 0 ? `${years} yr` : null,
    months > 0 ? `${months} mo` : null,
    remainingDays > 0 ? `${remainingDays} d` : null
  ].filter(Boolean);

  return segments.length ? segments.join(" • ") : "Now";
}

export default function Page() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [birthDate, setBirthDate] = useState("");
  const [referenceDate, setReferenceDate] = useState(today);

  const { snapshot, error } = useMemo(() => {
    if (!birthDate) {
      return { snapshot: null, error: null };
    }

    try {
      return {
        snapshot: calculateAge(birthDate, referenceDate),
        error: null
      };
    } catch (err) {
      return {
        snapshot: null,
        error: err instanceof Error ? err.message : "Unable to calculate age."
      };
    }
  }, [birthDate, referenceDate]);

  return (
    <main className="flex min-h-screen flex-col px-6 pb-24 pt-16 md:px-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">
                Chronometric Studio
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
                Decode Your Age with Precision Analytics and Futuristic Flair
              </h1>
              <p className="mt-6 max-w-2xl text-balance text-lg text-white/70">
                Drop your birthdate and instantly unlock a holographic view of
                your lived time, upcoming milestones, and cosmic countdowns.
              </p>
            </header>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20 backdrop-blur-xl">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Birth date
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    max={referenceDate}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white shadow-inner shadow-black/20 outline-none transition focus:border-aurora-start focus:ring-2 focus:ring-aurora-start/40"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Reference date
                  </label>
                  <input
                    type="date"
                    value={referenceDate}
                    onChange={(event) => setReferenceDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white shadow-inner shadow-black/20 outline-none transition focus:border-aurora-end focus:ring-2 focus:ring-aurora-end/40"
                  />
                </div>
              </div>
              {error ? (
                <p className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : (
                <p className="mt-6 text-sm text-white/60">
                  We blend precise calendrical math with cinematic visualization
                  to keep you in sync with life&apos;s timelines.
                </p>
              )}
            </div>

            <section className="grid gap-6 md:grid-cols-2">
              <article className="col-span-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
                <h2 className="text-xl font-semibold text-white">
                  Astro Age Synopsis
                </h2>
                {snapshot ? (
                  <div className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-6">
                    <div>
                      <span className="text-sm uppercase tracking-widest text-aurora-start">
                        Years
                      </span>
                      <p className="mt-2 text-5xl font-semibold">
                        {snapshot.years}
                        <span className="ml-2 text-lg text-white/70">
                          yrs
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm uppercase tracking-widest text-aurora-end">
                        Months
                      </span>
                      <p className="mt-2 text-4xl font-semibold">
                        {snapshot.months}
                        <span className="ml-2 text-lg text-white/70">
                          mo
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm uppercase tracking-widest text-white/60">
                        Days
                      </span>
                      <p className="mt-2 text-4xl font-semibold">
                        {snapshot.days}
                        <span className="ml-2 text-lg text-white/70">
                          d
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-white/70">
                    Choose your birth date to trigger the hyper-accurate age
                    engine.
                  </p>
                )}
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
                <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Time Ledger
                </h3>
                {snapshot ? (
                  <dl className="mt-6 space-y-4 text-sm text-white/80">
                    <div className="flex justify-between gap-4">
                      <dt>Total days lived</dt>
                      <dd className="font-mono text-white">
                        {formatNumber(snapshot.totalDays)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total weeks</dt>
                      <dd className="font-mono text-white">
                        {formatNumber(snapshot.weeks)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total hours</dt>
                      <dd className="font-mono text-white">
                        {formatNumber(snapshot.totalHours)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total minutes</dt>
                      <dd className="font-mono text-white">
                        {formatNumber(snapshot.totalMinutes)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total seconds</dt>
                      <dd className="font-mono text-white">
                        {formatNumber(snapshot.totalSeconds)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-6 text-sm text-white/60">
                    The ledger activates once your birth date locks in.
                  </p>
                )}
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
                <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Next orbit
                </h3>
                {snapshot ? (
                  <div className="mt-6 space-y-4 text-sm text-white/80">
                    <p className="text-lg text-white">
                      {DATE_FORMATTER.format(snapshot.nextBirthday)}
                    </p>
                    <p>
                      Landing on{" "}
                      <span className="font-semibold">
                        {WEEKDAY_FORMATTER.format(snapshot.nextBirthday)}
                      </span>
                    </p>
                    <p>
                      Countdown:{" "}
                      <span className="font-semibold text-aurora-start">
                        {snapshot.daysUntilNextBirthday} days
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-white/60">
                    See your next birthday&apos;s vibe once we know your origin
                    date.
                  </p>
                )}
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
                <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Milestone radar
                </h3>
                {snapshot ? (
                  <ul className="mt-6 space-y-4 text-sm">
                    {snapshot.milestones.map((milestone) => (
                      <li
                        key={milestone.label}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/20"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {milestone.label}
                          </p>
                          <p className="mt-1 text-white/60">
                            {milestone.descriptor}
                          </p>
                        </div>
                        <p
                          className={`font-mono text-xs ${
                            milestone.status === "reached"
                              ? "text-aurora-start"
                              : "text-aurora-end"
                          }`}
                        >
                          {milestone.status === "reached"
                            ? "Achieved"
                            : `ETA ${formatDuration(milestone.eta ?? 0)}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm text-white/60">
                    Incoming milestones appear once your age data streams in.
                  </p>
                )}
              </article>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-aurora-start/30 via-aurora-end/20 to-transparent p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
              <h2 className="text-xl font-semibold text-white">
                Age Graph Pulse
              </h2>
              {snapshot ? (
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-white/50">
                      Current milestone
                    </p>
                    <p className="mt-2 text-lg text-white">
                      {snapshot.years} years • {snapshot.months} months •{" "}
                      {snapshot.days} days
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-widest text-white/50">
                        Lunar cycles lived
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatNumber(Math.round(snapshot.totalDays / 29.53))}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-widest text-white/50">
                        Heartbeats (est.)
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatNumber(Math.round(snapshot.totalMinutes * 80))}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-widest text-white/50">
                        Sunrises witnessed
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatNumber(snapshot.totalDays)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-widest text-white/50">
                        Percent of century
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {(
                          (snapshot.totalDays / (100 * 365.25)) *
                          100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-white/70">
                  Once your data is in, we visualize cosmic metrics from lunar
                  cycles to heartbeat estimates.
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <h2 className="text-xl font-semibold text-white">
                Advanced UI Prompt
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Feed this into your favorite design AI to remix the chronometric
                experience.
              </p>
              <textarea
                readOnly
                className="mt-4 h-56 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 shadow-inner shadow-black/40 focus:outline-none"
                value={`Design a futuristic, cyberpunk-inspired age calculator dashboard called "Aeternum Age Engine". Use a dark aurora gradient background, glassmorphism cards, neon turquoise and violet highlights, and high contrast typography. Include sections for precise age breakdown (years, months, days), cumulative metrics (total days, hours, minutes, seconds), milestone radar for upcoming life events, and an inspirational analytics sidebar with cosmic metaphors. Add subtle glowing dividers, particle-like accents, and interactive hover states. The interface should feel cinematic, data-rich, and ready for a Vercel-hosted Next.js experience.`}
              />
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
