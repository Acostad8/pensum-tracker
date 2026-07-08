import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePersistentState from "../usePersistentState";

describe("usePersistentState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("usa el valor por defecto si no hay nada guardado", () => {
    const { result } = renderHook(() => usePersistentState("k1", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("recupera el valor guardado", () => {
    localStorage.setItem("k2", JSON.stringify("guardado"));
    const { result } = renderHook(() => usePersistentState("k2", "default"));
    expect(result.current[0]).toBe("guardado");
  });

  it("persiste cambios en localStorage", () => {
    const { result } = renderHook(() => usePersistentState("k3", 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem("k3"))).toBe(42);
  });

  it("acepta función updater", () => {
    const { result } = renderHook(() => usePersistentState("k4", 1));
    act(() => result.current[1]((prev) => prev + 10));
    expect(result.current[0]).toBe(11);
  });

  it("resiste JSON corrupto en localStorage", () => {
    localStorage.setItem("k5", "{not json");
    const { result } = renderHook(() => usePersistentState("k5", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});
