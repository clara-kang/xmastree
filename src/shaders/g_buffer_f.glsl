precision highp float;

in vec3 vWorldPosition;
in vec3 vWorldNormal;
in vec3 vColor;

layout(location = 0) out vec4 fragmentPosition;
layout(location = 1) out vec4 fragmentColor;

void main() {
  fragmentColor.xyz = vColor;
  fragmentPosition.xyz = vWorldPosition;
  fragmentPosition.w = atan(vWorldNormal.y, vWorldNormal.x);
  fragmentColor.w = acos(vWorldNormal.z);
}