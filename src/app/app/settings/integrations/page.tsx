import { listIntegrations } from "@/lib/slideshow-data";
import { requireActiveWorkspace } from "@/lib/workspace";
import { IntegrationsClient } from "./integrations-client";
import { SITE_NAME } from "@/lib/site";

export default async function IntegrationsPage() {
  const { workspaceId, role } = await requireActiveWorkspace();
  const integrations = await listIntegrations(workspaceId);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-h2">Connections</h2>
        <div className="mt-1 text-[13px] tracking-[-0.005em] text-muted">
          Bring files and events from where they already live. {SITE_NAME} watches
          folders — you don&rsquo;t upload.
        </div>
      </section>
      <IntegrationsClient
        canManage={role === "owner"}
        integrations={integrations}
      />
    </div>
  );
}
