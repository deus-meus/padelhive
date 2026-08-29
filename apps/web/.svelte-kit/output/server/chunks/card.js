import { l as attributes, f as stringify } from "./index.js";
function Card($$renderer, $$props) {
  let {
    children,
    class: className = "",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$renderer.push(`<div${attributes({
    class: `rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-[#F7F7F7] ${stringify(className)}`,
    ...restProps
  })}>`);
  children?.($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  Card as C
};
