'use client';
import { useLazyRef } from './useLazyRef';
import { useOnMount } from './useOnMount';

export class Timeout {
  static create() {
    return new Timeout();
  }

  currentId: ReturnType<typeof setTimeout> | null = null;

  fn: Function | null = null;

  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(delay: number, fn: Function) {
    this.clear();
    this.fn = fn;
    this.currentId = setTimeout(() => {
      this.currentId = null;
      this.fn = null;
      fn();
    }, delay);
  }

  clear = () => {
    if (this.currentId !== null) {
      clearTimeout(this.currentId);
      this.currentId = null;
      this.fn = null;
    }
  };

  disposeEffect = (runOnDispose = false) => {
    if (runOnDispose && this.currentId !== null && this.fn !== null) {
      this.fn();
    }
    return this.clear();
  };
}

export function useTimeout(props?: { runOnDispose?: boolean }) {
  const timeout = useLazyRef(Timeout.create).current;

  useOnMount(() => () => timeout.disposeEffect(props?.runOnDispose));

  return timeout;
}
