import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { bootstrapAuth } from "@/lib/supabase/auth";
import type { CategoryKey } from "@/types/item";

export interface RegisterItemInput {
  name: string;
  category: CategoryKey;
  /** 물품 설명 (지금은 직접 입력, 이후 STT 변환 결과) */
  description: string;
  /** 기부자 편지 (선택) */
  letter: string;
  /** 업로드할 사진 (최대 5장) */
  photos: File[];
}

const PHOTO_BUCKET = "item-photos";

/**
 * 물품을 등록한다(클라이언트에서 익명 세션으로 직접 수행 → RLS 충족).
 * 1) 세션/프로필 보장 → 2) 사진 Storage 업로드 → 3) items insert → 4) 편지 insert
 * 반환: 생성된 item id
 */
export async function registerItem(input: RegisterItemInput): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  const userId = await bootstrapAuth();
  if (!userId) {
    throw new Error(
      "로그인 세션을 만들 수 없어요. 잠시 후 다시 시도해주세요. (익명 로그인 설정 확인 필요)",
    );
  }

  // 1. 사진 업로드 → 공개 URL 수집
  const photoUrls: string[] = [];
  for (const file of input.photos.slice(0, 5)) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    photoUrls.push(pub.publicUrl);
  }

  // 2. items insert
  const { data: item, error: itemErr } = await supabase
    .from("items")
    .insert({
      owner_id: userId,
      category: input.category,
      name: input.name.trim(),
      description: input.description.trim() || null,
      photo_urls: photoUrls,
    })
    .select("id")
    .single();
  if (itemErr) throw itemErr;

  // 3. 기부자 편지(있을 때만) insert
  if (input.letter.trim()) {
    const { error: letterErr } = await supabase.from("letters").insert({
      item_id: item.id,
      author_id: userId,
      type: "donor_letter",
      content: input.letter.trim(),
    });
    if (letterErr) throw letterErr;
  }

  return item.id as string;
}
