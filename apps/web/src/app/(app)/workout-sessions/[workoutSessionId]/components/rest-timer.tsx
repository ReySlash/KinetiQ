"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type StoredTimer = {
  remaining: number;
  isRunning: boolean;
  endsAt: number | null;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function RestTimer({
  seconds,
  autoStart = true,
  storageKey,
  startFresh = false,
}: {
  seconds: number;
  autoStart?: boolean;
  storageKey?: string;
  startFresh?: boolean;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(!storageKey);

  useEffect(() => {
    if (!storageKey) {
      if (!autoStart) return;
      const timeoutId = window.setTimeout(() => {
        setEndsAt(Date.now() + seconds * 1000);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      if (startFresh) {
        const nextEndsAt = Date.now() + seconds * 1000;
        setRemaining(seconds);
        setIsRunning(true);
        setEndsAt(nextEndsAt);
        setHydrated(true);
        return;
      }

      try {
        const stored = window.localStorage.getItem(storageKey);
        const timer = stored ? (JSON.parse(stored) as StoredTimer) : null;
        const restoredRemaining =
          timer?.isRunning && timer.endsAt
            ? Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
            : (timer?.remaining ?? seconds);
        const restoredIsRunning = Boolean(
          timer?.isRunning && restoredRemaining > 0,
        );

        setRemaining(restoredRemaining);
        setIsRunning(timer ? restoredIsRunning : autoStart);
        setEndsAt(restoredIsRunning ? timer?.endsAt ?? null : null);
      } catch {
        setRemaining(seconds);
        setIsRunning(autoStart);
        setEndsAt(autoStart ? Date.now() + seconds * 1000 : null);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [autoStart, seconds, startFresh, storageKey]);

  useEffect(() => {
    if (!isRunning || !endsAt) return;
    const updateRemaining = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((endsAt - Date.now()) / 1000),
      );
      setRemaining(nextRemaining);
      if (nextRemaining === 0) {
        setIsRunning(false);
        setEndsAt(null);
      }
    };
    updateRemaining();
    const interval = window.setInterval(() => {
      updateRemaining();
    }, 1000);
    return () => window.clearInterval(interval);
  }, [endsAt, isRunning]);

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    const timer: StoredTimer = { remaining, isRunning, endsAt };
    window.localStorage.setItem(storageKey, JSON.stringify(timer));
  }, [endsAt, hydrated, isRunning, remaining, storageKey]);

  return (
    <div className="grid gap-1 rounded-2xl border border-border/70 bg-background/35 p-1 text-center">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Rest timer
      </p>
      <p className="text-4xl font-semibold tabular-nums" aria-live="polite">
        {formatTime(remaining)}
      </p>
      <div className="flex justify-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsRunning(true);
                  setEndsAt(Date.now() + remaining * 1000);
                }}
                disabled={isRunning || remaining === 0}
                aria-label="Play rest timer"
              >
                <Play />
              </Button>
            }
          />
          <TooltipContent>Play rest timer</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const nextRemaining = endsAt
                    ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
                    : remaining;
                  setRemaining(nextRemaining);
                  setIsRunning(false);
                  setEndsAt(null);
                }}
                disabled={!isRunning || remaining === 0}
                aria-label="Pause rest timer"
              >
                <Pause />
              </Button>
            }
          />
          <TooltipContent>Pause rest timer</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setRemaining(seconds);
                  setIsRunning(false);
                  setEndsAt(null);
                }}
                aria-label="Reset rest timer"
              >
                <RotateCcw />
              </Button>
            }
          />
          <TooltipContent>Reset rest timer</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
