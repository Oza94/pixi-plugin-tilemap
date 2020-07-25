# Pixi Tilemap Plugin

Fast tilemap rendering with PIXI.js V5. Compatible with module bundlers.

This plugin uploads all tiles indices of a layer in a single geometry therefore making only 1 draw call per layer. It also supports linear-time tiles animations.

![Demo screenshot](https://i.imgur.com/kZjPQt1.png)

## Usage

This plugin only works for PIXI v5+.

Using this plugin is pretty simple :

```js
import { TilemapRenderer, Tilemap, Tileset, Vector2 } from "pixi-tilemap-plugin";

// Add the plugin
Renderer.registerPlugin("tilemap", TilemapRenderer);

// ...

// Creates a tileset from a texture specifying tile size
// Texture must be loaded for this to properly work
const tileset = new Tileset(texture, { tileSize: 16 });
// Add each layer to the stage using their array of tiles indices
stage.addChild(new Tilemap(tileset, new Vector2(4, 4), [
  7, 8, 8, 9,
  4, 0, 0, 4,
  4, 0, 0, 4,
  1, 0, 2, 3,
]));
```

The layer indices array layout follows [Tiled](https://www.mapeditor.org/)'s CSV format which is pretty common for storing tilemaps data.

See full working demo in `demo/`.

## Limitations 

This plugin is build for performance, as a result it comes with limits :

- Currently you can use one texture per layer (see improvements)
- Tilemaps can't have children
- Individual tile transforms (e.g. rotation) are not supported
- Filters are not supported (although you can use a parent container)

## Improvements

There's no timeline but I'll eventualy add the following features to this plugin :

- Non square tiles (this is already implemented at shader level)
- Composite layers (single geometry for multiple layers)
- Multiple textures for a single layer
- Isometric support ?

## Alternative

You may look at [pixi-tilemap](https://github.com/pixijs/pixi-tilemap) for pixi v4 that supports textures atlases & other stuff compared to this library.



