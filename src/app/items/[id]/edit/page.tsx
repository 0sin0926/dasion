import { notFound } from "next/navigation";
import { getItemById } from "@/server/items/queries";
import EditItemForm from "@/components/items/EditItemForm";

// Next 16: params 는 Promise → await 로 읽는다
export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);
  if (!item) notFound();

  return (
    <EditItemForm
      itemId={item.id}
      ownerId={item.ownerId}
      initialName={item.name}
      initialCategory={item.category}
      initialDescription={item.description ?? ""}
      initialPhotoUrls={item.photoUrls}
    />
  );
}
