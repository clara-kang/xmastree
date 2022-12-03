precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

in vec3 position;

void main() {
  mat4 modifiedModelMatrix = modelMatrix;
  modifiedModelMatrix[3][1] = time;
  gl_Position = projectionMatrix * viewMatrix * modifiedModelMatrix * vec4(position, 1.0);
}