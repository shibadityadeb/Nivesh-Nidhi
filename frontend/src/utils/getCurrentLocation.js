export async function getCurrentLocation() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("Geolocation is not available in this environment.");
  }

  if (!window.isSecureContext) {
    throw new Error("Geolocation requires HTTPS (or localhost).");
  }

  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location access is mandatory for login."));
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject(new Error("Unable to fetch location within 10 seconds. Please try again."));
          return;
        }

        reject(new Error("Unable to fetch your current location. Please try again."));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
