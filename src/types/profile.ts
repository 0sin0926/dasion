import type { Item } from "./item";

// users.role 과 일치 (admin 은 UI 편집 대상 아님)
export type UserRole =
  | "donor_child"
  | "donor_parent"
  | "recipient_child"
  | "admin";

/** 마이페이지 프로필 (users 테이블 1:1) */
export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  region: string | null;
  avatarUrl: string | null;
}

// matches.status 와 일치
export type MatchStatus = "pending" | "confirmed" | "completed";

/** 내가 받은 물품 = 매칭 정보 + 물품 요약 */
export interface ReceivedItem {
  matchId: string;
  matchStatus: MatchStatus;
  matchedAt: string;
  item: Item;
}
