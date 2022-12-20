precision highp float;

uniform bool normaTexProvided;
uniform sampler2D normalTex;

in vec3 vWorldPosition;
in vec3 vWorldNormal;
in vec3 vColor;
in vec2 vUV;

layout(location = 0) out vec4 fragmentPosition;
layout(location = 1) out vec4 fragmentColor;

void main() {
  fragmentPosition.xyz = vWorldPosition;
  fragmentColor.xyz = vColor;

  vec3 dPosdxDir = normalize(dFdx(vWorldPosition));
  vec3 dPosdyDir = normalize(dFdy(vWorldPosition));
  vec2 dUVdx = dFdx(vUV);
  vec2 dUVdy = dFdy(vUV);

  vec2 uDirScreen = normalize(vec2(dUVdx.x, dUVdy.x));
  vec2 vDirScreen = normalize(vec2(dUVdx.y, dUVdy.y));

  vec3 tangent = uDirScreen.x * dPosdxDir + uDirScreen.y * dPosdyDir;
  vec3 bitangent = vDirScreen.x * dPosdxDir + vDirScreen.y * dPosdyDir;

  vec3 deviatedNormal = mix(vec3(0.0, 0.0, 1.0), (texture(normalTex, vUV).xyz * 2.0 - 1.0), float(normaTexProvided));

  vec3 normal = deviatedNormal.x * tangent + deviatedNormal.y * bitangent + deviatedNormal.z * vWorldNormal;
  fragmentPosition.w = atan(normal.y, normal.x);
  fragmentColor.w = acos(normal.z);
}