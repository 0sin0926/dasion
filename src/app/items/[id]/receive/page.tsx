import { notFound } from "next/navigation";
import { getItemById } from "@/server/items/queries";
import { CATEGORY_MAP } from "@/lib/categories";
import ReceiveForm from "@/components/items/ReceiveForm";
import LoginGate from "@/components/LoginGate";

// Next 16: params 는 Promise → await 로 읽는다
export default async function ReceiveItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);
  if (!item) notFound();

  const cat = CATEGORY_MAP[item.category];

  return (
    <LoginGate message="기부를 받으려면 구글 로그인이 필요해요.">
      <ReceiveForm
        itemId={item.id}
        itemName={item.name}
        emoji={cat.emoji}
        tint={cat.tint}
        imageUrl={item.photoUrls[0]}
      />
    </LoginGate>
  );
}
