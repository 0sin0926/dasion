"use client";

import { useRef, useState } from "react";

// 녹음 → /api/stt(Gemini) → 정리된 텍스트를 onResult로 전달하는 마이크 버튼.
// 등록 폼(설명/편지), 이후 기부받기 편지에서 재사용.

type Status = "idle" | "recording" | "processing" | "error";

// Gemini가 확실히 받는 포맷을 우선(mp4/ogg). Chrome은 대개 webm으로 폴백.
const MIME_PREFERENCE = [
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/webm;codecs=opus",
  "audio/webm",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_PREFERENCE.find((t) => MediaRecorder.isTypeSupported(t));
}

function MicIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="animate-spin" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function handleStop(mimeType: string) {
    setStatus("processing");
    stopTracks();
    const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
    if (blob.size === 0) {
      setStatus("idle");
      return;
    }
    try {
      const form = new FormData();
      form.append("audio", blob, "recording");
      form.append("mode", mode);
      const res = await fetch("/api/stt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.text) throw new Error(data.error ?? "failed");
      onResult(data.text as string);
      setStatus("idle");
    } catch (e) {
      console.error("[voice] stt 실패:", e);
      setErrorMsg("음성을 옮기지 못했어요. 다시 한 번 말해볼까요?");
      setStatus("error");
    }
  }

  async function startRecording() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void handleStop(recorder.mimeType);
      };
      recorder.start();
      recorderRef.current = recorder;
      setStatus("recording");
    } catch (e) {
      console.error("[voice] 마이크 접근 실패:", e);
      setErrorMsg("마이크를 쓸 수 없어요. 브라우저 마이크 권한을 확인해주세요.");
      setStatus("error");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  const recording = status === "recording";
  const processing = status === "processing";

  const statusText =
    status === "recording"
      ? "듣고 있어요… 다 말했으면 버튼을 한 번 더 눌러요"
      : status === "processing"
        ? "옮겨 적는 중이에요…"
        : errorMsg
          ? errorMsg
          : "버튼을 누르고 말해보세요";

  return (
    <>
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
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
