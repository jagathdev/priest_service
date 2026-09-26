"use client";

import { FormEvent, useMemo, useState } from "react";

interface NakshatraResponse {
  nakshatra: string;
  pada: number;
  rasi: string;
  tithi: string;
  gana: string;
  nadi: string;
  yoni: string;
  lord: string;
  alphabet: string;
}

interface ResultField {
  label: string;
  value: string;
}

interface NakshatraCardProps {
  hideHeader?: boolean;
}

function isNakshatraResponse(value: unknown): value is NakshatraResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.nakshatra === "string" &&
    typeof candidate.pada === "number" &&
    typeof candidate.rasi === "string" &&
    typeof candidate.tithi === "string" &&
    typeof candidate.gana === "string" &&
    typeof candidate.nadi === "string" &&
    typeof candidate.yoni === "string" &&
    typeof candidate.lord === "string" &&
    typeof candidate.alphabet === "string"
  );
}

const FIELD_ORDER: Array<{ label: string; key: keyof NakshatraResponse }> = [
  { label: "Nakshatra", key: "nakshatra" },
  { label: "Nakshatra Pada", key: "pada" },
  { label: "Rasi (Moon Sign)", key: "rasi" },
  { label: "Tithi", key: "tithi" },
  { label: "Gana", key: "gana" },
  { label: "Nadi", key: "nadi" },
  { label: "Nakshatra Lord", key: "lord" },
  { label: "Name Alphabet", key: "alphabet" },
];

export default function NakshatraCard({ hideHeader = false }: NakshatraCardProps) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [data, setData] = useState<NakshatraResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRows = useMemo<ResultField[]>(() => {
    if (!data) {
      return [];
    }

    return FIELD_ORDER.map((field) => {
      const rawValue = data[field.key];
      const value = field.key === "pada" ? `Pada ${rawValue}` : String(rawValue);
      return { label: field.label, value };
    });
  }, [data]);

  const fetchNakshatra = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!dob) {
      setError("Please select date of birth.");
      return;
    }

    if (!time) {
      setError("Please select birth time.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/nakshatra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: `${dob}T${time}` }),
      });

      const result = (await response.json()) as NakshatraResponse | { error?: string };

      if (!response.ok || !isNakshatraResponse(result)) {
        const errorMessage =
          result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : "Unable to calculate right now.";
        setData(null);
        setError(errorMessage);
        return;
      }

      setData(result);
    } catch {
      setData(null);
      setError("Network error while calculating nakshatra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {!hideHeader && (
        <>
          <h3 className="text-center text-2xl font-bold text-gray-900">Nakshatra Finder</h3>
          <p className="mt-2 text-center text-sm text-gray-500">Find your Janma Nakshatra with date and time.</p>
        </>
      )}

      <form onSubmit={fetchNakshatra} className={`${hideHeader ? "mt-0" : "mt-5"} space-y-3`}>
        <div>
          <label htmlFor="nakshatra-name" className="mb-1 block text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            id="nakshatra-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-green-100"
            placeholder="Enter your name"
            aria-label="Name"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="nakshatra-dob" className="mb-1 block text-sm font-semibold text-gray-700">
              DOB
            </label>
            <input
              id="nakshatra-dob"
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-green-100"
              aria-label="Date of birth"
              required
            />
          </div>

          <div>
            <label htmlFor="nakshatra-time" className="mb-1 block text-sm font-semibold text-gray-700">
              Time
            </label>
            <input
              id="nakshatra-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-green-100"
              aria-label="Birth time"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-[#5657e8] disabled:cursor-not-allowed disabled:bg-violet-400"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      {data && (
        <div className="mt-6">
          <p className="text-center text-3xl font-bold leading-tight text-black sm:text-4xl">
            Namaste {name.trim()}
          </p>
          <h4 className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
            Your Janma Nakshatra
          </h4>
          <p className="mt-2 text-center text-4xl font-extrabold text-violet-600 sm:text-5xl">{data.nakshatra}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {resultRows.map((field) => (
              <div key={field.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-gray-500">
        Approximate Vedic calculation for guidance only. Lagna is not included.
      </p>
    </div>
  );
}

