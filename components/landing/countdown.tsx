"use client";

import { useSyncExternalStore } from "react";

const IST_OFFSET_MS = 330 * 60 * 1000; // India Standard Time is UTC+5:30, no daylight saving.
const DAY_MS = 24 * 60 * 60 * 1000;
const DROP_HOUR = 21; // 9 PM

function msUntilDrop(now: number) {
  const ist = now + IST_OFFSET_MS;
  let drop = Math.floor(ist / DAY_MS) * DAY_MS + DROP_HOUR * 60 * 60 * 1000;
  if (ist >= drop) drop += DAY_MS;
  return drop - ist;
}

function format(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}

const readClock = () => format(msUntilDrop(Date.now()));
const serverClock = () => "--:--:--";

/** Time left until tonight's 9 PM IST drop, in Pixelify numerals. */
export function DropCountdown() {
  const left = useSyncExternalStore(subscribe, readClock, serverClock);
  return (
    <p className="bbh-countdown">
      <span className="bbh-countdown__label">Next drop in</span>
      <span className="bbh-countdown__time" aria-hidden="true">
        {left}
      </span>
      <span className="sr-only">The drop opens every day at 9 PM India time.</span>
    </p>
  );
}
