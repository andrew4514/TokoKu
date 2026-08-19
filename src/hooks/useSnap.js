import { useEffect, useState } from "react";

export const useSnap = () => {
  const [snap, setSnap] = useState(null);

  useEffect(() => {
    // Sandbox URL Snap JS
    const snapScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    let script = document.querySelector(`script[src="${snapScriptUrl}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = snapScriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }

    script.onload = () => {
      setSnap(window.snap);
    };
  }, []);

  const snapEmbed = (snapToken, actionCallbacks) => {
    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: (result) => actionCallbacks.onSuccess(result),
        onPending: (result) => actionCallbacks.onPending(result),
        onError: (result) => actionCallbacks.onError(result),
        onClose: () => actionCallbacks.onClose(),
      });
    }
  };

  return { snapEmbed };
};
