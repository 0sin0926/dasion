"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryKey } from "@/types/item";
import { getQuestions } from "@/lib/registerQuestions";
import { useVoiceRecorder } from "@/lib/voice/useVoiceRecorder";
import { speakKorean, stopSpeaking } from "@/lib/voice/speak";
import { MicIcon, StopIcon, Spinner } from "@/components/VoiceIcons";

// 질문 가이드 팝업(바텀시트).
// 질문을 하나씩 소리로 읽어주고(TTS) 아이가 각 질문에 음성으로 답하면,
// 모은 답을 /api/compose로 보내 하나의 설명글로 완성해 onComplete로 넘긴다.

export default function GuidedVoiceSheet({
  category,
  onComplete,
  onClose,
}: {
  category: CategoryKey | null;
  onComplete: (text: string) => void;
  onClose: () => void;
}) {
  const questions = useMemo(() => getQuestions(category), [category]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const answer = current ? answers[current.id] : undefined;

  const { status, error, start, stop } = useVoiceRecorder({
    mode: "answer",
    onResult: (text) =>
      setAnswers((prev) => ({ ...prev, [current.id]: text })),
  });

  // 질문이 바뀔 때마다 소리로 읽어준다. 언마운트/이동 시 낭독 취소.
  useEffect(() => {
    if (current) speakKorean(current.text);
    return () => stopSpeaking();
  }, [index, current]);

  function goNext() {
    stopSpeaking();
    if (!isLast) setIndex((i) => i + 1);
  }

  async function finish() {
    stopSpeaking();
    const pairs = questions
      .map((q) => ({ question: q.text, answer: answers[q.id] ?? "" }))
      .filter((p) => p.answer.trim());
    console.log("[guide] finish: answers=", answers, "pairs=", pairs);
    if (pairs.length === 0) {
      // 답이 하나도 안 담김 → 조용히 닫지 말고 이유를 알려준다.
      setComposeError("아직 답을 못 들었어요. 마이크를 눌러 대답해줘!");
      return;
    }
    setComposing(true);
    setComposeError(null);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, pairs }),
      });
      const data = await res.json();
      console.log("[guide] compose 응답:", res.status, data);
      if (!res.ok || !data.text) {
        const code = data.error ?? "failed";
        // 429(무료 티어 분당 한도)는 잠깐 뒤 다시 하면 풀린다.
        if (code === "rate_limited") {
          console.warn("[guide] compose 사용량 한도(429) — 잠시 후 다시");
          setComposeError("지금 사용량이 많아요. 10초쯤 뒤에 다시 눌러줘!");
          setComposing(false);
          return;
        }
        throw new Error(code);
      }
      onComplete(data.text as string);
    } catch (e) {
      console.error("[guide] compose 실패:", e);
      setComposeError("설명을 만들지 못했어요. 잠시 후 다시 해볼까요?");
      setComposing(false);
    }
  }

  const recording = status === "recording";
  const processing = status === "processing";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* 배경(탭하면 닫기) */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* 시트 */}
      <div className="relative z-10 w-full max-w-[var(--frame-max)] rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
        {/* 진행 표시 + 닫기 */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#3D6B3D]">
            {index + 1} / {questions.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-[22px] leading-none text-gray-400"
          >
            ×
          </button>
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#EFF7EF]">
          <div
            className="h-full rounded-full bg-[#3D6B3D] transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        {composing ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="text-4xl">✍️</span>
            <p className="text-[15px] font-bold text-ink">설명을 만들고 있어요…</p>
          </div>
        ) : (
          <>
            {/* 질문 */}
            <h3 className="text-center text-[20px] font-extrabold leading-snug text-ink">
              {current.text}
            </h3>
            {current.hint && (
              <p className="mt-2 text-center text-[12px] text-muted">
                ({current.hint})
              </p>
            )}
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => speakKorean(current.text)}
                className="flex items-center gap-1 rounded-full bg-[#EFF7EF] px-3 py-1.5 text-[12px] font-bold text-[#3D6B3D]"
              >
                🔊 다시 듣기
              </button>
            </div>

            {/* 마이크 */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={recording ? stop : start}
                disabled={processing}
                aria-label={recording ? "녹음 멈추기" : "녹음 시작"}
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-[#3D6B3D] shadow-lg transition-transform active:scale-95 disabled:opacity-70 ${
                  recording ? "animate-pulse ring-4 ring-red-300" : ""
                }`}
              >
                {processing ? <Spinner /> : recording ? <StopIcon /> : <MicIcon />}
              </button>
              <p className="text-[12px] font-medium text-muted">
                {recording
                  ? "듣고 있어요… 다 말하면 다시 눌러요"
                  : processing
                    ? "옮겨 적는 중…"
                    : (error ?? "버튼을 누르고 말해봐")}
              </p>
            </div>

            {/* 답 미리보기 */}
            {answer && (
              <div className="mt-5 rounded-2xl border border-[#F2F4D5] bg-[#FEFFE5] p-4">
                <p className="mb-1 text-[11px] font-bold text-[#B0B285]">
                  이렇게 들었어! (다시 말하려면 마이크를 눌러)
                </p>
                <p className="text-[14px] leading-relaxed text-[#5B5E3B]">
                  {answer}
                </p>
              </div>
            )}

            {composeError && (
              <p className="mt-3 text-center text-[12px] text-red-500">
                {composeError}
              </p>
            )}

            {/* 다음 / 완성 */}
            <button
              type="button"
              onClick={isLast ? finish : goNext}
              className="mt-6 w-full rounded-2xl bg-[#3D6B3D] py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
            >
              {isLast ? "설명 완성하기" : answer ? "다음" : "건너뛰기"}
            </button>
            {!isLast && (
              <button
                type="button"
                onClick={finish}
                className="mt-2 w-full py-2 text-[12px] font-semibold text-muted"
              >
                여기까지 하고 완성하기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
