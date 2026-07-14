import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/metagraphed/app-shell";
import { PageHero } from "@jsonbored/ui-kit";
import { ApiSourceFooter } from "@/components/metagraphed/api-source-footer";
import { WebhookSubscriptionManager } from "@/components/metagraphed/webhook-subscription-manager";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Developer settings — Metagraphed" },
      {
        name: "description",
        content: "Create, look up, and delete change-feed webhook subscriptions.",
      },
      { property: "og:title", content: "Developer settings — Metagraphed" },
      {
        property: "og:description",
        content: "Create, look up, and delete change-feed webhook subscriptions.",
      },
    ],
  }),
  component: SettingsPage,
});

/**
 * Utility-page family treatment (#5346): PageHero KPI strip only, matching
 * sibling routes (`/schemas`, `/health`, …). Forms below stay unchanged.
 * dense — form page; skip Share row so the strip sits closer to the title.
 */
function SettingsPage() {
  return (
    <AppShell>
      <PageHero
        dense
        eyebrow="Operations"
        title="Developer settings"
        description="Webhook subscription API — create, look up, delete. Token-gated; no account model."
        caption="settings / v1"
        kpis={[
          { label: "Create", value: "POST", hint: "token" },
          { label: "Lookup", value: "GET", hint: "by id" },
          { label: "Delete", value: "DELETE", hint: "secret" },
          { label: "Accounts", value: "None" },
        ]}
      />
      <WebhookSubscriptionManager />
      <ApiSourceFooter paths={["/api/v1/webhooks/subscriptions"]} />
    </AppShell>
  );
}
