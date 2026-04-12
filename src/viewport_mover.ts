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
const rotate_sym = svg.svg(32, 32, "0 0 32 32").a("y", "-30").cl("rotate").elem;
rotate_sym.appendChild(svg.create("circle").elem);
rotate_sym.appendChild(
  svg.attr(material_action_autorenew_rounded()).a("x", "-12").a("y", "-12")
    .elem,
);
const rotation_center_indicator = svg
  .svg(16, 16, "0 0 16 16")
  .cl("rotation-center").elem;
rotation_center_indicator.appendChild(svg.create("circle").elem);
rotation_center_indicator.appendChild(svg.line(-6, 0, 6, 0).elem);
rotation_center_indicator.appendChild(svg.line(0, -6, 0, 6).elem);

const DEG_TO_RAD = Math.PI / 180;

export class ViewportMover {
  #canvas: SVGSVGElement = svg.create("svg").cl("viewport-mover").elem;
  #outline = this.#canvas.appendChild(
    svg.rectangle_from_corner(-1, -1, 1, 1, 0).elem,
  );
  #nw_corner = this.#canvas.appendChild(node_clone(nw));
  #ne_corner = this.#canvas.appendChild(node_clone(ne));
  #sw_corner = this.#canvas.appendChild(node_clone(sw));
  #se_corner = this.#canvas.appendChild(node_clone(se));
  #move = this.#canvas.appendChild(node_clone(move));
  #rotate = this.#canvas.appendChild(node_clone(rotate_sym));
  #rc_indicator = this.#canvas.appendChild(
    node_clone(rotation_center_indicator),
  );
  #scale_buffer = 1;
  #grid_x_buffer = 1;
  #grid_y_buffer = 1;
  #grid_rotate_buffer = 0;

  constructor(
    scale: StateROS<number>,
    grid_x: StateROS<number>,
    grid_y: StateROS<number>,
    grid_rotate: StateROS<number>,
  ) {
    scale.sub((val) => {
      this.#scale_buffer = val.value;
      const s = `scale(${1 / val.value})`;
      this.#nw_corner.setAttribute("transform", s);
      this.#ne_corner.setAttribute("transform", s);
      this.#sw_corner.setAttribute("transform", s);
      this.#se_corner.setAttribute("transform", s);
      this.#move.setAttribute("transform", s);
      this.#rotate.setAttribute("transform", s);
      this.#rc_indicator.setAttribute("transform", s);
    }, true);
    grid_x.sub((val) => {
      this.#grid_x_buffer = val.value;
    }, true);
    grid_y.sub((val) => {
      this.#grid_y_buffer = val.value;
    }, true);
    grid_rotate.sub((val) => {
      this.#grid_rotate_buffer = val.value;
    }, true);
    this.#canvas.tabIndex = -1;
    this.#setup_position();
    this.#setup_corner(this.#nw_corner, -1, -1);
    this.#setup_corner(this.#ne_corner, 1, -1);
    this.#setup_corner(this.#sw_corner, -1, 1);
    this.#setup_corner(this.#se_corner, 1, 1);
    this.#setup_rotation();
  }
  #update_mover_transform() {
    if (this.#rotation === 0) {
      this.#canvas.removeAttribute("transform");
    } else {
      const cx = this.#position_x + this.#rotation_center_x;
      const cy = this.#position_y + this.#rotation_center_y;
      this.#canvas.setAttribute(
        "transform",
        `rotate(${this.#rotation} ${cx} ${cy})`,
      );
    }
  }

  #element?: ViewportElement;
  attach_to_element(element: ViewportElement, canvas: SVGSVGElement) {
    // Clear the old element reference first so the property setters below
    // don't propagate the new element's values back to the previous element.
    this.#element = undefined;
    this.#canvas.setAttribute("x", element.position_x.toString());
    this.#canvas.setAttribute("y", element.position_y.toString());
    this.width = element.width;
    this.height = element.height;
    this.position_x = element.position_x;
    this.position_y = element.position_y;
    this.#rotation = element.rotation;
    this.#rotation_center_x = element.rotation_center_x;
    this.#rotation_center_y = element.rotation_center_y;
    this.#update_rc_indicator();
    this.#element = element;
    this.#update_mover_transform();
    canvas.appendChild(this.#canvas);
  }

  detach_from_element() {
    this.#element = undefined;
    this.#canvas.remove();
  }
  //      _____   ____   _____ _____ _______ _____ ____  _   _
  //     |  __ \ / __ \ / ____|_   _|__   __|_   _/ __ \| \ | |
  //     | |__) | |  | | (___   | |    | |    | || |  | |  \| |
  //     |  ___/| |  | |\___ \  | |    | |    | || |  | | . ` |
  //     | |    | |__| |____) |_| |_   | |   _| || |__| | |\  |
  //     |_|     \____/|_____/|_____|  |_|  |_____\____/|_| \_|
  #setup_position() {
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
            : Math.round(pos_x / this.#grid_x_buffer) * this.#grid_x_buffer;
          const pos_y = (ev.offsetY - offset_y) / this.#scale_buffer + y;
          this.position_y = ev.shiftKey
            ? pos_y
            : Math.round(pos_y / this.#grid_y_buffer) * this.#grid_y_buffer;
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
    this.#update_mover_transform();
  }

  #position_y = 0;
  set position_y(value: number) {
    this.#canvas.setAttribute("y", String(value));
    this.#position_y = value;
    if (this.#element) this.#element.position_y = value;
    this.#update_mover_transform();
  }

  //      _____   ____ _______    _______ _____ ____  _   _
  //     |  __ \ / __ \__   __|/\|__   __|_   _/ __ \| \ | |
  //     | |__) | |  | | | |  /  \  | |    | || |  | |  \| |
  //     |  _  /| |  | | | | / /\ \ | |    | || |  | | . ` |
  //     | | \ \| |__| | | |/ ____ \| |   _| || |__| | |\  |
  //     |_|  \_\\____/  |_/_/    \_\_|  |_____\____/|_| \_|
  #setup_rotation() {
    this.#rotate.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.#element) return;
      this.#rotate.setPointerCapture(e.pointerId);
      const ctm = this.#canvas.getScreenCTM();
      if (!ctm) return;
      // Use the rotation center as the angle reference so the mover and
      // element both rotate around the same point without position shifts.
      const center = new DOMPoint(
        this.#rotation_center_x,
        this.#rotation_center_y,
      ).matrixTransform(ctm);
      const initial_angle = Math.atan2(
        e.clientY - center.y,
        e.clientX - center.x,
      );
      const initial_rotation = this.#rotation;
      this.#rotate.onpointermove = (ev) => {
        if (!this.#element) return;
        const current_angle = Math.atan2(
          ev.clientY - center.y,
          ev.clientX - center.x,
        );
        const raw_rotation =
          initial_rotation + (current_angle - initial_angle) / DEG_TO_RAD;
        this.rotation = ev.shiftKey
          ? raw_rotation
          : Math.round(raw_rotation / this.#grid_rotate_buffer) *
            this.#grid_rotate_buffer;
      };
      this.#rotate.onpointerup = (ev) => {
        this.#rotate.releasePointerCapture(ev.pointerId);
        this.#rotate.onpointermove = null;
      };
    };
  }
  #update_rc_indicator() {
    this.#rc_indicator.setAttribute("x", String(this.#rotation_center_x));
    this.#rc_indicator.setAttribute("y", String(this.#rotation_center_y));
    this.#rc_indicator.setAttribute(
      "transform-origin",
      `${this.#rotation_center_x} ${this.#rotation_center_y}`,
    );
  }

  #rotation = 0;
  set rotation(value: number) {
    this.#rotation = value;
    if (this.#element) this.#element.rotation = value;
    this.#update_mover_transform();
  }

  #rotation_center_x = 0;
  #rotation_center_y = 0;

  //       _____ _____ ____________
  //      / ____|_   _|___  /  ____|
  //     | (___   | |    / /| |__
  //      \___ \  | |   / / |  __|
  //      ____) |_| |_ / /__| |____
  //     |_____/|_____/_____|______|
  #setup_corner(handle: SVGSVGElement, sx: number, sy: number) {
    handle.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.#element) return;
      handle.setPointerCapture(e.pointerId);
      const initial_x = e.clientX;
      const initial_y = e.clientY;
      const initial_w = this.#width;
      const initial_h = this.#height;
      const initial_px = this.#position_x;
      const initial_py = this.#position_y;
      const initial_rcx = this.#rotation_center_x;
      const initial_rcy = this.#rotation_center_y;
      const rad = this.#rotation * DEG_TO_RAD;
      const cos_r = Math.cos(rad);
      const sin_r = Math.sin(rad);
      handle.onpointermove = (ev) => {
        if (!this.#element) return;
        const canvas_dx = (ev.clientX - initial_x) / this.#scale_buffer;
        const canvas_dy = (ev.clientY - initial_y) / this.#scale_buffer;
        const local_dx = cos_r * canvas_dx + sin_r * canvas_dy;
        const local_dy = -sin_r * canvas_dx + cos_r * canvas_dy;
        let new_w = Math.max(1, initial_w + sx * local_dx);
        let new_h = Math.max(1, initial_h + sy * local_dy);
        if (!ev.shiftKey) {
          new_w = Math.round(new_w);
          new_h = Math.round(new_h);
        }
        const new_rcx =
          initial_w > 0 ? initial_rcx * (new_w / initial_w) : initial_rcx;
        const new_rcy =
          initial_h > 0 ? initial_rcy * (new_h / initial_h) : initial_rcy;
        const drc_x = initial_rcx - new_rcx;
        const drc_y = initial_rcy - new_rcy;
        const delta_w = new_w - initial_w;
        const delta_h = new_h - initial_h;
        let new_px = initial_px;
        let new_py = initial_py;
        if (sx < 0) {
          new_px -= delta_w * cos_r;
          new_py -= delta_w * sin_r;
        }
        if (sy < 0) {
          new_px += delta_h * sin_r;
          new_py -= delta_h * cos_r;
        }
        // Compensate position for the rotation pivot change so the
        // anchor corner stays visually fixed on a rotated element.
        new_px += drc_x * (1 - cos_r) + drc_y * sin_r;
        new_py += -drc_x * sin_r + drc_y * (1 - cos_r);
        this.#rotation_center_x = new_rcx;
        this.#rotation_center_y = new_rcy;
        if (this.#element) {
          this.#element.rotation_center_x = new_rcx;
          this.#element.rotation_center_y = new_rcy;
        }
        this.#update_rc_indicator();
        this.width = new_w;
        this.height = new_h;
        this.position_x = new_px;
        this.position_y = new_py;
      };
      handle.onpointerup = (ev) => {
        handle.releasePointerCapture(ev.pointerId);
        handle.onpointermove = null;
      };
    };
  }

  #width = 0;
  set width(value: number) {
    this.#outline.setAttribute("width", (value + 2).toString());
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
    if (this.#element) this.#element.width = value;
  }
  #height = 0;
  set height(value: number) {
    this.#outline.setAttribute("height", (value + 2).toString());
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
    if (this.#element) this.#element.height = value;
  }
}
