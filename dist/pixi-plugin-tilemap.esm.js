import { Program, Shader, Matrix, QuadUv, ObjectRenderer, Buffer, Geometry, DisplayObject } from 'pixi.js';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aFrame;\nattribute vec2 aFrameSize;\nattribute float aAnimFrames;\nattribute float aAnimTime;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\nuniform float uTime; \n\nvarying vec2 vTextureCoord;\n\nfloat animationFrame;\n\nvoid main(void)\n{\n  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  animationFrame = floor(mod(floor(uTime / aAnimTime), aAnimFrames));\n  vTextureCoord = aFrame.xy + vec2(aFrameSize.x * animationFrame, 0);\n}";

var fragment = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform vec4 uTextureClamp;\nuniform vec4 uColor;\n\nvoid main(void)\n{\n    vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n}";

var TilemapShader = /** @class */ (function (_super) {
    __extends(TilemapShader, _super);
    function TilemapShader() {
        var _this = _super.call(this, new Program(vertex, fragment, "tilemap")) || this;
        _this.uniforms.uTime = 0;
        return _this;
    }
    return TilemapShader;
}(Shader));

var TilemapRenderer = /** @class */ (function (_super) {
    __extends(TilemapRenderer, _super);
    function TilemapRenderer(renderer) {
        var _this = _super.call(this, renderer) || this;
        _this._matrix = new Matrix();
        _this.quad = new QuadUv();
        _this.shader = new TilemapShader();
        return _this;
    }
    TilemapRenderer.prototype.render = function (tilemap) {
        this.shader.uniforms.translationMatrix = tilemap.transform.worldTransform.toArray(true);
        this.shader.uniforms.uSampler = tilemap.tileset.texture;
        this.shader.uniforms.uTime = performance.now();
        this.renderer.shader.bind(this.shader);
        this.renderer.geometry.bind(tilemap.geometry);
        this.renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6 * tilemap.tileCount, 0);
    };
    return TilemapRenderer;
}(ObjectRenderer));

var TileGeometry = /** @class */ (function (_super) {
    __extends(TileGeometry, _super);
    function TileGeometry() {
        var _this = _super.call(this) || this;
        _this.vertSize = 8;
        _this.vertPerQuad = 4;
        _this.stride = _this.vertSize * 4;
        _this.buffer = new Buffer(new Float32Array(2), true, false);
        // Vertex position
        _this.addAttribute("aVertexPosition", _this.buffer, 2, false, 0, _this.stride, 0);
        // Frame position
        _this.addAttribute("aFrame", _this.buffer, 2, false, 0, _this.stride, 2 * 4);
        // Frame size
        _this.addAttribute("aFrameSize", _this.buffer, 2, false, 0, _this.stride, 4 * 4);
        // Animation length (0 means no animation)
        _this.addAttribute("aAnimFrames", _this.buffer, 1, false, 0, _this.stride, 6 * 4);
        // Animation framerate (in ms)
        _this.addAttribute("aAnimTime", _this.buffer, 1, false, 0, _this.stride, 7 * 4);
        _this.indexBuffer = new Buffer(undefined, true, true);
        _this.addIndex(_this.indexBuffer);
        return _this;
    }
    return TileGeometry;
}(Geometry));

