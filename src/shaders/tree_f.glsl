precision highp float;

uniform sampler2D leafTex;
uniform mat4 modelMatrix;

in vec3 vPosition;
out vec4 fragmentColor;

const float repetitionUnit = 0.05;
const float needleWidth = 0.02;
const float leafWidth = 0.2;

void main() {
  float scaleY = length(modelMatrix[1]);
  float k = (vPosition.y * scaleY - vPosition.x) / repetitionUnit;
  
  if (k < 0.0 || k > ( scaleY - leafWidth / 2.0) / repetitionUnit) {
  // if (k < 0.0) {
    discard;
    // fragmentColor = vec4(1.0, 0.0, 1.0, 1.0);
  }

  float residue = (k - floor(k));

  if (residue < needleWidth / repetitionUnit) {
    // discard;
    fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else {
    // fragmentColor = color;
    discard;
    // fragmentColor = vec4(1.0, 0.0, 1.0, 1.0);
  }
  // fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
}