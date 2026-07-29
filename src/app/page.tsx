import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import ItemFeed from "@/components/home/ItemFeed";
import DonateCta from "@/components/home/DonateCta";
import BottomNav from "@/components/BottomNav";
import { getItems } from "@/server/items/queries";
import type { Item } from "@/types/item";

export default async function Home() {
  // Supabase `items` 테이블에서 나눔 대기 물품을 조회.
  // 조회 실패(환경변수 누락/네트워크)여도 화면이 통째로 깨지지 않도록 빈 목록으로 대체.
  let items: Item[] = [];
  try {
    items = await getItems();
  } catch (err) {
    console.error("[home] getItems 실패:", err);
  }

  return (
    <>
      {/* 하단 탭 네비게이션에 가리지 않도록 pb 확보 */}
      <main className="flex-1 pb-28">
        <HomeHeader />
        <HeroSection />
        <ItemFeed items={items} />
        <DonateCta />
      </main>
      <BottomNav />
    </>
  );
}
