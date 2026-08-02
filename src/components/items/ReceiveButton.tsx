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
  // 이 물품을 받은 사람이 나인지(내가 기부 받은 물품이면 "내가 받았어요!" 표기)
  const [isRecipient, setIsRecipient] = useState(false);

  useEffect(() => {
    let alive = true;
    const supabase = getSupabaseBrowserClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) return;
      setIsOwner(user.id === ownerId);

      // 이미 나눔된 물품이면 내가 그 수령자인지 matches 로 확인
      if (status !== "available") {
        const { data } = await supabase
          .from("matches")
          .select("id")
          .eq("item_id", itemId)
          .eq("recipient_id", user.id)
          .limit(1)
          .maybeSingle();
        if (alive && data) setIsRecipient(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ownerId, itemId, status]);

  const disabledClass =
    "w-full rounded-2xl bg-gray-200 py-4 text-base font-extrabold text-gray-400";
  const receivedClass =
    "w-full rounded-2xl bg-[#EFF7EF] py-4 text-base font-extrabold text-forest";
  const activeClass =
    "block w-full rounded-2xl bg-forest py-4 text-center text-base font-extrabold text-white shadow-[0_4px_20px_rgba(52,103,57,0.35)] transition-transform active:scale-[0.98]";

  if (status !== "available") {
    // 내가 받은 물품이면 완료 문구 대신 받았음을 반갑게 표시
    if (isRecipient) {
      return (
        <button type="button" disabled className={receivedClass}>
          내가 받았어요! 🎁
        </button>
      );
    }
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
