import { useEffect, useState } from "react";
import { toastListeners as listeners } from "../lib/toast";

/** One polite live region for short confirmations. */
export default function Toaster() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let t;
    const on = (m) => {
      setMsg(m);
      clearTimeout(t);
      t = setTimeout(() => setMsg(""), 2200);
    };
    listeners.add(on);
    return () => {
      listeners.delete(on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[400] flex justify-center">
      <p
        className={`clay-pastel rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-on-pastel transition-all duration-300 ease-[var(--ease-out)] ${
          msg ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {msg || " "}
      </p>
    </div>
  );
}
