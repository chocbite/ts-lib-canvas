import { some, type Option } from "@chocbite/ts-lib-result";
import { svg } from "@chocbite/ts-lib-svg";

export abstract class ViewportElement {
  protected abstract element_name(): string;
  protected abstract element_name_space(): string;

  /**Default width of element when created */
  abstract default_width(): number;
  /**Default height of element when created */
  abstract default_height(): number;
  /**Element optimal ratio, returns the ratio where the element has no distortion
   * If the element can dynamically change based on ratio, return none */
  optimal_ratio(): Option<number> {
    const w = this.default_width();
    const h = this.default_height();
    if (w === 0 || h === 0) return some(0);
    return some(w / h);
  }

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

  //      _____   ____   _____ _____ _______ _____ ____  _   _
  //     |  __ \ / __ \ / ____|_   _|__   __|_   _/ __ \| \ | |
  //     | |__) | |  | | (___   | |    | |    | || |  | |  \| |
  //     |  ___/| |  | |\___ \  | |    | |    | || |  | | . ` |
  //     | |    | |__| |____) |_| |_   | |   _| || |__| | |\  |
  //     |_|     \____/|_____/|_____|  |_|  |_____\____/|_| \_|
  #position_x = 0;
  #position_y = 0;
  #rotation = 0;

  set position_x(value: number) {
    this.canvas.setAttribute("x", value.toString());
    this.#position_x = value;
  }
  get position_x(): number {
    return this.#position_x;
  }

  set position_y(value: number) {
    this.canvas.setAttribute("y", value.toString());
    this.#position_y = value;
  }
  get position_y(): number {
    return this.#position_y;
  }

  set rotation(value: number) {
    this.canvas.setAttribute(
      "transform",
      `rotate(${value} ${this.position_x} ${this.position_y})`,
    );
    this.#rotation = value;
  }
  get rotation(): number {
    return this.#rotation;
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
