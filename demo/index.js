import { Renderer, Container, Loader } from "pixi.js";
import {
  TilemapRenderer,
  Tilemap,
  Tileset,
  Vector2,
} from "../dist/pixi-plugin-tilemap.esm";
import layers from "./layers.json";
import TILESET_URL from "./tileset.png";

const MAP_WIDTH = 24;
const MAP_HEIGHT = 24;
const TILE_SIZE = 16;

// Add the plugin
Renderer.registerPlugin("tilemap", TilemapRenderer);

// Creates the renderer & root stage
const renderer = new Renderer({
  width: MAP_WIDTH * TILE_SIZE,
  height: MAP_HEIGHT * TILE_SIZE,
  resolution: window.devicePixelRatio,
  autoDensity: true,
});
document.body.appendChild(renderer.view);
const stage = new Container();

// Main render loop, nothing to see here
function render() {
  renderer.render(stage);
  requestAnimationFrame(render);
}

const loader = new Loader();
loader.add("tileset", TILESET_URL);
loader.load((_, resources) => {
  // Creates a tileset from the texture specifying tile size
  const tileset = new Tileset(resources.tileset.texture, {
    tileSize: TILE_SIZE,
  });
  // Add each layer to the stage using their array of tiles indices
  layers.forEach((layer) => {
    stage.addChild(new Tilemap(tileset, new Vector2(24, 24), layer));
  });
  render();
});
