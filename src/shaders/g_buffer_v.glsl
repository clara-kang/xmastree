precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 color;

in mat4 instanceMatrix;
in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vWorldPosition;
out vec3 vWorldNormal;
out vec3 vColor;
out vec2 vUV;


void main() {
  mat4 setModelMatrix = determinant(instanceMatrix) == 0.0 ? modelMatrix : instanceMatrix;
  mat3 normalMatrix = mat3(setModelMatrix);
  normalMatrix[0] = normalMatrix[0] / length(normalMatrix[0]);
  normalMatrix[1] = normalMatrix[1] / length(normalMatrix[1]);
  normalMatrix[2] = normalMatrix[2] / length(normalMatrix[2]);

  vWorldPosition = (setModelMatrix * vec4(position, 1.0)).xyz;
  vWorldNormal = normalMatrix * normal;
  vColor = color;
  vUV = uv;

  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
}