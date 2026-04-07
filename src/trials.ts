import { viewport, ViewportElementTest } from ".";

document.body.style.height = "100vh";
document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const vp = viewport.create_viewport(100, 100, false);
document.body.replaceChildren(vp);
const elem = new ViewportElementTest();
vp.elements = [elem];
vp.attach_mover(elem);
