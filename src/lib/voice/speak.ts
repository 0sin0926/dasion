// 브라우저 내장 TTS(Web Speech API)로 한국어 텍스트를 읽어준다.
// 글 못 읽는 유아에게 질문을 소리로 안내하는 용도. 미지원/한국어 보이스 없으면 조용히 무시.

function supported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // 아직 로드 안 됨 → 기본 보이스로 재생
  return voices.find((v) => v.lang?.toLowerCase().startsWith("ko")) ?? null;
}

/** 한국어 텍스트를 읽어준다. 진행 중인 낭독이 있으면 취소하고 새로 재생. */
export function speakKorean(text: string) {
  if (!supported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.95;
  u.pitch = 1.1; // 아이에게 친근하도록 살짝 높은 톤
  const v = pickKoreanVoice();
  if (v) u.voice = v;
  synth.speak(u);
}

/** 진행 중인 낭독을 멈춘다. */
export function stopSpeaking() {
  if (!supported()) return;
  window.speechSynthesis.cancel();
}
