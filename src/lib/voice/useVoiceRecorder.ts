// 녹음 → /api/stt(Gemini) → 텍스트 결과를 콜백으로 돌려주는 재사용 훅.
// VoiceMic(자유 녹음)와 GuidedVoiceSheet(질문별 답)이 공유한다.

import { useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "processing" | "error";

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

export function useVoiceRecorder(opts: {
  mode: "describe" | "letter" | "answer";
  onResult: (text: string) => void;
}) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  // 최신 opts를 참조하도록 ref에 보관(비동기 onstop 시점에도 현재 값 사용).
  const optsRef = useRef(opts);
  optsRef.current = opts;

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
      form.append("mode", optsRef.current.mode);
      const res = await fetch("/api/stt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.text) {
        const code = data.error ?? "failed";
        // 429(무료 티어 분당 한도)는 잠깐 뒤 다시 하면 풀리는 일시적 상황.
        // 진짜 실패와 다르게 안내하고, 개발 에러 오버레이가 안 뜨게 warn으로 남긴다.
        if (code === "rate_limited") {
          console.warn("[voice] stt 사용량 한도(429) — 잠시 후 다시");
          setError("지금 친구들이 많이 쓰고 있어요. 잠깐 뒤에 다시 눌러줘!");
          setStatus("error");
          return;
        }
        throw new Error(code);
      }
      optsRef.current.onResult(data.text as string);
      setStatus("idle");
    } catch (e) {
      console.error("[voice] stt 실패:", e);
      setError("음성을 옮기지 못했어요. 다시 한 번 말해볼까요?");
      setStatus("error");
    }
  }

  async function start() {
    setError(null);
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
      setError("마이크를 쓸 수 없어요. 브라우저 마이크 권한을 확인해주세요.");
      setStatus("error");
    }
  }

  function stop() {
    recorderRef.current?.stop();
  }

  return { status, error, start, stop };
}
