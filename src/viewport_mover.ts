import { node_clone } from "@chocbite/ts-lib-common";
import { material_action_autorenew_rounded } from "@chocbite/ts-lib-icons";
import type { StateROS } from "@chocbite/ts-lib-state";
import { svg } from "@chocbite/ts-lib-svg";
import { ViewportElement } from "./viewport_element";
import "./viewport_mover.scss";

const nw = svg.svg(32, 32, "0 0 32 32").cl("nw").elem;
nw.appendChild(svg.create("circle").elem);
nw.appendChild(svg.line(-8, -8, 8, 8).elem);
nw.appendChild(svg.isosceles_triangle(-7, -7, 8, 6).rotate(-45, -7, -7).elem);
nw.appendChild(svg.isosceles_triangle(7, 7, 8, 6).rotate(135, 7, 7).elem);
const ne = svg.svg(32, 32, "0 0 32 32").cl("ne").elem;
ne.appendChild(svg.create("circle").elem);
ne.appendChild(svg.line(-8, 8, 8, -8).elem);
ne.appendChild(svg.isosceles_triangle(-7, 7, 8, 6).rotate(-135, -7, 7).elem);
ne.appendChild(svg.isosceles_triangle(7, -7, 8, 6).rotate(45, 7, -7).elem);
const se = svg.svg(32, 32, "0 0 32 32").cl("se").elem;
se.appendChild(svg.create("circle").elem);
se.appendChild(svg.line(-8, -8, 8, 8).elem);
se.appendChild(svg.isosceles_triangle(-7, -7, 8, 6).rotate(-45, -7, -7).elem);
se.appendChild(svg.isosceles_triangle(7, 7, 8, 6).rotate(135, 7, 7).elem);
const sw = svg.svg(32, 32, "0 0 32 32").cl("sw").elem;
sw.appendChild(svg.create("circle").elem);
sw.appendChild(svg.line(-8, 8, 8, -8).elem);
sw.appendChild(svg.isosceles_triangle(-7, 7, 8, 6).rotate(-135, -7, 7).elem);
sw.appendChild(svg.isosceles_triangle(7, -7, 8, 6).rotate(45, 7, -7).elem);
const move = svg.svg(32, 32, "0 0 32 32").cl("move").elem;
move.appendChild(svg.create("circle").elem);
move.appendChild(svg.line(0, 8, 0, -8).elem);
move.appendChild(svg.isosceles_triangle(0, 10, 8, 6).rotate(180, 0, 10).elem);
move.appendChild(svg.isosceles_triangle(0, -10, 8, 6).rotate(0, 0, -10).elem);
move.appendChild(svg.line(-10, 0, 10, 0).elem);
move.appendChild(svg.isosceles_triangle(-10, 0, 8, 6).rotate(270, -10, 0).elem);
move.appendChild(svg.isosceles_triangle(10, 0, 8, 6).rotate(90, 10, 0).elem);
const rotate = svg.svg(32, 32, "0 0 32 32").a("y", "-30").cl("rotate").elem;
rotate.appendChild(svg.create("circle").elem);
rotate.appendChild(
  svg.attr(material_action_autorenew_rounded()).a("x", "-12").a("y", "-12")
    .elem,
);

