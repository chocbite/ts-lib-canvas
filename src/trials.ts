import { viewport, ViewportElementDynamicTest, ViewportElementTest } from ".";

document.body.style.height = "100vh";
document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const vp = viewport.create_viewport(100, 100, false);
document.body.replaceChildren(vp);
const elem = new ViewportElementTest();
const elem_dynamic = new ViewportElementDynamicTest();
vp.elements = [elem, elem_dynamic];

window.elem = elem;
window.elem_dynamic = elem_dynamic;
window.viewport = vp;
