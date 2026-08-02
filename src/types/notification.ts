/** 알림 종류 (notifications.type) */
export type NotificationType =
  | "donation_pickup" // 기부자: 기사님 수거 방문 안내
  | "delivery_incoming" // 수령자: 곧 택배 배송 안내
  | "letter_received"; // 기부자: 감사 편지 도착

/** 앱 내 알림 한 건 (notifications 테이블 1:1) */
export interface AppNotification {
  id: string;
  type: NotificationType | string;
  title: string;
  body: string | null;
  /** 탭하면 이동할 앱 내 경로(없을 수 있음) */
  link: string | null;
  read: boolean;
  createdAt: string;
}
