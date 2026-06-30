import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { analyzePdfs } from "../api";

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe("analyzePdfs", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("envía FormData con pensum e historial", async () => {
    fetch.mockResolvedValue(mockResponse(200, { ok: true }));
    const pensum = new File(["x"], "p.pdf", { type: "application/pdf" });
    const historial = new File(["y"], "h.pdf", { type: "application/pdf" });

    await analyzePdfs(pensum, historial);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/api/analyze");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.body.get("pensum")).toBe(pensum);
    expect(opts.body.get("historial")).toBe(historial);
  });

  it("retorna el JSON parseado en éxito", async () => {
    const data = { estadisticas: { creditos_aprobados: 50 } };
    fetch.mockResolvedValue(mockResponse(200, data));
    const result = await analyzePdfs(
      new File(["x"], "p.pdf"),
      new File(["y"], "h.pdf"),
    );
    expect(result).toEqual(data);
  });

  it("lanza con el detail del backend en error", async () => {
    fetch.mockResolvedValue(
      mockResponse(400, { detail: "Archivos invertidos" }),
    );
    await expect(
      analyzePdfs(new File(["x"], "p.pdf"), new File(["y"], "h.pdf")),
    ).rejects.toThrow("Archivos invertidos");
  });

  it("usa mensaje genérico si el body no es JSON", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });
    await expect(
      analyzePdfs(new File(["x"], "p.pdf"), new File(["y"], "h.pdf")),
    ).rejects.toThrow("Error 500");
  });
});
