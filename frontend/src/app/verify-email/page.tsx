import VerifyEmailForm from "@/components/forms/VerifyEmailForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <VerifyEmailForm token={token} />
    </main>
  );
}
