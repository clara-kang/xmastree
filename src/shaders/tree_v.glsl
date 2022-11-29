precision highp float;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in mat4 instanceMatrix;
in vec3 position;
in vec3 normal;

out mat4 vInstanceMatrix;
out vec3 vPosition;

void main() {
  gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
  // vNormal = (transpose(inverse(modelMatrix)) * vec4(normal,0.0)).xyz;
  vPosition = position;
  vInstanceMatrix = instanceMatrix;
}