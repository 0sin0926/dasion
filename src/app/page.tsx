import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import ItemFeed from "@/components/home/ItemFeed";
import DonateCta from "@/components/home/DonateCta";
import BottomNav from "@/components/BottomNav";
import { MOCK_ITEMS } from "@/server/mock/items";

export default function Home() {
  // TODO: Supabase `items` 테이블 연동 시 MOCK_ITEMS 대신 서버 조회로 교체
  const items = MOCK_ITEMS;

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
