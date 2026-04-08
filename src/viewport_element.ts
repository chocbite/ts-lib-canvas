import { none, some, type Option } from "@chocbite/ts-lib-result";
import { svg } from "@chocbite/ts-lib-svg";

export abstract class ViewportElement {
  protected abstract element_name(): string;
  protected abstract element_name_space(): string;

  /**Default width of element when created */
  abstract default_width(): number;
  /**Default height of element when created */
  abstract default_height(): number;
  /**Element optimal ratio, returns the ratio where the element has no distortion.
   * If the element can dynamically change based on ratio, return none. */
  optimal_ratio(): Option<number> {
    const w = this.default_width();
    const h = this.default_height();
    if (w === 0 || h === 0) return some(0);
    return some(w / h);
  }

  /**Called when the element has no optimal ratio and its dimensions change.
   * Descendants can override this to re-layout their content in the new
   * coordinate space defined by the updated viewBox. */
  protected on_resize(_width: number, _height: number): void {}

  readonly canvas: SVGSVGElement = svg
    .svg(
      this.default_width(),
      this.default_height(),
      `0 0 ${this.default_width()} ${this.default_height()}`,
    )
    .cl(
      "viewport-element",
      `${this.element_name_space()}-${this.element_name()}`,
    ).elem;

  constructor() {
    // When the element has an optimal ratio, set preserveAspectRatio to "none"
    // so that non-uniform scaling (stretching) is applied when the display
    // dimensions deviate from the optimal ratio.
    if (this.optimal_ratio().some) {
      this.canvas.setAttribute("preserveAspectRatio", "none");
    }
  }

  //      _____   ____   _____ _____ _______ _____ ____  _   _
  //     |  __ \ / __ \ / ____|_   _|__   __|_   _/ __ \| \ | |
  //     | |__) | |  | | (___   | |    | |    | || |  | |  \| |
  //     |  ___/| |  | |\___ \  | |    | |    | || |  | | . ` |
  //     | |    | |__| |____) |_| |_   | |   _| || |__| | |\  |
  //     |_|     \____/|_____/|_____|  |_|  |_____\____/|_| \_|
  #position_x = 0;
  #position_y = 0;

  set position_x(value: number) {
    this.#position_x = value;
    this.canvas.setAttribute("x", value.toString());
    this.#update_transform();
  }
  get position_x(): number {
    return this.#position_x;
  }

  set position_y(value: number) {
    this.#position_y = value;
    this.canvas.setAttribute("y", value.toString());
    this.#update_transform();
  }
  get position_y(): number {
    return this.#position_y;
  }

  //      _____   ____ _______    _______ _____ ____  _   _
  //     |  __ \ / __ \__   __|/\|__   __|_   _/ __ \| \ | |
  //     | |__) | |  | | | |  /  \  | |    | || |  | |  \| |
  //     |  _  /| |  | | | | / /\ \ | |    | || |  | | . ` |
  //     | | \ \| |__| | | |/ ____ \| |   _| || |__| | |\  |
  //     |_|  \_\\____/  |_/_/    \_\_|  |_____\____/|_| \_|
  #rotation = 0;
  #rotation_center_x = this.default_width() / 2;
  #rotation_center_y = this.default_height() / 2;

  set rotation(value: number) {
    this.#rotation = value;
    this.#update_transform();
  }
  get rotation(): number {
    return this.#rotation;
  }

  /**Rotation center x coordinate, relative to the element's display area.
   * Defaults to half of default_width (center of element). */
  set rotation_center_x(value: number) {
    this.#rotation_center_x = value;
    this.#update_transform();
  }
  get rotation_center_x(): number {
    return this.#rotation_center_x;
  }

  /**Rotation center y coordinate, relative to the element's display area.
   * Defaults to half of default_height (center of element). */
  set rotation_center_y(value: number) {
    this.#rotation_center_y = value;
    this.#update_transform();
  }
  get rotation_center_y(): number {
    return this.#rotation_center_y;
  }

  #update_transform() {
    if (this.#rotation === 0) {
      this.canvas.removeAttribute("transform");
    } else {
      const cx = this.#position_x + this.#rotation_center_x;
      const cy = this.#position_y + this.#rotation_center_y;
      this.canvas.setAttribute(
        "transform",
        `rotate(${this.#rotation} ${cx} ${cy})`,
      );
    }
  }

  //       _____ _____ ____________
  //      / ____|_   _|___  /  ____|
  //     | (___   | |    / /| |__
  //      \___ \  | |   / / |  __|
  //      ____) |_| |_ / /__| |____
  //     |_____/|_____/_____|______|
  #width = this.default_width();
  #height = this.default_height();

  /**Display width of the element. Changing this scales the element.
   * - If the element has an optimal_ratio, the viewBox stays at default
   *   dimensions and the SVG content is stretched/scaled to fill the new size.
   * - If the element has no optimal_ratio, the viewBox is updated to match
   *   the new dimensions and on_resize is called. */
  set width(value: number) {
    this.#width = value;
    this.#apply_size();
  }
  get width(): number {
    return this.#width;
  }

  /**Display height of the element. Changing this scales the element.
   * - If the element has an optimal_ratio, the viewBox stays at default
   *   dimensions and the SVG content is stretched/scaled to fill the new size.
   * - If the element has no optimal_ratio, the viewBox is updated to match
   *   the new dimensions and on_resize is called. */
  set height(value: number) {
    this.#height = value;
    this.#apply_size();
  }
  get height(): number {
    return this.#height;
  }

  #apply_size() {
    this.canvas.setAttribute("width", this.#width.toString());
    this.canvas.setAttribute("height", this.#height.toString());

    if (this.optimal_ratio().none) {
      // No optimal ratio: update the coordinate system to match the new
      // display size and notify the descendant so it can re-layout.
      this.canvas.setAttribute(
        "viewBox",
        `0 0 ${this.#width} ${this.#height}`,
      );
      this.on_resize(this.#width, this.#height);
    }
    // When an optimal ratio exists the viewBox stays at the default
    // dimensions.  preserveAspectRatio="none" ensures the content is
    // stretched/scaled to fill the (possibly non-uniform) display size.
  }
}

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
      svg.rectangle_from_corner(0, 0, 64, 64, 0).s("red").f("none").elem,
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
