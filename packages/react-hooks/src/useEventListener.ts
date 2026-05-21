import { useRef, useEffect } from 'react';

/**
 * Executes a handler function when a dom event gets triggered
 * Usage: useEventListener("mousemove", handler);
 * @param domEvent dom event to trigger the handler function i.e. mousemove
 * @param handler Handler function to execute
 * @param element Optional target element to set event listener on. Default is window.
 */
export default function useEventListener(
  domEvent: keyof WindowEventMap | string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window
) {
  const savedHandler = useRef<((e: Event) => void) | undefined>(undefined);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler, savedHandler]);

  useEffect(() => {
    if (!element?.addEventListener) {
      return;
    }

    const eventListener = (event: Event) => {
      if (savedHandler?.current) {
        savedHandler.current(event);
      }
    };
    element.addEventListener(domEvent, eventListener);

    return () => {
      element.removeEventListener(domEvent, eventListener);
    };
  }, [domEvent, element]);
}
