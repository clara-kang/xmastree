precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;

out vec3 vWorldPosition;

const float diameter = 0.1;

void main() {
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  // vec4 viewSpacePosition = viewMatrix * modelMatrix * vec4(vec3(0.0), 1.0) + vec4(position, 0.0);
  // vModelUV = (position.xy + diameter / 2.0) / diameter;
  // gl_Position = projectionMatrix * viewSpacePosition;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  
}