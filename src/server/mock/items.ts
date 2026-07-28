import type { Item } from "@/types/item";

/**
 * 홈 피드용 Mock 데이터.
 * Supabase `items` 테이블 연동 전까지 화면 구현/배포에 사용.
 * 실제 연동 시 이 파일을 서버 조회 함수로 교체.
 */
export const MOCK_ITEMS: Item[] = [
  { id: "1", name: "소라색 내의", category: "clothing", region: "인천 연수구", status: "available" },
  { id: "2", name: "아기책", category: "books", region: "경기도 김포시", status: "available" },
  { id: "3", name: "노란색 양말", category: "clothing", region: "서울 중구", status: "available" },
  { id: "4", name: "귀여운 양말", category: "clothing", region: "전남 담양군", status: "available" },
  { id: "5", name: "유아용 카시트", category: "baby", region: "서울 강서구", status: "available" },
  { id: "6", name: "곰인형", category: "toys", region: "인천 미추홀구", status: "available" },
  { id: "7", name: "그림 동화책", category: "books", region: "경기도 성남시", status: "available" },
  { id: "8", name: "축구공", category: "sports", region: "부산 해운대구", status: "available" },
  { id: "9", name: "블록 장난감", category: "toys", region: "대전 유성구", status: "available" },
];

/** 홈 상단 커뮤니티 통계 위젯 값 (P1 — 지금은 Mock 집계) */
export const MOCK_STATS = {
  donated: 890, // 기부된 물품
  families: 547, // 참여 가정
  completed: 678, // 나눔 완료
};
