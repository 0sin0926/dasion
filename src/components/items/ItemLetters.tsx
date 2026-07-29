"use client";

import { useEffect, useState } from "react";
import type { ItemStatus } from "@/types/item";
import { getItemLetters, type ItemLettersData } from "@/lib/letters/getItemLetters";

/**
 * 물품 상세의 편지 영역. 편지 본문은 당사자(기부자·수혜자)에게만 보인다.
 * - 세션 기준으로 letters를 조회(RLS가 비당사자를 차단) → 본문은 당사자만 채워짐.
 * - 비당사자에겐 나눔 전(available)일 때만 "받기 전 잠금"으로 존재만 알린다.
 */
export default function ItemLetters({
  itemId,
  status,
}: {
  itemId: string;
  status: ItemStatus;
}) {
  const [data, setData] = useState<ItemLettersData | null>(null);

  useEffect(() => {
    let alive = true;
    getItemLetters(itemId)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((err) => {
        console.error("[items] 편지 조회 실패:", err);
      });
    return () => {
      alive = false;
    };
  }, [itemId]);

  if (!data) return null; // 로딩/실패 시 조용히 생략

  const { donorLetter, recipientReply, hasDonorLetter } = data;
  const showDonorContent = !!donorLetter?.trim();
  // 비당사자: 나눔 전 물품에 편지가 있을 때만 잠금(기대감). 나눔 후엔 노출 안 함.
  const showLock = !showDonorContent && status === "available" && hasDonorLetter;

  return (
    <>
      {(showDonorContent || showLock) && (
        <div className="mt-3 rounded-2xl border border-[#FDE3CE] bg-[#FFF1E5] p-4">
          <p className="mb-1 text-[12px] font-bold text-[#B96A25]">
            💌 마음을 담은 편지
          </p>
          {showDonorContent ? (
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#8A4E18]">
              {donorLetter}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[13px] font-semibold leading-6 text-[#B96A25]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              기부를 받고 편지를 확인해봐요!
            </p>
          )}
        </div>
      )}

      {recipientReply?.trim() && (
        <div className="mt-3 rounded-2xl border border-[#CFE9D6] bg-[#EFF7EF] p-4">
          <p className="mb-1 text-[12px] font-bold text-forest">
            💌 받은 감사 편지
          </p>
          <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#2F6B3D]">
            {recipientReply}
          </p>
        </div>
      )}
    </>
  );
}
