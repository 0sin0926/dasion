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
  /** 택배 배송용 상세 주소(도로명/상세) */
  address: string | null;
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

/** 기부자가 받은 감사편지 = 수혜자 답장(recipient_reply) + 물품/보낸 사람 요약 */
export interface ReceivedLetter {
  id: string;
  content: string;
  createdAt: string;
  /** 편지를 보낸 수혜자 이름 (프로필 미설정 시 null) */
  senderName: string | null;
  item: Item;
}
