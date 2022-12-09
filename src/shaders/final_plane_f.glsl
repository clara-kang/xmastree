precision highp float;

uniform sampler2D colorTex;
uniform sampler2D depthTex;

in vec2 uv;
out vec4 fragmentColor;

void main() {
  vec3 color = texture(colorTex, uv).xyz;

  if (length(color.xyz) == 0.0) {
    discard;
  } else {
    fragmentColor = vec4(color, 1.0);

    gl_FragDepth = texture(depthTex, uv).x;
  }
}