import type { CategoryKey } from "@/types/item";

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  /** 이모지 플레이스홀더 배경 틴트 */
  tint: string;
}

// 기획서 P0 카테고리 (전체/의류/도서·문구류/장난감/스포츠/유아용/기타)
export const CATEGORIES: Category[] = [
  { key: "clothing", label: "의류", emoji: "👕", tint: "#EAF1FB" },
  { key: "books", label: "도서 및 문구류", emoji: "📚", tint: "#EAF6EE" },
  { key: "toys", label: "장난감", emoji: "🧸", tint: "#FBF1E6" },
  { key: "sports", label: "스포츠", emoji: "⚽", tint: "#EDEFF2" },
  { key: "baby", label: "유아용", emoji: "🍼", tint: "#FBEEF2" },
  { key: "etc", label: "기타", emoji: "📦", tint: "#F1EEE9" },
];

export const CATEGORY_MAP: Record<CategoryKey, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<CategoryKey, Category>;

/** 필터 바에 쓰는 "전체" 포함 목록 */
export const FILTER_OPTIONS: { key: CategoryKey | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  ...CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
];
