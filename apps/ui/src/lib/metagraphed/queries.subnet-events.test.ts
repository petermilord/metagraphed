import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiResult } from "./client";
import { apiFetch } from "./client";
import { subnetEventsQuery } from "./queries";

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return { ...actual, apiFetch: vi.fn() };
});

const mockedApiFetch = vi.mocked(apiFetch);

function resolveWith(data: unknown): void {
  mockedApiFetch.mockResolvedValue({
    data,
    meta: {} as ApiResult<unknown>["meta"],
    url: "/api/v1/subnets/21/events",
  });
}

async function runQuery(netuid: number, kind?: string) {
  const opts = subnetEventsQuery(netuid, kind);
  if (!opts.queryFn) throw new Error("expected a queryFn");
  return opts.queryFn({
    signal: new AbortController().signal,
    queryKey: opts.queryKey,
    meta: undefined,
  } as unknown as Parameters<NonNullable<typeof opts.queryFn>>[0]);
}

describe("subnetEventsQuery", () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it("defaults to limit=100 with no kind filter", async () => {
    resolveWith({ event_count: 0, events: [] });
    await runQuery(21);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      "/api/v1/subnets/21/events",
      expect.objectContaining({ params: { limit: 100 } }),
    );
  });

  it("forwards an optional kind param alongside limit", async () => {
    resolveWith({ event_count: 0, events: [] });
    await runQuery(21, "StakeAdded");
    expect(mockedApiFetch).toHaveBeenCalledWith(
      "/api/v1/subnets/21/events",
      expect.objectContaining({ params: { limit: 100, kind: "StakeAdded" } }),
    );
  });

  it("includes kind in the query key so filters cache separately", () => {
    expect(subnetEventsQuery(21).queryKey).toContain("subnet-events");
    expect(subnetEventsQuery(21).queryKey).toContain(21);
    expect(subnetEventsQuery(21).queryKey).toContain(null);
    expect(subnetEventsQuery(21, "WeightsSet").queryKey).toContain("WeightsSet");
    expect(subnetEventsQuery(21, "WeightsSet").queryKey).not.toContain(null);
  });

  it("normalizes a well-formed events payload", async () => {
    resolveWith({
      event_count: 1,
      events: [
        {
          block_number: 100,
          event_index: 0,
          event_kind: "StakeAdded",
          hotkey: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          amount_tao: 1.5,
          observed_at: "2026-07-10T00:00:00Z",
        },
      ],
    });
    const res = await runQuery(7, "StakeAdded");
    expect(res.data.netuid).toBe(7);
    expect(res.data.event_count).toBe(1);
    expect(res.data.events).toHaveLength(1);
    expect(res.data.events[0]?.event_kind).toBe("StakeAdded");
  });
});
