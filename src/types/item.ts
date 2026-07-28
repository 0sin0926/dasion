// 프론트/백엔드 공용 도메인 타입

export type CategoryKey =
  | "clothing"
  | "books"
  | "toys"
  | "sports"
  | "baby"
  | "etc";

export type ItemStatus = "available" | "matched";

export interface Item {
  id: string;
  name: string;
  /** 카테고리 키 (categories.ts의 CATEGORIES와 대응) */
  category: CategoryKey;
  /** 지역 표기 (예: "인천 연수구") */
  region: string;
  /** 물품 사진 URL. 없으면 카테고리 이모지 플레이스홀더로 대체 */
  imageUrl?: string;
  status: ItemStatus;
}
