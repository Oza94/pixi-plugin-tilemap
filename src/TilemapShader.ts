import { Shader, Program } from "pixi.js";
import vertex from "./tilemap.vert";
import fragment from "./tilemap.frag";

export default class TilemapShader extends Shader {
  constructor() {
    super(new Program(vertex, fragment, "tilemap"));

    this.uniforms.uTime = 0;
  }
}
