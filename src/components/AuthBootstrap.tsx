"use client";

import { useEffect } from "react";
import { bootstrapAuth } from "@/lib/supabase/auth";

/**
 * 앱 진입 시 익명 세션 + users 프로필 행을 보장하는 부트스트랩.
 * 화면에는 아무것도 그리지 않고, 마운트 시 한 번만 실행한다.
 */
export default function AuthBootstrap() {
  useEffect(() => {
    bootstrapAuth();
  }, []);
  return null;
}
