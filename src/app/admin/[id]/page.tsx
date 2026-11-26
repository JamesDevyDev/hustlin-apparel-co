import { EditProduct } from "@/components/admin/edit-product";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <h1 className="mb-8 text-sm uppercase tracking-[0.18em]">Edit product</h1>
      <EditProduct id={id} />
    </>
  );
}
