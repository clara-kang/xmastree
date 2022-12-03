precision highp float;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;


out vec4 fragmentColor;


void main() {
  fragmentColor = vec4(1.0, 0.0, 0.0, 1.0);
}