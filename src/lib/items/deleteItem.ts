import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * 내가 등록한 물품을 삭제한다(클라이언트, 세션 기준).
 * RLS `items_delete_own`(auth.uid() = owner_id)로 본인 물품만 지워진다.
 * FK on delete cascade 로 연결된 matches/letters 도 함께 삭제된다.
 * (Storage 사진 파일은 남지만 데모 범위에선 무시)
 */
export async function deleteItem(itemId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) throw error;
}
