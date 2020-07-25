import { ObjectRenderer, Renderer, QuadUv, Matrix } from "pixi.js";
import Tilemap from "./Tilemap";
import TilemapShader from "./TilemapShader";

export default class TilemapRenderer extends ObjectRenderer {
  shader: TilemapShader;
  quad: QuadUv;
  _matrix: Matrix = new Matrix();

  constructor(renderer: Renderer) {
    super(renderer);

    this.quad = new QuadUv();
    this.shader = new TilemapShader();
  }

  render(tilemap: Tilemap) {
    this.shader.uniforms.translationMatrix = tilemap.transform.worldTransform.toArray(
      true
    );
    this.shader.uniforms.uSampler = tilemap.tileset.texture;
    this.shader.uniforms.uTime = performance.now();

    this.renderer.shader.bind(this.shader);
    this.renderer.geometry.bind(tilemap.geometry);

    this.renderer.geometry.draw(
      this.renderer.gl.TRIANGLES,
      6 * tilemap.tileCount,
      0
    );
  }
}
