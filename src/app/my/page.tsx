"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import MyItemCard from "@/components/my/MyItemCard";
import { bootstrapAuth } from "@/lib/supabase/auth";
import { getMyProfile, updateProfile } from "@/lib/profile/profile";
import { uploadAvatar } from "@/lib/profile/uploadAvatar";
import { getMyDonations } from "@/lib/items/getMyDonations";
import { getMyReceived } from "@/lib/matches/getMyReceived";
import {
  SIDO_LIST,
  getSigungu,
  parseRegion,
  formatRegion,
} from "@/lib/regions";
import type { Item, ItemStatus } from "@/types/item";
import type { MatchStatus, Profile, ReceivedItem, UserRole } from "@/types/profile";

type BadgeTone = "green" | "amber" | "gray";

const ROLE_LABEL: Record<UserRole, string> = {
  donor_child: "기부 아동",
  donor_parent: "기부자(부모)",
  recipient_child: "수혜 아동",
  admin: "관리자",
};

// 편집 가능한 역할(관리자 제외)
const ROLE_OPTIONS: UserRole[] = ["donor_parent", "donor_child", "recipient_child"];

const ITEM_BADGE: Record<ItemStatus, { label: string; tone: BadgeTone }> = {
  available: { label: "나눔 중", tone: "green" },
  matched: { label: "매칭됨", tone: "amber" },
  completed: { label: "나눔 완료", tone: "gray" },
};

const MATCH_BADGE: Record<MatchStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "수거 대기", tone: "amber" },
  confirmed: { label: "수거 확정", tone: "green" },
  completed: { label: "완료", tone: "gray" },
};

