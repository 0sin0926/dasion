import BackHeader from "@/components/BackHeader";
import BottomNav from "@/components/BottomNav";
import AllItemsFeed from "@/components/items/AllItemsFeed";
import { getAllItems } from "@/server/items/queries";
import type { Item } from "@/types/item";

// 매 요청마다 최신 물품을 반영
export const dynamic = "force-dynamic";

/**
 * 전체 기부 물품 페이지.
 * - 기본: 모든 물품(상태 무관, 나눔 완료는 흑백 처리)
 * - ?status=completed: 나눔 완료(matched/completed)된 물품만
 * 홈 히어로 통계 박스에서 이 페이지로 이동한다.
 */
export default async function AllItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const onlyCompleted = status === "completed";

  let items: Item[] = [];
  try {
    items = await getAllItems(onlyCompleted);
  } catch (err) {
    console.error("[items] 전체 목록 조회 실패:", err);
  }

  const title = onlyCompleted ? "나눔 완료된 물품" : "전체 기부 물품";
  const emptyText = onlyCompleted
    ? "아직 나눔 완료된 물품이 없어요."
    : "등록된 물품이 아직 없어요.";

  return (
    <div className="flex flex-1 flex-col bg-page">
      <BackHeader title={title} />
      <main className="flex-1 pb-28">
        <div className="px-4 pt-4">
          <p className="text-[13px] font-bold text-ink-40">
            {onlyCompleted ? "나눔 완료" : "전체"} {items.length}건
          </p>
        </div>
        <AllItemsFeed items={items} emptyText={emptyText} />
      </main>
      <BottomNav />
    </div>
  );
}
