import { ClaimClient } from "./claim-client";

export default async function ClaimDisplayPage({
  params,
}: {
  params: Promise<{ wsSlug: string; code: string }>;
}) {
  const { wsSlug, code } = await params;
  return <ClaimClient wsSlug={wsSlug} code={code.toUpperCase()} />;
}
