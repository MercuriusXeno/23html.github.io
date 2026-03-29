// Lightweight pub-sub event bus for decoupling game logic from UI.
// Game modules emit events; UI modules subscribe.

type Handler = (...args: any[]) => void;
const subs: Record<string, Handler[]> = {};

export function on(event: string, fn: Handler) { (subs[event] ||= []).push(fn); }
export function off(event: string, fn: Handler) { subs[event] = subs[event]?.filter(h => h !== fn); }
export function emit(event: string, ...args: any[]) { subs[event]?.forEach(fn => fn(...args)); }
