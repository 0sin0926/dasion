// 물품 등록 가이드 도우미가 아이에게 던지는 질문 세트.
// 모두 아이에게 하는 반말. getQuestions(category)로 공통 + 카테고리 전용을 합쳐 반환한다.

import type { CategoryKey } from "@/types/item";

export interface RegisterQuestion {
  id: string;
  text: string;
  hint?: string; // 예시 보기(있으면 질문 아래 작게 표시)
}

const COMMON_OPENING: RegisterQuestion[] = [
  { id: "what", text: "이건 무슨 물건이야?" },
  { id: "color", text: "무슨 색깔이야?" },
  { id: "from", text: "누가 사줬어? 아니면 어디서 났어?" },
];

const COMMON_CLOSING: RegisterQuestion[] = [
  { id: "why", text: "왜 친구한테 나눠주고 싶어?" },
  { id: "who", text: "어떤 친구가 쓰면 좋겠어?" },
];

const BY_CATEGORY: Record<CategoryKey, RegisterQuestion[]> = {
  clothing: [
    { id: "pattern", text: "무슨 그림이나 무늬가 있어?", hint: "줄무늬, 꽃무늬, 단추, 캐릭터…" },
    { id: "age", text: "몇 살 때 입었어?" },
    { id: "season", text: "여름 옷이야, 겨울 옷이야?" },
  ],
  books: [
    { id: "story", text: "무슨 이야기야?" },
    { id: "fun", text: "제일 재밌었던 부분이 뭐야?" },
    { id: "kind", text: "그림책이야, 글자책이야?" },
  ],
  toys: [
    { id: "play", text: "어떻게 갖고 노는 거야?" },
    { id: "soundlight", text: "소리나 불빛이 나?" },
    { id: "parts", text: "부품이 다 있어? 건전지 필요해?" },
  ],
  sports: [
    { id: "use", text: "무슨 운동에 쓰는 거야?" },
    { id: "where", text: "안에서 써, 밖에서 써?" },
    { id: "size", text: "크기가 어때? 커, 작아?" },
  ],
  baby: [
    { id: "age", text: "아기 몇 살 때 썼어?" },
    { id: "use", text: "어떻게 쓰는 거야?" },
    { id: "look", text: "색깔이나 그림이 어때?" },
  ],
  etc: [
    { id: "use", text: "이건 어떻게 쓰는 거야?" },
    { id: "look", text: "무슨 색이고 어떻게 생겼어?" },
  ],
};

export function getQuestions(category?: CategoryKey | null): RegisterQuestion[] {
  const specific = category ? (BY_CATEGORY[category] ?? []) : [];
  return [...COMMON_OPENING, ...specific, ...COMMON_CLOSING];
}
