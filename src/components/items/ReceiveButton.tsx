"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ItemStatus } from "@/types/item";

interface ReceiveButtonProps {
  itemId: string;
  ownerId: string;
  status: ItemStatus;
}

/**
 * 상세 화면 하단 "기부 받기" CTA.
 * - 이미 매칭/완료된 물품 → 비활성
 * - 내가 등록한 물품 → 비활성(내 물품은 받을 수 없음)
 * - 그 외 → /items/[id]/receive 로 이동
 * 익명 세션은 브라우저에만 있으므로 소유자 판별은 클라이언트에서 한다.
 */
export default function ReceiveButton({
  itemId,
  ownerId,
  status,
}: ReceiveButtonProps) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let alive = true;
    getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (alive) setIsOwner(data.user?.id === ownerId);
      });
    return () => {
      alive = false;
    };
  }, [ownerId]);

  const disabledClass =
    "w-full rounded-2xl bg-gray-200 py-4 text-base font-extrabold text-gray-400";
  const activeClass =
    "block w-full rounded-2xl bg-forest py-4 text-center text-base font-extrabold text-white shadow-[0_4px_20px_rgba(52,103,57,0.35)] transition-transform active:scale-[0.98]";

  if (status !== "available") {
    return (
      <button type="button" disabled className={disabledClass}>
        이미 나눔이 완료된 물품이에요
      </button>
    );
  }

  if (isOwner) {
    return (
      <button type="button" disabled className={disabledClass}>
        내가 등록한 물품이에요
      </button>
    );
  }

  return (
    <Link href={`/items/${itemId}/receive`} className={activeClass}>
      기부 받기
    </Link>
  );
}
