precision highp float;

uniform sampler2D colorTex;
uniform sampler2D depthTex;

in vec2 uv;
out vec4 fragmentColor;

void main() {
  // fragmentColor = vec4(1.0);
  fragmentColor = texture(colorTex, uv);

  gl_FragDepth = texture(depthTex, uv).x;
}