export default function MyPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Item[]>([]);
  const [received, setReceived] = useState<ReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"donated" | "received">("donated");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const uid = await bootstrapAuth();
      if (!uid || !alive) {
        if (alive) setLoading(false);
        return;
      }
      setUserId(uid);
      const [p, d, r] = await Promise.all([
        getMyProfile(uid),
        getMyDonations(uid),
        getMyReceived(uid),
      ]);
      if (!alive) return;
      setProfile(p);
      setDonations(d);
      setReceived(r);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <main className="flex-1 pb-28">
        <header className="sticky top-0 z-30 bg-page/95 px-5 pt-5 pb-3 backdrop-blur">
          <h1 className="text-[22px] font-extrabold text-ink">내 정보</h1>
        </header>

        {loading ? (
          <p className="px-5 py-16 text-center text-[14px] text-ink-40">
            불러오는 중이에요…
          </p>
        ) : (
          <div className="space-y-5 px-4">
            {/* 프로필 카드 */}
            {profile && userId && (
              <ProfileCard
                profile={profile}
                editing={editing}
                onEdit={() => setEditing(true)}
                onCancel={() => setEditing(false)}
                onSaved={(next) => {
                  setProfile(next);
                  setEditing(false);
                }}
                userId={userId}
              />
            )}

            {/* 탭 */}
            <div className="flex gap-2 rounded-2xl bg-chip/60 p-1">
              <TabBtn active={tab === "donated"} onClick={() => setTab("donated")}>
                기부한 {donations.length}
              </TabBtn>
              <TabBtn active={tab === "received"} onClick={() => setTab("received")}>
                받은 {received.length}
              </TabBtn>
            </div>

            {/* 목록 */}
            {tab === "donated" ? (
              donations.length === 0 ? (
                <EmptyState emoji="🎁" text="아직 기부한 물품이 없어요." />
              ) : (
                <div className="space-y-2.5">
                  {donations.map((item) => (
                    <MyItemCard
                      key={item.id}
                      item={item}
                      badge={ITEM_BADGE[item.status]}
                      editable
                    />
                  ))}
                </div>
              )
            ) : received.length === 0 ? (
              <EmptyState emoji="💝" text="아직 받은 물품이 없어요." />
            ) : (
              <div className="space-y-2.5">
                {received.map((r) => (
                  <MyItemCard
                    key={r.matchId}
                    item={r.item}
                    badge={MATCH_BADGE[r.matchStatus]}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl py-2 text-[14px] font-bold transition-colors ${
        active ? "bg-white text-forest shadow-sm" : "text-ink-40"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="text-[13px] text-ink-40">{text}</p>
    </div>
  );
}

function ProfileCard({
  profile,
  userId,
  editing,
  onEdit,
  onCancel,
  onSaved,
}: {
  profile: Profile;
  userId: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: (next: Profile) => void;
}) {
  const initial = parseRegion(profile.region);
  const [name, setName] = useState(profile.name);
  const [sido, setSido] = useState(initial.sido);
  const [sigungu, setSigungu] = useState(initial.sigungu);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사진: 새로 고른 파일 + 로컬 미리보기 URL, 선택 메뉴 표시 여부
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatarUrl,
  );
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 편집 진입 시 현재 값으로 초기화
  useEffect(() => {
    if (editing) {
      const p = parseRegion(profile.region);
      setName(profile.name);
      setSido(p.sido);
      setSigungu(p.sigungu);
      setRole(profile.role);
      setAvatarFile(null);
      setAvatarPreview(profile.avatarUrl);
      setShowPhotoMenu(false);
      setError(null);
    }
  }, [editing, profile]);

  const sigunguOptions = getSigungu(sido);

  function handlePickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAvatarFile(file);
    setShowPhotoMenu(false);
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      // 새 사진을 골랐으면 먼저 업로드
      let avatarUrl: string | null | undefined;
      if (avatarFile) avatarUrl = await uploadAvatar(userId, avatarFile);

      const region = formatRegion(sido, sigungu) || null;
      await updateProfile(userId, { name, region, role, avatarUrl });
      onSaved({
        ...profile,
        name: name.trim(),
        region,
        role,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : profile.avatarUrl,
      });
    } catch {
      setError("저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <section className="rounded-[24px] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-chip text-2xl">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage 원격 URL
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "🙂"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-extrabold text-ink">{profile.name}</p>
            <p className="mt-0.5 text-[13px] font-medium text-ink-40">
              {ROLE_LABEL[profile.role]} · {profile.region || "지역 미설정"}
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-xl border border-forest/30 px-3 py-1.5 text-[13px] font-bold text-forest"
          >
            편집
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-[24px] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <h2 className="text-[16px] font-bold text-ink">프로필 편집</h2>

      {/* 프로필 사진 */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-chip text-3xl">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- 로컬 미리보기(objectURL) 또는 Storage URL
            <img
              src={avatarPreview}
              alt="프로필 미리보기"
              className="h-full w-full object-cover"
            />
          ) : (
            "🙂"
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePickPhoto}
        />

        {!showPhotoMenu ? (
          <button
            type="button"
            onClick={() => setShowPhotoMenu(true)}
            className="rounded-xl border border-forest/30 px-4 py-2 text-[13px] font-bold text-forest"
          >
            사진 등록하기
          </button>
        ) : (
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-forest bg-[#EFF7EF] px-4 py-2.5 text-[13px] font-bold text-forest"
            >
              📷 사진 올리기
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl border border-line bg-gray-50 px-4 py-2.5 text-[13px] font-bold text-gray-400"
            >
              ✨ 나만의 캐릭터 만들기 (준비 중)
            </button>
          </div>
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-[13px] font-bold text-ink-60">이름</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해주세요"
          className="w-full rounded-xl bg-[#F3F4F3] px-4 py-3 text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-forest"
        />
      </label>

      <div className="space-y-1">
        <span className="text-[13px] font-bold text-ink-60">지역</span>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={sido}
            onChange={(e) => {
              setSido(e.target.value);
              setSigungu("");
            }}
            className="w-full rounded-xl bg-[#F3F4F3] px-3 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="">시/도 선택</option>
            {SIDO_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={sigungu}
            onChange={(e) => setSigungu(e.target.value)}
            disabled={!sido || sigunguOptions.length === 0}
            className="w-full rounded-xl bg-[#F3F4F3] px-3 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest disabled:opacity-50"
          >
            <option value="">
              {sido && sigunguOptions.length === 0 ? "해당 없음" : "시/군/구 선택"}
            </option>
            {sigunguOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[13px] font-bold text-ink-60">역할</span>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border py-2.5 text-[12px] font-bold transition-colors ${
                role === r
                  ? "border-forest bg-[#EFF7EF] text-forest"
                  : "border-[#D1D5DB] bg-white text-gray-600"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-[13px] font-medium text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-xl border border-line py-3 text-[14px] font-bold text-ink-40 disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-[2] rounded-xl bg-forest py-3 text-[14px] font-bold text-white disabled:opacity-60"
        >
          {saving ? "저장 중…" : "저장하기"}
        </button>
      </div>
    </section>
  );
}
