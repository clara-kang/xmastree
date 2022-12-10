precision highp float;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

in mat4 vInstanceMatrix;
in vec3 vPosition;
layout(location = 0) out vec4 fragmentPosition;
layout(location = 1) out vec4 fragmentColor;

const vec3 leafColor = vec3(58.0, 95.0, 11.0) / 255.0;
const float repetitionUnit = 0.05;
const float needleWidth = 0.02;
const float leafWidth = 0.2;

void main() {
  float scaleY = length(vInstanceMatrix[1]);
  float k = (vPosition.y * scaleY - vPosition.x) / repetitionUnit;
  
  if (k < 0.0 || k > ( scaleY - leafWidth / 2.0) / repetitionUnit) {
    discard;;
  }

  float residue = (k - floor(k));

  if (residue < needleWidth / repetitionUnit) {
    float normalYfrac = residue / (needleWidth / repetitionUnit) - 0.5;
    float normalZfrac = sqrt(1.0 - normalYfrac * normalYfrac);

    vec3 Xworld = vInstanceMatrix[0].xyz;
    vec3 Yworld = vInstanceMatrix[1].xyz / scaleY;
    vec3 normalY = -(sqrt(2.0) / 2.0) * Xworld + (sqrt(2.0) / 2.0) * Yworld;
    vec3 normal = normalize(cross(Xworld, Yworld));

    // determine which normal based on camera position
    vec3 leafToCam = cameraPosition - vInstanceMatrix[3].xyz;
    float normalMultiplier = step(0.0, dot(leafToCam, normal)) * 2.0 - 1.0;
    normal *= normalMultiplier;
    vec3 posWorld = vec3(vInstanceMatrix * vec4(vPosition, 1.0));

    fragmentColor = vec4(leafColor, 1.0);
    fragmentPosition = vec4(posWorld, 1.0);

    fragmentPosition.w = atan(normal.y, normal.x);
    fragmentColor.w = acos(normal.z);
  } else {
    discard;
  }
}