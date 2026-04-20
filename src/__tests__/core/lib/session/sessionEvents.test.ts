import { onSessionExpired, emitSessionExpired } from '@core/lib/session/sessionEvents';

describe('sessionEvents', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset module state between tests by re-importing
    jest.resetModules();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call listener when emitSessionExpired is called', () => {
    const { onSessionExpired, emitSessionExpired } = require('@core/lib/session/sessionEvents');
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    emitSessionExpired();

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('should not call listener after unsubscribe', () => {
    const { onSessionExpired, emitSessionExpired } = require('@core/lib/session/sessionEvents');
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    unsubscribe();
    emitSessionExpired();

    expect(listener).not.toHaveBeenCalled();
  });

  it('should support multiple listeners', () => {
    const { onSessionExpired, emitSessionExpired } = require('@core/lib/session/sessionEvents');
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    onSessionExpired(listener1);
    onSessionExpired(listener2);

    emitSessionExpired();

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should deduplicate calls within 5 seconds', () => {
    const { onSessionExpired, emitSessionExpired } = require('@core/lib/session/sessionEvents');
    const listener = jest.fn();
    onSessionExpired(listener);

    emitSessionExpired();
    emitSessionExpired();
    emitSessionExpired();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should allow emit again after 5 second cooldown', () => {
    const { onSessionExpired, emitSessionExpired } = require('@core/lib/session/sessionEvents');
    const listener = jest.fn();
    onSessionExpired(listener);

    emitSessionExpired();
    expect(listener).toHaveBeenCalledTimes(1);

    // Advance past the 5 second dedup window
    jest.advanceTimersByTime(6000);

    emitSessionExpired();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