var POINT_STRUCT_SIZE = 5;
var Tilemap = /** @class */ (function (_super) {
    __extends(Tilemap, _super);
    function Tilemap(tileset, size, data) {
        var _this = _super.call(this) || this;
        _this.pluginName = "tilemap";
        _this.tileCount = 0;
        _this._vertices = 0;
        _this.tileset = tileset;
        _this.size = size;
        _this.data = [];
        var len = _this.size.x * _this.size.y;
        for (var i = 0; i < len; i++) {
            var tile = data[i];
            if (tile) {
                var anim = _this.tileset.animations[tile];
                _this.data.push(i % _this.size.x, Math.floor(i / _this.size.x), tile - 1, anim ? anim[0] : 1, anim ? anim[1] : 1);
            }
        }
        return _this;
    }
    Tilemap.prototype.render = function (renderer) {
        this.tileCount = this.data.length / POINT_STRUCT_SIZE;
        // TODO: good spot for gl context recover
        if (!this.geometry) {
            this.geometry = new TileGeometry();
            this._vertices = 0;
        }
        var vertices = this.tileCount * this.geometry.vertPerQuad;
        if (this._vertices !== vertices) {
            this._vertices = vertices;
            var vbStride = this.geometry.stride * vertices;
            var indices = new Uint32Array(this.tileCount * 6);
            var _a = this.tileset, tileSize = _a.tileSize, texTileSize = _a.texTileSize, texTileUvSize = _a.texTileUvSize;
            if (!this.vbBuffer || this.vbBuffer.byteLength < vbStride) {
                this.vbBuffer = new ArrayBuffer(vbStride);
                this.vbArray = new Float32Array(this.vbBuffer);
                this.vbInts = new Uint32Array(this.vbBuffer);
                this.geometry.getBuffer("aVertexPosition").update(this.vbBuffer);
            }
            // Upload vertices
            for (var i = 0, sz = 0, iz = 0; i < this.data.length; i += POINT_STRUCT_SIZE) {
                var x = this.data[i];
                var y = this.data[i + 1];
                var tile = this.data[i + 2];
                // Tile animation properties
                var framerate = this.data[i + 3];
                var frames_1 = this.data[i + 4];
                // Vertex positions
                var x0 = x * tileSize;
                var x1 = x0 + tileSize;
                var y0 = y * tileSize;
                var y1 = y0 + tileSize;
                // Compute texture uvs from tile position
                var tx = tile % texTileSize.x;
                var ty = Math.floor(tile / texTileSize.x);
                var uvx0 = tx * texTileUvSize.x;
                var uvx1 = uvx0 + texTileUvSize.x;
                var uvy0 = ty * texTileUvSize.y;
                var uvy1 = uvy0 + texTileUvSize.y;
                // Top-left vertice
                this.vbArray[sz++] = x0;
                this.vbArray[sz++] = y0;
                this.vbArray[sz++] = uvx0;
                this.vbArray[sz++] = uvy0;
                this.vbArray[sz++] = texTileUvSize.x;
                this.vbArray[sz++] = texTileUvSize.y;
                this.vbArray[sz++] = frames_1;
                this.vbArray[sz++] = framerate;
                // Top-right
                this.vbArray[sz++] = x1;
                this.vbArray[sz++] = y0;
                this.vbArray[sz++] = uvx1;
                this.vbArray[sz++] = uvy0;
                this.vbArray[sz++] = texTileUvSize.x;
                this.vbArray[sz++] = texTileUvSize.y;
                this.vbArray[sz++] = frames_1;
                this.vbArray[sz++] = framerate;
                // Bottom-left
                this.vbArray[sz++] = x0;
                this.vbArray[sz++] = y1;
                this.vbArray[sz++] = uvx0;
                this.vbArray[sz++] = uvy1;
                this.vbArray[sz++] = texTileUvSize.x;
                this.vbArray[sz++] = texTileUvSize.y;
                this.vbArray[sz++] = frames_1;
                this.vbArray[sz++] = framerate;
                // Bottom-right
                this.vbArray[sz++] = x1;
                this.vbArray[sz++] = y1;
                this.vbArray[sz++] = uvx1;
                this.vbArray[sz++] = uvy1;
                this.vbArray[sz++] = texTileUvSize.x;
                this.vbArray[sz++] = texTileUvSize.y;
                this.vbArray[sz++] = frames_1;
                this.vbArray[sz++] = framerate;
                // Vertices indices
                var tc = Math.floor(i / POINT_STRUCT_SIZE) * 4;
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
    };
    return Tilemap;
}(DisplayObject));

var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    Vector2.fromArray = function (_a) {
        var x = _a[0], y = _a[1];
        return new Vector2(x, y);
    };
    Vector2.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Object.defineProperty(Vector2.prototype, "magnitude", {
        get: function () {
            return Math.abs(this.x) + Math.abs(this.y);
        },
        enumerable: false,
        configurable: true
    });
    Vector2.prototype.multn = function (n) {
        this.x = this.x * n;
        this.y = this.y * n;
        return this;
    };
    Vector2.prototype.divn = function (n) {
        this.x = this.x / n;
        this.y = this.y / n;
        return this;
    };
    Vector2.prototype.from = function (v) {
        this.x = v.x;
        this.y = v.y;
    };
    Vector2.prototype.clamp = function (magnitude) {
        var mult = this.magnitude / magnitude;
        if (mult > 1) {
            this.x = this.x / mult;
            this.y = this.y / mult;
        }
    };
    Vector2.prototype.floor = function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    return Vector2;
}());

var Tileset = /** @class */ (function () {
    function Tileset(texture, options) {
        if (options === void 0) { options = {}; }
        this.animations = {};
        this.texture = texture;
        this.tileSize = options.tileSize || 16;
        var _a = this.texture.baseTexture, width = _a.width, height = _a.height;
        this.texTileSize = new Vector2(width, height).divn(this.tileSize).floor();
        this.texTileUvSize = new Vector2(this.tileSize / width, this.tileSize / height);
        if (options.animations) {
            for (var i = 0; i < options.animations.length; i += 3) {
                this.animations[options.animations[i]] = [
                    options.animations[i + 1],
                    options.animations[i + 2],
                ];
            }
        }
    }
    return Tileset;
}());

export { Tilemap, TilemapRenderer, Tileset, Vector2 };
