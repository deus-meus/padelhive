import { s as sanitize_props, b as spread_props, c as slot, f as escape_html, a as attr, e as attr_class, j as bind_props, d as derived, g as stringify, h as head, i as ensure_array_like, k as attr_style } from "../../chunks/index.js";
import "../../chunks/client.js";
import { I as Icon } from "../../chunks/Icon.js";
import { S as Search, F as Filter_select } from "../../chunks/filter-select.js";
function Arrow_right($$renderer, $$props) {
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
    ["path", { "d": "M5 12h14" }],
    ["path", { "d": "m12 5 7 7-7 7" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-right" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowRight
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJtMTIgNSA3IDctNyA3IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/arrow-right
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
function Calendar($$renderer, $$props) {
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
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "4", "rx": "2" }
    ],
    ["path", { "d": "M3 10h18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "calendar" },
    $$sanitized_props,
    {
      /**
       * @component @name Calendar
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOCAydjQiIC8+CiAgPHBhdGggZD0iTTE2IDJ2NCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDEwaDE4IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/calendar
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
function Clock($$renderer, $$props) {
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
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["polyline", { "points": "12 6 12 12 16 14" }]
  ];
  Icon($$renderer, spread_props([
    { name: "clock" },
    $$sanitized_props,
    {
      /**
       * @component @name Clock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxMiA2IDEyIDEyIDE2IDE0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/clock
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
function Inbox($$renderer, $$props) {
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
      "polyline",
      { "points": "22 12 16 12 14 15 10 15 8 12 2 12" }
    ],
    [
      "path",
      {
        "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "inbox" },
    $$sanitized_props,
    {
      /**
       * @component @name Inbox
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIyMiAxMiAxNiAxMiAxNCAxNSAxMCAxNSA4IDEyIDIgMTIiIC8+CiAgPHBhdGggZD0iTTUuNDUgNS4xMSAyIDEydjZhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0ydi02bC0zLjQ1LTYuODlBMiAyIDAgMCAwIDE2Ljc2IDRINy4yNGEyIDIgMCAwIDAtMS43OSAxLjExeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/inbox
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
function X($$renderer, $$props) {
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
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$renderer, spread_props([
    { name: "x" },
    $$sanitized_props,
    {
      /**
       * @component @name X
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNiA2IDE4IiAvPgogIDxwYXRoIGQ9Im02IDYgMTIgMTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/x
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
function Empty_state($$renderer, $$props) {
  let {
    icon: Icon2 = Inbox,
    title,
    description,
    actionLabel,
    onAction,
    actionHref
  } = $$props;
  $$renderer.push(`<div class="flex min-h-[360px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center"><div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10">`);
  if (Icon2) {
    $$renderer.push("<!--[-->");
    Icon2($$renderer, { class: "h-6 w-6 text-[#E6FA50]" });
    $$renderer.push("<!--]-->");
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push("<!--]-->");
  }
  $$renderer.push(`</div> <p class="mt-5 heading-3 text-[#F7F7F7]">${escape_html(title)}</p> `);
  if (description) {
    $$renderer.push(`<!--[0--><p class="mt-1.5 max-w-sm body text-[#F7F7F7]/40">${escape_html(description)}</p>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--> `);
  if (actionLabel) {
    $$renderer.push("<!--[0-->");
    if (actionHref) {
      $$renderer.push(`<!--[0--><a${attr("href", actionHref)} class="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] px-6 font-semibold label text-[#0A1628] hover:bg-[#E6FA50]/90 transition-colors">${escape_html(actionLabel)}</a>`);
    } else {
      $$renderer.push(`<!--[-1--><button type="button" class="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] px-6 font-semibold label text-[#0A1628] hover:bg-[#E6FA50]/90 transition-colors">${escape_html(actionLabel)}</button>`);
    }
    $$renderer.push(`<!--]-->`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
const PADEL_IMAGE = "https://images.unsplash.com/photo-1646649851780-d9701b7c3c04";
function padelImg(width, quality = 85) {
  return `${PADEL_IMAGE}?w=${width}&q=${quality}&fit=crop`;
}
function Date_picker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = "",
      onChange,
      placeholder = "Select Date",
      alignRight = false,
      class: className = ""
    } = $$props;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const displayLabel = derived(() => {
      if (!value) return placeholder;
      if (value === todayStr) {
        const d2 = /* @__PURE__ */ new Date();
        return `Today, ${d2.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
      const [y, m, d] = value.split("-").map(Number);
      if (!y || !m || !d) return value;
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    });
    $$renderer2.push(`<div${attr_class(`relative inline-block text-left shrink-0 ${stringify(className)}`)}><button type="button"${attr_class(`label flex w-full h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border ${value ? "border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]" : "border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]"}`)}><span class="flex items-center gap-2 truncate">`);
    Calendar($$renderer2, { class: "h-4 w-4 shrink-0 opacity-60 text-[#E6FA50]" });
    $$renderer2.push(`<!----> <span class="truncate">${escape_html(displayLabel())}</span></span> `);
    if (value) {
      $$renderer2.push(`<!--[0--><span role="button" tabindex="0" class="flex h-4 w-4 items-center justify-center rounded-full text-white/40 hover:text-white">`);
      X($$renderer2, { class: "h-3 w-3" });
      $$renderer2.push(`<!----></span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function Home_search_bar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let query = "";
    let city = "all";
    let time = "all";
    let selectedDate = "";
    const CITY_OPTIONS = [
      { value: "all", label: "All Cities" },
      { value: "Bali", label: "Bali" },
      { value: "Jakarta", label: "Jakarta" },
      { value: "Surabaya", label: "Surabaya" }
    ];
    const TIME_OPTIONS = [
      { value: "all", label: "Any Time" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" }
    ];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 md:p-6"><div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-3"><div class="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">`);
      Search($$renderer3, { class: "h-4 w-4 shrink-0 text-[#F7F7F7]/25" });
      $$renderer3.push(`<!----> <input type="text"${attr("value", query)} placeholder="Search venues or locations..." class="w-full bg-transparent body text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"/></div> `);
      Filter_select($$renderer3, {
        icon: Map_pin,
        value: city,
        options: CITY_OPTIONS,
        onChange: (v) => city = v,
        active: city !== "all"
      });
      $$renderer3.push(`<!----> `);
      Date_picker($$renderer3, {
        placeholder: "mm/dd/yyyy",
        get value() {
          return selectedDate;
        },
        set value($$value) {
          selectedDate = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Filter_select($$renderer3, {
        icon: Clock,
        value: time,
        options: TIME_OPTIONS,
        onChange: (v) => time = v,
        active: time !== "all"
      });
      $$renderer3.push(`<!----> <button type="button" class="btn-lime flex h-[46px] items-center justify-center rounded-xl px-6 label">Search</button></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const IMG = {
      hero: padelImg(1920, 85),
      featured: padelImg(1400, 85),
      bali: padelImg(900),
      jakarta: padelImg(900),
      surabaya: padelImg(900),
      community: padelImg(1e3),
      venue1: padelImg(600),
      venue2: padelImg(600),
      venue3: padelImg(600)
    };
    let venues = [];
    function formatStat(n) {
      return "0";
    }
    function getCityCount(cityName) {
      return 0;
    }
    const featuredVenue = derived(() => venues.length > 0 ? venues[0] : null);
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>PadelHive - Play. Compete. Connect.</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Indonesia's premier padel community. Book courts, join matches, meet players."/>`);
    });
    $$renderer2.push(`<section class="relative flex min-h-[100svh] flex-col overflow-hidden"><div class="absolute inset-0"><img${attr("src", IMG.hero)} alt="Padel doubles match in action" class="h-full w-full object-cover object-center"/> <div class="absolute inset-0 bg-[#06121A]/50"></div> <div class="absolute inset-0 bg-gradient-to-t from-[#06121A] via-[#06121A]/40 to-transparent"></div></div> <div class="container relative z-10 flex flex-1 flex-col justify-center pt-24 pb-16 md:pt-28 md:pb-20"><h1 class="display-hero text-[#F7F7F7]">BOOK.<br/> <span class="text-[#E6FA50]">PLAY.</span><br/> CONNECT.</h1> <div class="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between"><p class="body-lg max-w-md text-[#F7F7F7]/60">Indonesia's padel community. Book courts, join matches, meet players.</p> <div class="flex flex-wrap gap-3"><a href="/venues" class="label btn-lime inline-flex h-12 items-center justify-center rounded-full px-8">Book a Court</a> <a href="#community" class="label btn-outline-white inline-flex h-12 items-center justify-center rounded-full px-8">Join a Match</a></div></div></div></section> <section class="border-y border-white/[0.06] bg-[#06121A]"><div class="container flex items-center justify-between py-5"><div class="flex items-baseline gap-2"><span class="metric text-[#E6FA50]">${escape_html(formatStat())}</span> <span class="caption uppercase text-[#F7F7F7]/25">Players</span></div> <div class="h-4 w-px bg-white/[0.08]"></div> <div class="flex items-baseline gap-2"><span class="metric text-[#E6FA50]">${escape_html(formatStat())}</span> <span class="caption uppercase text-[#F7F7F7]/25">Venues</span></div> <div class="h-4 w-px bg-white/[0.08]"></div> <div class="flex items-baseline gap-2"><span class="metric text-[#E6FA50]">${escape_html(formatStat())}</span> <span class="caption uppercase text-[#F7F7F7]/25">Matches/mo</span></div> <div class="hidden h-4 w-px bg-white/[0.08] md:block"></div> <div class="hidden md:flex items-baseline gap-2"><span class="metric text-[#E6FA50]">${escape_html(formatStat())}</span> <span class="caption uppercase text-[#F7F7F7]/25">Hours Played</span></div></div></section> <section class="pt-10 pb-12 md:pt-12 md:pb-16 border-b border-white/[0.04]"><div class="container">`);
    Home_search_bar($$renderer2);
    $$renderer2.push(`<!----></div></section> <section class="py-section"><div class="container"><div class="mb-subsection max-w-xl"><span class="section-label">Featured</span> <h2 class="heading-2 mt-4 text-[#F7F7F7]">This Week's<br/> <span class="text-[#E6FA50]">Top Venue</span></h2></div> `);
    if (!featuredVenue()) {
      $$renderer2.push("<!--[0-->");
      Empty_state($$renderer2, {
        icon: Star,
        title: "Featured venues coming soon",
        description: "We're curating the best courts in Indonesia. Check back soon or explore everything available now.",
        actionLabel: "Browse All Venues",
        actionHref: "/venues"
      });
    } else {
      $$renderer2.push(`<!--[-1--><a${attr("href", `/venues/${stringify(featuredVenue().id)}`)} class="group block"><div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12"><div class="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[16/10]"><img${attr("src", IMG.featured)}${attr("alt", featuredVenue().name)} class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"/></div> <div class="flex flex-col justify-center"><div class="flex items-center gap-2">`);
      Star($$renderer2, { class: "h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" });
      $$renderer2.push(`<!----> <span class="label text-[#E6FA50]">${escape_html(featuredVenue().rating)}</span> <span class="caption text-[#F7F7F7]/25">· ${escape_html(featuredVenue().reviewCount)} reviews</span></div> <h3 class="heading-2 mt-4 text-[#F7F7F7]">${escape_html(featuredVenue().name)}</h3> <p class="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/40">`);
      Map_pin($$renderer2, { class: "h-3.5 w-3.5" });
      $$renderer2.push(`<!----> ${escape_html(featuredVenue().location)} · ${escape_html(featuredVenue().city)}</p> <p class="body mt-5 text-[#F7F7F7]/25">${escape_html(featuredVenue().description)}</p> <div class="mt-8"><p class="body-sm text-[#50C8C8]">See availability for pricing</p></div> <div class="label mt-8 inline-flex items-center gap-2 text-[#E6FA50] transition-all group-hover:gap-3">View Availability `);
      Arrow_right($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----></div></div></div></a>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="py-section"><div class="container"><div class="mb-subsection"><h2 class="display-lg text-[#F7F7F7]">WHERE<br/> WILL YOU<br/> <span class="text-[#E6FA50]">PLAY?</span></h2></div> <div class="space-y-4"><a href="/venues?city=Bali" class="group block"><div class="relative overflow-hidden rounded-2xl h-[50vh] min-h-[400px]"><img${attr("src", IMG.bali)} alt="Padel courts in Bali" class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"/> <div class="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent"></div> <div class="absolute bottom-0 left-0 p-8 md:p-10"><p class="section-label">${escape_html(getCityCount())} venues</p> <h3 class="display-lg mt-2 text-[#F7F7F7]">BALI</h3> <p class="body mt-2 max-w-xs text-[#F7F7F7]/40">Island courts. Ocean breeze. Sunset sessions.</p></div> <div class="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10">`);
    Arrow_right($$renderer2, { class: "h-4 w-4 text-[#06121A]" });
    $$renderer2.push(`<!----></div></div></a> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><a href="/venues?city=Jakarta" class="group block"><div class="relative overflow-hidden rounded-2xl h-[40vh] min-h-[340px]"><img${attr("src", IMG.jakarta)} alt="Padel courts in Jakarta" class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"/> <div class="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent"></div> <div class="absolute bottom-0 left-0 p-8 md:p-10"><p class="section-label">${escape_html(getCityCount())} venues</p> <h3 class="display-lg mt-2 text-[#F7F7F7]">JAKARTA</h3> <p class="body mt-2 max-w-xs text-[#F7F7F7]/40">Premium indoor facilities in the city center.</p></div> <div class="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10">`);
    Arrow_right($$renderer2, { class: "h-4 w-4 text-[#06121A]" });
    $$renderer2.push(`<!----></div></div></a> <a href="/venues?city=Surabaya" class="group block"><div class="relative overflow-hidden rounded-2xl h-[40vh] min-h-[340px]"><img${attr("src", IMG.surabaya)} alt="Padel courts in Surabaya" class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"/> <div class="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent"></div> <div class="absolute bottom-0 left-0 p-8 md:p-10"><p class="section-label">${escape_html(getCityCount())} venues</p> <h3 class="display-lg mt-2 text-[#F7F7F7]">SURABAYA</h3> <p class="body mt-2 max-w-xs text-[#F7F7F7]/40">East Java's emerging padel scene.</p></div> <div class="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10">`);
    Arrow_right($$renderer2, { class: "h-4 w-4 text-[#06121A]" });
    $$renderer2.push(`<!----></div></div></a></div></div></div></section> <section id="community" class="py-section"><div class="container"><div class="mb-subsection text-center"><h2 class="display-xl text-[#F7F7F7]">FIND PLAYERS.<br/> <span class="text-[#E6FA50]">NOT JUST COURTS.</span></h2></div> <div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20"><div class="relative"><div class="aspect-[3/4] overflow-hidden rounded-2xl"><img${attr("src", IMG.community)} alt="Padel players after a doubles match" class="h-full w-full object-cover"/></div></div> <div class="flex flex-col justify-center"><p class="body-lg max-w-md text-[#F7F7F7]/60">Padelhive is where Indonesia's padel community lives. Join open
          matches, find partners at your level, split costs, and grow your
          network.</p> <div class="mt-8 flex flex-col gap-2"><div class="flex -space-x-2"><!--[-->`);
    const each_array = ensure_array_like(Array.from({ length: 5 }));
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      const user = [][i];
      const colors = ["#E6FA50", "#50C8C8", "#BFEF2E", "#2EADAD", "#7BCE3A"];
      if (user?.avatarUrl) {
        $$renderer2.push(`<!--[0--><img${attr("src", user.avatarUrl)}${attr("alt", user.name)} class="h-8 w-8 rounded-full border-2 border-[#06121A] object-cover"/>`);
      } else {
        $$renderer2.push(`<!--[-1--><div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#06121A] text-[10px] font-semibold text-[#06121A]"${attr_style(`background-color: ${stringify(colors[i % colors.length])}`)}>${escape_html(user ? user.name.charAt(0).toUpperCase() : "")}</div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <p class="caption text-[#F7F7F7]/40">+${escape_html(formatStat())} joined this month</p></div> <div class="mt-10 grid w-full max-w-md grid-cols-3"><div><p class="metric text-[#E6FA50]">${escape_html(formatStat())}</p> <p class="caption mt-2 text-[#F7F7F7]/25">Players</p></div> <div class="text-center"><p class="metric text-[#F7F7F7]">${escape_html(formatStat())}</p> <p class="caption mt-2 text-[#F7F7F7]/25">Matches/mo</p></div> <div class="text-right"><p class="metric text-[#F7F7F7]">${escape_html(0)}%</p> <p class="caption mt-2 text-[#F7F7F7]/25">Match rate</p></div></div> <a href="/venues" class="label btn-lime mt-10 inline-flex h-12 w-fit items-center gap-2 rounded-full px-8">Join the Community `);
    Arrow_right($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----></a></div></div></div></section> <section id="how-it-works" class="py-section border-t border-white/[0.04]"><div class="container"><div class="mb-subsection text-center"><h2 class="display-xl text-[#F7F7F7]">BOOK. SPLIT.<br/> <span class="text-[#E6FA50]">PLAY.</span></h2></div> <div class="mx-auto grid max-w-5xl grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2"><div class="group flex gap-8 py-8 md:gap-12 md:py-10"><span class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/[0.04] transition-colors duration-300 group-hover:text-[#E6FA50]/20">01</span> <div class="flex flex-col justify-center"><h3 class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]">Book a Court</h3> <p class="body mt-2 max-w-md text-[#F7F7F7]/40">Browse premium venues. Check real-time availability. Reserve your
            court in seconds.</p></div></div> <div class="group flex gap-8 py-8 md:gap-12 md:py-10"><span class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/[0.04] transition-colors duration-300 group-hover:text-[#E6FA50]/20">02</span> <div class="flex flex-col justify-center"><h3 class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]">Invite Your Crew</h3> <p class="body mt-2 max-w-md text-[#F7F7F7]/40">Share your booking link. Friends RSVP instantly. Build your squad for
            every session.</p></div></div> <div class="group flex gap-8 py-8 md:gap-12 md:py-10"><span class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/[0.04] transition-colors duration-300 group-hover:text-[#E6FA50]/20">03</span> <div class="flex flex-col justify-center"><h3 class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]">Split the Cost</h3> <p class="body mt-2 max-w-md text-[#F7F7F7]/40">Everyone pays their share automatically. No awkward conversations.</p></div></div> <div class="group flex gap-8 py-8 md:gap-12 md:py-10"><span class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/[0.04] transition-colors duration-300 group-hover:text-[#E6FA50]/20">04</span> <div class="flex flex-col justify-center"><h3 class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]">Play</h3> <p class="body mt-2 max-w-md text-[#F7F7F7]/40">Show up. Compete. Connect. Build your padel story.</p></div></div></div></div></section> <section id="venues" class="py-section border-t border-white/[0.04]"><div class="container"><div class="mb-subsection flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><h2 class="heading-2 text-[#F7F7F7]">All <span class="text-[#E6FA50]">Venues</span></h2> <a href="/venues" class="group flex items-center gap-2 label text-[#F7F7F7]/40 transition-colors hover:text-[#E6FA50]">Browse all `);
    Arrow_right($$renderer2, {
      class: "h-4 w-4 transition-transform group-hover:translate-x-1"
    });
    $$renderer2.push(`<!----></a></div> <div class="space-y-5">`);
    if (venues.length === 0) {
      $$renderer2.push("<!--[0-->");
      Empty_state($$renderer2, {
        icon: Map_pin,
        title: "No venues yet",
        description: "New courts are being added across Indonesia. Browse the full directory to see what's live.",
        actionLabel: "Browse All Venues",
        actionHref: "/venues"
      });
    } else {
      $$renderer2.push(`<!--[-1--><!--[-->`);
      const each_array_1 = ensure_array_like(venues);
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let venue = each_array_1[i];
        const images = [IMG.venue1, IMG.venue2, IMG.venue3];
        $$renderer2.push(`<a${attr("href", `/venues/${stringify(venue.id)}`)} class="group block"><article class="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-300 group-hover:border-[#E6FA50]/15 md:grid-cols-[1fr_1fr]"><div class="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]"><img${attr("src", images[i % images.length])}${attr("alt", venue.name)} class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"/> `);
        if (venue.isVerified || venue.status === "APPROVED") {
          $$renderer2.push(`<!--[0--><span class="caption absolute left-4 top-4 rounded-full bg-[#E6FA50] px-3 py-1 uppercase text-[#06121A] font-bold">Verified</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="flex flex-col justify-center p-8 md:p-10"><div class="flex items-center gap-2">`);
        Star($$renderer2, { class: "h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" });
        $$renderer2.push(`<!----> <span class="label text-[#E6FA50]">${escape_html(venue.rating)}</span> <span class="caption text-[#F7F7F7]/25">· ${escape_html(venue.reviewCount)} reviews</span></div> <h3 class="heading-3 mt-3 text-[#F7F7F7]">${escape_html(venue.name)}</h3> <p class="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/25">`);
        Map_pin($$renderer2, { class: "h-3.5 w-3.5" });
        $$renderer2.push(`<!----> ${escape_html(venue.location)} · ${escape_html(venue.city)}</p> <div class="mt-6"><p class="body-sm text-[#50C8C8]">See availability for pricing</p></div> <span class="label mt-6 inline-flex items-center gap-2 text-[#E6FA50] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-3">View Availability `);
        Arrow_right($$renderer2, { class: "h-4 w-4" });
        $$renderer2.push(`<!----></span></div></article></a>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></section>`);
  });
}
export {
  _page as default
};
