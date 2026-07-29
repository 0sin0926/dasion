// 질문을 소리로 읽어준다(글 못 읽는 유아 접근성).
// 1순위: 미리 생성한 Gemini TTS(Leda) 오디오 파일 재생 — 자연스럽고 런타임 비용 0.
// 2순위: 매니페스트에 없는 텍스트는 브라우저 내장 TTS로 폴백(어색하지만 최후 수단).

import { QUESTION_AUDIO } from "@/lib/voice/questionAudioManifest";

// 사전 생성 오디오가 다소 빠르게 들려서 재생 속도를 살짝 낮춘다(피치는 유지).
const PLAYBACK_RATE = 0.85;

let currentAudio: HTMLAudioElement | null = null;

function supportsSynth(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  return voices.find((v) => v.lang?.toLowerCase().startsWith("ko")) ?? null;
}

function speakWithSynth(text: string) {
  if (!supportsSynth()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.9;
  u.pitch = 1.1;
  const v = pickKoreanVoice();
  if (v) u.voice = v;
  synth.speak(u);
}

/** 한국어 텍스트를 읽어준다. 진행 중인 소리는 멈추고 새로 재생. */
export function speakKorean(text: string) {
  if (typeof window === "undefined" || !text.trim()) return;
  stopSpeaking();

  const src = QUESTION_AUDIO[text];
  if (src) {
    const audio = new Audio(src);
    audio.playbackRate = PLAYBACK_RATE;
    audio.preservesPitch = true;
    currentAudio = audio;
    audio.play().catch((e) => {
      // 우리가 다음 질문으로 교체했거나(멈춤) 중단(AbortError)한 경우는 무시.
      // 그렇지 않은 진짜 실패(자동재생 차단 등)일 때만 브라우저 TTS로 폴백.
      if (audio !== currentAudio || e?.name === "AbortError") return;
      console.warn("[speak] 오디오 재생 실패, TTS 폴백:", e);
      speakWithSynth(text);
    });
    return;
  }
  speakWithSynth(text);
}

/** 진행 중인 낭독(오디오 파일 + 브라우저 TTS)을 멈춘다. */
export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (supportsSynth()) window.speechSynthesis.cancel();
}
