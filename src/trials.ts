import { define_element } from "@chocbite/ts-lib-base";
import { none, Option } from "@chocbite/ts-lib-result";
import state from "@chocbite/ts-lib-state";
import { svg } from "@chocbite/ts-lib-svg";
import { viewport, ViewportElement } from ".";

export class ViewportElementTest extends ViewportElement {
  static element_name(): string {
    return "viewportelementtest";
  }
  static element_name_space(): string {
    return "editor";
  }

  default_width(): number {
    return 64;
  }
  default_height(): number {
    return 64;
  }

  constructor() {
    super();
    this.canvas.appendChild(
      svg.rectangle_from_corner(0, 0, 64, 64, 0).s("red").f("green").elem,
    );
  }

  set fill(color: string) {
    (this.canvas.children[1] as SVGRectElement).setAttribute("fill", color);
  }
}
define_element(ViewportElementTest);

export class ViewportElementDynamicTest extends ViewportElement {
  static element_name(): string {
    return "viewportelementdynamictest";
  }
  static element_name_space(): string {
    return "editor";
  }

  default_width(): number {
    return 64;
  }
  default_height(): number {
    return 64;
  }

  optimal_ratio(): Option<number> {
    return none();
  }

  #rect: SVGRectElement;

  constructor() {
    super();
    this.#rect = svg
      .rectangle_from_corner(0, 0, 64, 64, 0)
      .s("blue")
      .f("none").elem;
    this.canvas.appendChild(this.#rect);
  }

  protected on_resize(width: number, height: number): void {
    this.#rect.setAttribute("width", width.toString());
    this.#rect.setAttribute("height", height.toString());
  }
}
define_element(ViewportElementDynamicTest);

document.body.style.height = "95vh";
document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const vp = viewport.create_viewport(100, 100, false);
document.body.replaceChildren(vp);
const elem = new ViewportElementTest();
const elem_dynamic = new ViewportElementDynamicTest();
vp.elements = [elem, elem_dynamic];

// window.elem = elem;
// window.elem_dynamic = elem_dynamic;
// window.viewport = vp;

elem.rotation_center_x = 0;
elem.rotation_center_y = 0;

const yo = state.ok("green");
elem.attach_state_ROA_to_prop("fill", yo);
setTimeout(() => {
  yo.set_ok("yellow");
}, 2000);
