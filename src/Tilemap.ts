import { Sprite, DisplayObject, Renderer, Texture } from "pixi.js";
import TileGeometry from "./TileGeometry";
import Tileset from "./Tileset";
import Vector2 from "./Vector2";

const POINT_STRUCT_SIZE = 5;

export default class Tilemap extends DisplayObject {
  pluginName: string = "tilemap";

  tileset: Tileset;
  size: Vector2;
  data: Array<number>;
  geometry: TileGeometry;
  vbBuffer: ArrayBuffer;
  vbArray: Float32Array;
  vbInts: Uint32Array;
  tileCount: number = 0;
  _vertices: number = 0;

  constructor(tileset: Tileset, size: Vector2, data: Array<number>) {
    super();

    this.tileset = tileset;
    this.size = size;
    this.data = [];

    const len = this.size.x * this.size.y;

    for (let i = 0; i < len; i++) {
      const tile = data[i];
      if (tile) {
        const anim = this.tileset.animations[tile];
        this.data.push(
          i % this.size.x,
          Math.floor(i / this.size.x),
          tile - 1,
          anim ? anim[0] : 1,
          anim ? anim[1] : 1
        );
      }
    }
  }

  render(renderer: Renderer) {
    this.tileCount = this.data.length / POINT_STRUCT_SIZE;

    // TODO: good spot for gl context recover
    if (!this.geometry) {
      this.geometry = new TileGeometry();
      this._vertices = 0;
    }

    const vertices = this.tileCount * this.geometry.vertPerQuad;

    if (this._vertices !== vertices) {
      this._vertices = vertices;
      const vbStride = this.geometry.stride * vertices;
      const indices = new Uint32Array(this.tileCount * 6);
      const { tileSize, texTileSize, texTileUvSize } = this.tileset;

      if (!this.vbBuffer || this.vbBuffer.byteLength < vbStride) {
        this.vbBuffer = new ArrayBuffer(vbStride);
        this.vbArray = new Float32Array(this.vbBuffer);
        this.vbInts = new Uint32Array(this.vbBuffer);
        this.geometry.getBuffer("aVertexPosition").update(this.vbBuffer);
      }

      // Upload vertices
      for (
        let i = 0, sz = 0, iz = 0;
        i < this.data.length;
        i += POINT_STRUCT_SIZE
      ) {
        const x = this.data[i];
        const y = this.data[i + 1];
        const tile = this.data[i + 2];
        // Tile animation properties
        const framerate = this.data[i + 3];
        const frames = this.data[i + 4];

        // Vertex positions
        const x0 = x * tileSize;
        const x1 = x0 + tileSize;
        const y0 = y * tileSize;
        const y1 = y0 + tileSize;

        // Compute texture uvs from tile position
        const tx = tile % texTileSize.x;
        const ty = Math.floor(tile / texTileSize.x);
        const uvx0 = tx * texTileUvSize.x;
        const uvx1 = uvx0 + texTileUvSize.x;
        const uvy0 = ty * texTileUvSize.y;
        const uvy1 = uvy0 + texTileUvSize.y;

        // Top-left vertice
        this.vbArray[sz++] = x0;
        this.vbArray[sz++] = y0;
        this.vbArray[sz++] = uvx0;
        this.vbArray[sz++] = uvy0;
        this.vbArray[sz++] = texTileUvSize.x;
        this.vbArray[sz++] = texTileUvSize.y;
        this.vbArray[sz++] = frames;
        this.vbArray[sz++] = framerate;

        // Top-right
        this.vbArray[sz++] = x1;
        this.vbArray[sz++] = y0;
        this.vbArray[sz++] = uvx1;
        this.vbArray[sz++] = uvy0;
        this.vbArray[sz++] = texTileUvSize.x;
        this.vbArray[sz++] = texTileUvSize.y;
        this.vbArray[sz++] = frames;
        this.vbArray[sz++] = framerate;

        // Bottom-left
        this.vbArray[sz++] = x0;
        this.vbArray[sz++] = y1;
        this.vbArray[sz++] = uvx0;
        this.vbArray[sz++] = uvy1;
        this.vbArray[sz++] = texTileUvSize.x;
        this.vbArray[sz++] = texTileUvSize.y;
        this.vbArray[sz++] = frames;
        this.vbArray[sz++] = framerate;

        // Bottom-right
        this.vbArray[sz++] = x1;
        this.vbArray[sz++] = y1;
        this.vbArray[sz++] = uvx1;
        this.vbArray[sz++] = uvy1;
        this.vbArray[sz++] = texTileUvSize.x;
        this.vbArray[sz++] = texTileUvSize.y;
        this.vbArray[sz++] = frames;
        this.vbArray[sz++] = framerate;

        // Vertices indices
        const tc = Math.floor(i / POINT_STRUCT_SIZE) * 4;
        indices[iz++] = tc;
        indices[iz++] = tc + 1;
        indices[iz++] = tc + 2;
        indices[iz++] = tc + 1;
        indices[iz++] = tc + 3;
        indices[iz++] = tc + 2;
      }

      this.geometry.indexBuffer.update(indices);
      this.geometry.getBuffer("aVertexPosition").update(this.vbBuffer);
    }

    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  }
}
