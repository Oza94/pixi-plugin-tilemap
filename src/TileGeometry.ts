import { Geometry, Buffer } from "pixi.js";

export default class TileGeometry extends Geometry {
  buffer: Buffer;
  indexBuffer: Buffer;
  vertSize: number = 8;
  vertPerQuad: number = 4;
  stride: number = this.vertSize * 4;

  constructor() {
    super();

    this.buffer = new Buffer(new Float32Array(2), true, false);
    // Vertex position
    this.addAttribute(
      "aVertexPosition",
      this.buffer,
      2,
      false,
      0,
      this.stride,
      0
    );
    // Frame position
    this.addAttribute("aFrame", this.buffer, 2, false, 0, this.stride, 2 * 4);
    // Frame size
    this.addAttribute(
      "aFrameSize",
      this.buffer,
      2,
      false,
      0,
      this.stride,
      4 * 4
    );
    // Animation length (0 means no animation)
    this.addAttribute(
      "aAnimFrames",
      this.buffer,
      1,
      false,
      0,
      this.stride,
      6 * 4
    );
    // Animation framerate (in ms)
    this.addAttribute(
      "aAnimTime",
      this.buffer,
      1,
      false,
      0,
      this.stride,
      7 * 4
    );

    this.indexBuffer = new Buffer(undefined, true, true);
    this.addIndex(this.indexBuffer);
  }
}
