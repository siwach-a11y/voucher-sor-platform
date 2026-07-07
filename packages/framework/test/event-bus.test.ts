import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src/core/events/event-bus.js";

describe("EventBus", () => {
  it("delivers a published event to a subscribed listener", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on("execution.started", listener);
    bus.publish({ type: "execution.started", message: "hello" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]![0]).toMatchObject({ type: "execution.started", message: "hello" });
  });

  it("stamps every published event with a timestamp", () => {
    const bus = new EventBus();
    let received: { timestamp: string } | undefined;
    bus.on("execution.completed", (event) => {
      received = event;
    });
    bus.publish({ type: "execution.completed", message: "done" });
    expect(received?.timestamp).toBeDefined();
  });

  it("does not deliver events of a different type", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on("execution.started", listener);
    bus.publish({ type: "execution.failed", message: "nope" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribe stops further delivery", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    const unsubscribe = bus.on("execution.started", listener);
    unsubscribe();
    bus.publish({ type: "execution.started", message: "hello" });
    expect(listener).not.toHaveBeenCalled();
  });
});
