import { j as attr_class, f as stringify } from "./index.js";
function Skeleton($$renderer, $$props) {
  let { class: className = "" } = $$props;
  $$renderer.push(`<div${attr_class(`animate-pulse rounded-xl bg-white/[0.06] ${stringify(className)}`)}></div>`);
}
export {
  Skeleton as S
};
