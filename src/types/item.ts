// 프론트/백엔드 공용 도메인 타입

export type CategoryKey =
  | "clothing"
  | "books"
  | "toys"
  | "sports"
  | "baby"
  | "etc";

// 스키마 items.status 와 일치 (available: 나눔 대기, matched: 매칭됨, completed: 나눔 완료)
export type ItemStatus = "available" | "matched" | "completed";

/** 피드 카드용 요약 정보 */
export interface Item {
  id: string;
  name: string;
  /** 카테고리 키 (categories.ts의 CATEGORIES와 대응) */
  category: CategoryKey;
  /** 지역 표기 (예: "인천 연수구") */
  region: string;
  /** 대표 사진 URL(첫 장). 없으면 카테고리 이모지 플레이스홀더로 대체 */
  imageUrl?: string;
  status: ItemStatus;
}

/** 물품 상세 화면용 (피드 요약 + 상세 필드) */
export interface ItemDetail extends Item {
  /** 소유자(등록자) UUID — 본인 물품 여부 판단(기부 받기 버튼 제어)용 */
  ownerId: string;
  /** 음성 설명을 STT 변환한 텍스트 */
  description: string | null;
  /** 업로드된 사진 URL 목록(최대 5장) */
  photoUrls: string[];
  /** 원본 음성 파일 URL */
  voiceUrl: string | null;
  /** 등록자(기부 아동/부모) 이름 */
  ownerName: string;
  createdAt: string;
  /** 기부자가 함께 남긴 편지 본문(있을 때만) */
  donorLetter: string | null;
  /** 수혜자가 보낸 감사 편지 본문(나눔 성사 후, 있을 때만) */
  recipientReply: string | null;
}
