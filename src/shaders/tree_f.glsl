precision highp float;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

in mat4 vInstanceMatrix;
in vec3 vPosition;
out vec4 fragmentColor;

const float repetitionUnit = 0.05;
const float needleWidth = 0.02;
const float leafWidth = 0.2;
const float ambient = 0.2;

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
    vec3 normalZ = normalize(cross(Xworld, Yworld));
    vec3 leafToCam = cameraPosition - vInstanceMatrix[3].xyz;
    float normalMultiplier = step(0.0, dot(leafToCam, normalZ)) * 2.0 - 1.0;
    normalZ *= normalMultiplier;
    // vec3 normal = normalize(normalY * normalYfrac + normalZ * normalZfrac);
    vec3 normal = normalZ;

    vec3 posWorld = vec3(vInstanceMatrix * vec4(vPosition, 1.0));
    float maxDistToTrunkAtY = max(2.5 * (5.0 - posWorld.y) / 5.0, 0.0);
    float shadowFrac = min((maxDistToTrunkAtY - length(posWorld.xz)) / maxDistToTrunkAtY, 1.0);
    float diffuse = max( normal.y, 0.0);
    diffuse = min(diffuse + ambient, 1.0);
    fragmentColor = vec4(vec3(diffuse * (1.0 - shadowFrac)), 1.0);
  } else {
    discard;
  }
}