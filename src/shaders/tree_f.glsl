precision highp float;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in mat4 vInstanceMatrix;
in vec3 vPosition;
out vec4 fragmentColor;

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
    float normalYfrac = residue - 0.5;
    float normalZfrac = sqrt(1.0 - normalYfrac * normalYfrac);
    // vec3 normal = vec3(-sqrt(2.0) / 2.0, sqrt(2.0) / 2.0, 0.0) * normalYfrac + vec3(0.0, 0.0, 1.0) * normalZfrac;
    // vec3 normal = vec3(0.0, 0.0, 1.0);

    // mat4 normalMatrix = vInstanceMatrix;
    // normalMatrix[1] = normalMatrix[1] / scaleY;
    // normalMatrix = transpose(inverse(normalMatrix));

    vec3 Xworld = vInstanceMatrix[0].xyz;
    vec3 Yworld = vInstanceMatrix[1].xyz / scaleY;
    vec3 normalY = -(sqrt(2.0) / 2.0) * Xworld + (sqrt(2.0) / 2.0) * Yworld;
    vec3 normalZ = normalize(cross(vInstanceMatrix[0].xyz, vInstanceMatrix[1].xyz / scaleY));
    vec3 normalZViewCoord = vec3(viewMatrix * vec4(normalZ, 0.0));
    normalZ *= normalZViewCoord.z > 0.0 ? 1.0 : -1.0;
    // vec3 normal = normalize(normalY * normalYfrac + normalZ * normalZfrac / 2.0);
    vec3 normal = normalize(normalZ);

    vec3 posWorld = vec3(vInstanceMatrix * vec4(vPosition, 1.0));
    float maxDistToTrunkAtY = max(2.5 * (5.0 - posWorld.y) / 5.0, 0.0);
    float shadowFrac = min((maxDistToTrunkAtY - length(posWorld.xz)) / maxDistToTrunkAtY, 1.0);
    float diffuse = max( normal.y, 0.0);
    diffuse = min(diffuse + 0.2, 1.0);
    // float diffuse = length(normalMatrix[1]) - 0.5;
    fragmentColor = vec4(vec3(diffuse * (1.0 - shadowFrac)), 1.0);
  } else {
    discard;
  }
}