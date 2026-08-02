import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types/notification";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

function toNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  };
}

/** 내 알림 목록(최신순). notifications_select_own RLS(본인 것만) 충족. */
export async function getMyNotifications(
  userId: string,
): Promise<AppNotification[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as NotificationRow[]).map(toNotification);
}

/** 안 읽은 알림 개수(배지/배너 표시용). */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

/** 내 알림을 모두 읽음 처리. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}
