import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { bootstrapAuth } from "@/lib/supabase/auth";
import type { CategoryKey } from "@/types/item";

export interface UpdateItemInput {
  itemId: string;
  name: string;
  category: CategoryKey;
  description: string;
  /** 순서 유지 배열: string=기존 사진 URL(그대로 유지), File=새로 추가한 사진 */
  photos: (string | File)[];
}

const PHOTO_BUCKET = "item-photos";

/**
 * 내가 등록한 물품을 수정한다(클라이언트, 익명 세션 → RLS items_update_own 충족).
 * 사진은 기존 URL은 유지하고 새 File 만 Storage에 올려 최종 photo_urls 로 교체한다.
 */
export async function updateItem(input: UpdateItemInput): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  const userId = await bootstrapAuth();
  if (!userId) {
    throw new Error("로그인 세션을 만들 수 없어요. 잠시 후 다시 시도해주세요.");
  }

  // 사진: 기존 URL은 그대로, 새 파일만 업로드해서 순서대로 최종 목록 구성
  const photoUrls: string[] = [];
  for (const p of input.photos.slice(0, 5)) {
    if (typeof p === "string") {
      photoUrls.push(p);
      continue;
    }
    const ext = p.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, p, { upsert: false, contentType: p.type });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    photoUrls.push(pub.publicUrl);
  }

  const { error } = await supabase
    .from("items")
    .update({
      name: input.name.trim(),
      category: input.category,
      description: input.description.trim() || null,
      photo_urls: photoUrls,
    })
    .eq("id", input.itemId)
    .eq("owner_id", userId); // 방어적: 본인 소유만
  if (error) throw error;
}
