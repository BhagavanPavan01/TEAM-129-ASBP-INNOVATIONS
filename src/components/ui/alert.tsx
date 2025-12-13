"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, XCircle } from "lucide-react";

export default function Dashboard() {
  const [searchCity, setSearchCity] = useState(""); // 🔥 single source
  const lastToastId = useRef<string | null>(null);

  /* ---------------------------
     Trigger Critical Alert
  ---------------------------- */
  const triggerCriticalAlert = () => {
    if (!searchCity.trim()) return;

    const alertId = crypto.randomUUID();

    if (lastToastId.current === alertId) return;
    lastToastId.current = alertId;

    toast.custom(
      (t) => (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500 bg-[#120b0e] text-red-400 shadow-lg">
          <XCircle className="w-5 h-5 mt-0.5" />

          <div className="flex-1">
            <p className="font-semibold text-red-500">
              CRITICAL: Flood Warning
            </p>
            <p className="text-sm">
              Heavy rainfall expected. Flash flood risk in low-lying areas.
            </p>

            {/* ✅ DYNAMIC LOCATION */}
            <p className="text-xs opacity-80 mt-1">
              📍 {searchCity}
            </p>
          </div>

          <button
            onClick={() => toast.dismiss(t)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Acknowledge
          </button>
        </div>
      ),
      {
        duration: 10000,
        position: "top-right",
      }
    );
  };

  /* ---------------------------
     UI
  ---------------------------- */
  return (
    <div className="p-6 space-y-4 max-w-xl">
      {/* Search Input */}
      <input
        value={searchCity}
        onChange={(e) => setSearchCity(e.target.value)}
        placeholder="Search city..."
        className="w-full h-10 rounded-md px-3 bg-[#0f172a] text-white border"
      />

      {/* Analyze Button */}
      <button
        onClick={triggerCriticalAlert}
        disabled={!searchCity.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-40"
      >
        Analyze
      </button>
    </div>
  );
}
