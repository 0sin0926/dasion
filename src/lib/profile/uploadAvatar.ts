import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";

/**
 * 프로필 사진을 Storage(avatars 버킷)에 올리고 공개 URL을 반환한다.
 * (users.avatar_url 갱신은 updateProfile 에서 함께 처리)
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
