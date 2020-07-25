import { Texture } from "pixi.js";
import Vector2 from "./Vector2";

export interface TilesetOptions {
  tileSize?: number;
  // layout : tileIndex, framerate, frames
  animations?: Array<number>;
}

export default class Tileset {
  texture: Texture;
  tileSize: number;
  texTileSize: Vector2;
  texTileUvSize: Vector2;
  animations: Record<number, [number, number]> = {};

  constructor(texture: Texture, options: TilesetOptions = {}) {
    this.texture = texture;
    this.tileSize = options.tileSize || 16;

    const { width, height } = this.texture.baseTexture;
    this.texTileSize = new Vector2(width, height).divn(this.tileSize).floor();
    this.texTileUvSize = new Vector2(
      this.tileSize / width,
      this.tileSize / height
    );

    if (options.animations) {
      for (let i = 0; i < options.animations.length; i += 3) {
        this.animations[options.animations[i]] = [
          options.animations[i + 1],
          options.animations[i + 2],
        ];
      }
    }
  }
}
