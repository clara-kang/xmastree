precision highp float;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 color;

in mat4 instanceMatrix;
in vec3 position;
in vec3 normal;

out vec3 vWorldPosition;
out vec3 vWorldNormal;
out vec3 vColor;


void main() {
  mat3 normalMatrix = mat3(instanceMatrix);
  normalMatrix[0] = normalMatrix[0] / length(normalMatrix[0]);
  normalMatrix[1] = normalMatrix[1] / length(normalMatrix[1]);
  normalMatrix[2] = normalMatrix[2] / length(normalMatrix[2]);

  vWorldPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
  vWorldNormal = normalMatrix * normal;
  vColor = color;

  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
}