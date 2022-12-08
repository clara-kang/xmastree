precision highp float;

uniform mat4 modelMatrix;
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
  vWorldPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
  vWorldNormal = mat3(modelMatrix) * normal;
  vColor = color;

  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
}