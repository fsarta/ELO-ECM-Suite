import { describe, expect, it } from "vitest";
import { formatBytes, formatRelativeDate } from "./formatters";

describe("formatters", () => {
  it("formats bytes into readable units", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024 * 2)).toBe("2.0 MB");
  });

  it("formats relative dates", () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const result = formatRelativeDate(tenMinutesAgo);
    expect(result).toMatch(/m ago$/);
  });
});

