<script lang="ts">
import { Clock, MapPin, Search } from "lucide-svelte";
import DatePicker from "$lib/components/ui/date-picker.svelte";
import FilterSelect from "$lib/components/ui/filter-select.svelte";

let query = $state("");
let city = $state("all");
let time = $state("all");
let selectedDate = $state("");

const CITY_OPTIONS = [
  { value: "all", label: "All Cities" },
  { value: "Bali", label: "Bali" },
  { value: "Jakarta", label: "Jakarta" },
  { value: "Surabaya", label: "Surabaya" },
];

const TIME_OPTIONS = [
  { value: "all", label: "Any Time" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

function handleSearch() {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  if (city && city !== "all") params.set("city", city);
  if (selectedDate) params.set("date", selectedDate);
  const qs = params.toString();
  window.location.href = qs ? `/venues?${qs}` : "/venues";
}
</script>

<div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 md:p-6">
  <div
    class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-3"
  >
    <div class="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
      <Search class="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
      <input
        type="text"
        bind:value={query}
        onkeydown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        placeholder="Search venues or locations..."
        class="w-full bg-transparent body text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
      />
    </div>

    <!-- City Custom Dropdown -->
    <FilterSelect
      icon={MapPin}
      value={city}
      options={CITY_OPTIONS}
      onChange={(v) => (city = v)}
      active={city !== "all"}
    />

    <!-- Date Custom DatePicker -->
    <DatePicker
      bind:value={selectedDate}
      placeholder="mm/dd/yyyy"
    />

    <!-- Time Custom Dropdown -->
    <FilterSelect
      icon={Clock}
      value={time}
      options={TIME_OPTIONS}
      onChange={(v) => (time = v)}
      active={time !== "all"}
    />

    <button
      type="button"
      onclick={handleSearch}
      class="btn-lime flex h-[46px] items-center justify-center rounded-xl px-6 label"
    >
      Search
    </button>
  </div>
</div>