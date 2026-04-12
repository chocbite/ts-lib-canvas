import { none, Option } from "@chocbite/ts-lib-result";
import { svg } from "@chocbite/ts-lib-svg";
import { viewport, ViewportElement } from ".";

export class ViewportElementTest extends ViewportElement {
  protected element_name(): string {
    return "viewport";
  }
  protected element_name_space(): string {
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
}

export class ViewportElementDynamicTest extends ViewportElement {
  protected element_name(): string {
    return "viewport-dynamic";
  }
  protected element_name_space(): string {
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
