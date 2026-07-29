"use client";

import { useVoiceRecorder } from "@/lib/voice/useVoiceRecorder";
import { MicIcon, StopIcon, Spinner } from "@/components/VoiceIcons";

// 자유 녹음 마이크 버튼. 녹음 → /api/stt → onResult로 정리된 텍스트 전달.
// 등록 폼(설명/편지)에서 사용. 녹음 로직은 useVoiceRecorder 훅으로 공유.

export default function VoiceMic({
  mode,
  onResult,
  accent,
  helper,
}: {
  mode: "describe" | "letter";
  onResult: (text: string) => void;
  accent: { btn: string; text: string };
  helper: string;
}) {
  const { status, error, start, stop } = useVoiceRecorder({ mode, onResult });

  const recording = status === "recording";
  const processing = status === "processing";

  const statusText = recording
    ? "듣고 있어요… 다 말했으면 버튼을 한 번 더 눌러요"
    : processing
      ? "옮겨 적는 중이에요…"
      : (error ?? "버튼을 누르고 말해보세요");

  return (
    <>
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={processing}
        aria-label={recording ? "녹음 멈추기" : "녹음 시작"}
        style={{ backgroundColor: accent.btn }}
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-70 ${
          recording ? "animate-pulse ring-4 ring-red-300" : ""
        }`}
      >
        {processing ? <Spinner /> : recording ? <StopIcon /> : <MicIcon />}
      </button>
      <div className="text-center">
        <p className="text-[13px] font-bold" style={{ color: accent.text }}>
          {helper}
        </p>
        <p
          className="mt-1 text-[11px]"
          style={{ color: accent.text, opacity: 0.75 }}
        >
          {statusText}
        </p>
      </div>
    </>
  );
}
