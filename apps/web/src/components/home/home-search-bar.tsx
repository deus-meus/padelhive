"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Clock as ClockIcon } from "lucide-react";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(qs ? `/venues?${qs}` : "/venues");
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 md:p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search venues or locations..."
            className="w-full bg-transparent body text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
          />
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none bg-transparent body text-[#F7F7F7] outline-none"
          >
            <option value="" className="bg-[#0C1B26]">All Cities</option>
            <option value="Bali" className="bg-[#0C1B26]">Bali</option>
            <option value="Jakarta" className="bg-[#0C1B26]">Jakarta</option>
            <option value="Surabaya" className="bg-[#0C1B26]">Surabaya</option>
          </select>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
          <Calendar className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
          <input type="date" className="w-full bg-transparent body text-[#F7F7F7] outline-none [color-scheme:dark]" />
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
          <ClockIcon className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
          <select className="w-full appearance-none bg-transparent body text-[#F7F7F7] outline-none">
            <option value="" className="bg-[#0C1B26]">Any Time</option>
            <option value="morning" className="bg-[#0C1B26]">Morning</option>
            <option value="afternoon" className="bg-[#0C1B26]">Afternoon</option>
            <option value="evening" className="bg-[#0C1B26]">Evening</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="btn-lime flex h-[46px] items-center justify-center rounded-xl px-6 label uppercase"
        >
          Search
        </button>
      </div>
    </div>
  );
}
