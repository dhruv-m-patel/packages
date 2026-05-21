import { useState, useEffect, useCallback, useRef } from 'react';

type GeolocationState = GeolocationCoordinates | GeolocationPositionError;

/**
 * A custom hook to use current geolocation available when component mounts
 * usage: const { latitude, longitude } = useGeolocation();
 * @returns geolocation coordinates available from window.event.coords
 */
export default function useGeolocation() {
  const [state, setState] = useState<GeolocationState | undefined>(undefined);
  const mountedRef = useRef<boolean>(true);
  const watchIdRef = useRef<number | undefined>(undefined);

  const onEvent = useCallback((event: GeolocationPosition) => {
    if (mountedRef.current) {
      setState(event.coords);
    }
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    setState(error);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    navigator.geolocation.getCurrentPosition(onEvent, onError);
    watchIdRef.current = navigator.geolocation.watchPosition(onEvent, onError);

    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== undefined) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onEvent, onError]);

  return state;
}
