import { s as sanitize_props, b as spread_props, c as slot, h as head, a as attr, e as ensure_array_like, d as escape_html, f as stringify } from "../../../../chunks/index.js";
import { a as api } from "../../../../chunks/client.js";
import { C as Card } from "../../../../chunks/card.js";
import { S as Skeleton } from "../../../../chunks/skeleton.js";
import { I as Icon } from "../../../../chunks/Icon.js";
function Map_pin($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.475.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "10", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "map-pin" },
    $$sanitized_props,
    {
      /**
       * @component @name MapPin
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTBjMCA0Ljk5My01LjUzOSAxMC4xOTMtNy4zOTkgMTEuNzk5YTEgMSAwIDAgMS0xLjIwMiAwQzkuNTM5IDIwLjE5MyA0IDE0Ljk5MyA0IDEwYTggOCAwIDAgMSAxNiAwIiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/map-pin
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Search($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.475.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "11", "cy": "11", "r": "8" }],
    ["path", { "d": "m21 21-4.3-4.3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "search" },
    $$sanitized_props,
    {
      /**
       * @component @name Search
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMSIgY3k9IjExIiByPSI4IiAvPgogIDxwYXRoIGQ9Im0yMSAyMS00LjMtNC4zIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/search
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Star($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.475.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "star" },
    $$sanitized_props,
    {
      /**
       * @component @name Star
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuNTI1IDIuMjk1YS41My41MyAwIDAgMSAuOTUgMGwyLjMxIDQuNjc5YTIuMTIzIDIuMTIzIDAgMCAwIDEuNTk1IDEuMTZsNS4xNjYuNzU2YS41My41MyAwIDAgMSAuMjk0LjkwNGwtMy43MzYgMy42MzhhMi4xMjMgMi4xMjMgMCAwIDAtLjYxMSAxLjg3OGwuODgyIDUuMTRhLjUzLjUzIDAgMCAxLS43NzEuNTZsLTQuNjE4LTIuNDI4YTIuMTIyIDIuMTIyIDAgMCAwLTEuOTczIDBMNi4zOTYgMjEuMDFhLjUzLjUzIDAgMCAxLS43Ny0uNTZsLjg4MS01LjEzOWEyLjEyMiAyLjEyMiAwIDAgMC0uNjExLTEuODc5TDIuMTYgOS43OTVhLjUzLjUzIDAgMCAxIC4yOTQtLjkwNmw1LjE2NS0uNzU1YTIuMTIyIDIuMTIyIDAgMCAwIDEuNTk3LTEuMTZ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/star
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let searchQuery = "";
    let selectedCity = "All";
    let selectedType = "All";
    let venues = [];
    let isLoading = true;
    const CITIES = ["All", "Bali", "Jakarta", "Surabaya"];
    const TYPES = ["All", "INDOOR", "OUTDOOR"];
    async function loadVenues() {
      isLoading = true;
      try {
        const res = await api.venues.get({
          query: {
            q: searchQuery || void 0,
            city: selectedCity !== "All" ? selectedCity : void 0,
            type: selectedType !== "All" ? selectedType : void 0
          }
        });
        if (res.data) {
          venues = res.data;
        }
      } catch (e) {
        console.warn("Error fetching venues:", e);
      } finally {
        isLoading = false;
      }
    }
    function handleFilterChange() {
      loadVenues();
    }
    head("kwkept", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Padel Venues &amp; Clubs - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container space-y-8"><div class="space-y-2"><h1 class="text-3xl font-extrabold tracking-tight text-[#F7F7F7] sm:text-4xl">Padel Venues</h1> <p class="text-sm text-white/60">Explore approved courts, check pricing, and book your match</p></div> `);
    Card($$renderer2, {
      class: "p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="relative flex-1">`);
        Search($$renderer3, {
          class: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        });
        $$renderer3.push(`<!----> <input type="text"${attr("value", searchQuery)} placeholder="Search venues by name..." class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"/></div> <div class="flex items-center gap-3">`);
        $$renderer3.select(
          {
            value: selectedCity,
            onchange: handleFilterChange,
            class: "rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(CITIES);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let city = each_array[$$index];
              $$renderer4.option({ value: city, class: "bg-[#0C1B26] text-white" }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(city === "All" ? "All Cities" : city)}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(` `);
        $$renderer3.select(
          {
            value: selectedType,
            onchange: handleFilterChange,
            class: "rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array_1 = ensure_array_like(TYPES);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let type = each_array_1[$$index_1];
              $$renderer4.option({ value: type, class: "bg-[#0C1B26] text-white" }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(type === "All" ? "All Court Types" : type)}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(`</div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (isLoading) {
      $$renderer2.push(`<!--[0--><div class="grid grid-cols-1 gap-6 md:grid-cols-3"><!--[-->`);
      const each_array_2 = ensure_array_like([1, 2, 3, 4, 5, 6]);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        each_array_2[$$index_2];
        Card($$renderer2, {
          class: "p-0 overflow-hidden space-y-4",
          children: ($$renderer3) => {
            Skeleton($$renderer3, { class: "h-48 w-full rounded-none" });
            $$renderer3.push(`<!----> <div class="p-5 space-y-3">`);
            Skeleton($$renderer3, { class: "h-6 w-3/4" });
            $$renderer3.push(`<!----> `);
            Skeleton($$renderer3, { class: "h-4 w-1/2" });
            $$renderer3.push(`<!----></div>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (venues.length === 0) {
      $$renderer2.push("<!--[1-->");
      Card($$renderer2, {
        class: "flex flex-col items-center justify-center p-12 text-center",
        children: ($$renderer3) => {
          Map_pin($$renderer3, { class: "mb-3 h-10 w-10 text-white/30" });
          $$renderer3.push(`<!----> <h3 class="text-lg font-semibold text-white">No Venues Found</h3> <p class="mt-1 text-xs text-white/50">Try adjusting your search terms or filters.</p>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push(`<!--[-1--><div class="grid grid-cols-1 gap-6 md:grid-cols-3"><!--[-->`);
      const each_array_3 = ensure_array_like(venues);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let venue = each_array_3[$$index_3];
        $$renderer2.push(`<a${attr("href", `/venues/${stringify(venue.id)}`)} class="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-300 hover:border-[#E6FA50]/30 hover:shadow-xl"><div class="relative h-48 w-full overflow-hidden bg-white/5">`);
        if (venue.imageUrl) {
          $$renderer2.push(`<!--[0--><img${attr("src", venue.imageUrl)}${attr("alt", venue.name)} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>`);
        } else {
          $$renderer2.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center text-white/30">No Image</div>`);
        }
        $$renderer2.push(`<!--]--> <div class="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#06121A]/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-[#E6FA50] border border-white/10">`);
        Star($$renderer2, { class: "h-3.5 w-3.5 fill-[#E6FA50]" });
        $$renderer2.push(`<!----> <span>${escape_html(venue.rating ?? 4.8)}</span></div></div> <div class="p-5 space-y-2"><h3 class="text-lg font-bold text-[#F7F7F7] group-hover:text-[#E6FA50] transition-colors">${escape_html(venue.name)}</h3> <div class="flex items-center gap-1.5 text-xs text-white/60">`);
        Map_pin($$renderer2, { class: "h-3.5 w-3.5 text-[#E6FA50]" });
        $$renderer2.push(`<!----> <span>${escape_html(venue.location)}, ${escape_html(venue.city)}</span></div> <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between"><span class="text-xs text-white/50">${escape_html(venue.courtCount ?? 2)} Courts</span> <span class="text-sm font-semibold text-[#E6FA50]">From Rp ${escape_html((venue.priceFrom ?? 2e5).toLocaleString("id-ID"))}/hr</span></div></div></a>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
