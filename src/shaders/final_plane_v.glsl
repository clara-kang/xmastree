precision highp float;

in vec3 position;

out vec2 uv;

void main() {
  gl_Position = vec4(position, 1.0);
  // vNormal = (transpose(inverse(modelMatrix)) * vec4(normal,0.0)).xyz;
  uv = (position.xy + 1.0) / 2.0;
}