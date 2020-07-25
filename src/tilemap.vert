attribute vec2 aVertexPosition;
attribute vec2 aFrame;
attribute vec2 aFrameSize;
attribute float aAnimFrames;
attribute float aAnimTime;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTransform;
uniform float uTime; 

varying vec2 vTextureCoord;

float animationFrame;

void main(void)
{
  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  animationFrame = floor(mod(floor(uTime / aAnimTime), aAnimFrames));
  vTextureCoord = aFrame.xy + vec2(aFrameSize.x * animationFrame, 0);
}