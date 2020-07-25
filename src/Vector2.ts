export default class Vector2 {
  x: number = 0;
  y: number = 0;

  static fromArray([x, y]: Array<number>) {
    return new Vector2(x, y);
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get magnitude(): number {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  multn(n: number) {
    this.x = this.x * n;
    this.y = this.y * n;
    return this;
  }

  divn(n: number) {
    this.x = this.x / n;
    this.y = this.y / n;
    return this;
  }

  from(v: Vector2) {
    this.x = v.x;
    this.y = v.y;
  }

  clamp(magnitude: number) {
    const mult = this.magnitude / magnitude;
    if (mult > 1) {
      this.x = this.x / mult;
      this.y = this.y / mult;
    }
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}