export class ViewportMover {
  #canvas: SVGSVGElement = svg.create("svg").cl("viewport-mover").elem;
  #outline = this.#canvas.appendChild(
    svg.rectangle_from_corner(0, 0, 1, 1, 0).elem,
  );
  #nw_corner = this.#canvas.appendChild(node_clone(nw));
  #ne_corner = this.#canvas.appendChild(node_clone(ne));
  #sw_corner = this.#canvas.appendChild(node_clone(sw));
  #se_corner = this.#canvas.appendChild(node_clone(se));
  #move = this.#canvas.appendChild(node_clone(move));
  #rotate = this.#canvas.appendChild(node_clone(rotate));
  #scale_buffer = 1;
  #grid_x_buffer = 1;
  #grid_y_buffer = 1;

  constructor(
    scale: StateROS<number>,
    grid_x: StateROS<number>,
    grid_y: StateROS<number>,
  ) {
    scale.sub((val) => {
      this.#scale_buffer = val.value;
      this.#nw_corner.setAttribute("transform", `scale(${1 / val.value})`);
      this.#ne_corner.setAttribute("transform", `scale(${1 / val.value})`);
      this.#sw_corner.setAttribute("transform", `scale(${1 / val.value})`);
      this.#se_corner.setAttribute("transform", `scale(${1 / val.value})`);
      this.#move.setAttribute("transform", `scale(${1 / val.value})`);
      this.#rotate.setAttribute("transform", `scale(${1 / val.value})`);
    }, true);
    grid_x.sub((val) => {
      this.#grid_x_buffer = val.value;
    }, true);
    grid_y.sub((val) => {
      this.#grid_y_buffer = val.value;
    }, true);
    this.#move.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.#element) return;
      this.#move.setPointerCapture(e.pointerId);
      const x = this.#position_x;
      const y = this.#position_y;
      const offset_x = e.offsetX;
      const offset_y = e.offsetY;
      this.#move.onpointermove = (ev) => {
        if (this.#element) {
          const pos_x = (ev.offsetX - offset_x) / this.#scale_buffer + x;
          this.position_x = ev.shiftKey
            ? pos_x
            : pos_x - (pos_x % this.#grid_x_buffer);
          const pos_y = (ev.offsetY - offset_y) / this.#scale_buffer + y;
          this.position_y = ev.shiftKey
            ? pos_y
            : pos_y - (pos_y % this.#grid_y_buffer);
        }
      };
      this.#move.onpointerup = (ev) => {
        this.#move.releasePointerCapture(ev.pointerId);
        this.#move.onpointermove = null;
      };
    };
  }

  #position_x = 0;
  set position_x(value: number) {
    this.#canvas.setAttribute("x", String(value));
    this.#position_x = value;
    if (this.#element) this.#element.position_x = value;
  }

  #position_y = 0;
  set position_y(value: number) {
    this.#canvas.setAttribute("y", String(value));
    this.#position_y = value;
    if (this.#element) this.#element.position_y = value;
  }

  #width = 0;
  set width(value: number) {
    this.#outline.setAttribute("width", value.toString());
    this.#ne_corner.setAttribute("x", String(value));
    this.#ne_corner.setAttribute("transform-origin", `${value} 0`);
    this.#se_corner.setAttribute("x", String(value));
    this.#se_corner.setAttribute(
      "transform-origin",
      `${value} ${this.#height}`,
    );
    this.#move.setAttribute("x", String(value / 2));
    this.#move.setAttribute(
      "transform-origin",
      `${value / 2} ${this.#height / 2}`,
    );
    this.#rotate.setAttribute("x", String(value / 2));
    this.#rotate.setAttribute("transform-origin", `${value / 2} 0`);
    this.#width = value;
  }
  #height = 0;
  set height(value: number) {
    this.#outline.setAttribute("height", value.toString());
    this.#sw_corner.setAttribute("y", String(value));
    this.#sw_corner.setAttribute("transform-origin", `0 ${value}`);
    this.#se_corner.setAttribute("y", String(value));
    this.#se_corner.setAttribute("transform-origin", `${this.#width} ${value}`);
    this.#move.setAttribute("y", String(value / 2));
    this.#move.setAttribute(
      "transform-origin",
      `${this.#width / 2} ${value / 2}`,
    );
    this.#height = value;
  }

  #element?: ViewportElement;
  attach_to_element(element: ViewportElement, canvas: SVGSVGElement) {
    this.#canvas.setAttribute("x", element.position_x.toString());
    this.#canvas.setAttribute("y", element.position_y.toString());
    this.width = element.width;
    this.height = element.height;
    this.position_x = element.position_x;
    this.position_y = element.position_y;
    this.#element = element;
    canvas.appendChild(this.#canvas);
  }

  dettach_from_element() {
    this.#element = undefined;
    this.#canvas.remove();
  }
}
