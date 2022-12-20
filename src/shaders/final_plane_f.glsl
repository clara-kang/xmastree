precision highp float;

uniform vec3 lightDirctn;
uniform vec3 cameraPosition;

uniform sampler2D positionTex;
uniform sampler2D colorTex;
uniform sampler2D depthTex;

in vec2 uv;
out vec4 fragmentColor;

const float ambientIntensity = 0.3;
const float diffuseLightIntensity = 0.9;
const float hemisphereLightIntensity = 0.2;
const float trunkLength = 5.05;
const float treeConeRadius = 2.5;
const float shininess = 16.0;
const vec3 moonLightColor = vec3(0.2);
const vec3 leafColor = vec3(58.0, 95.0, 11.0) / 255.0;
const vec3 trunkColor = vec3(139.0, 69.0, 19.0) * 0.5 / 255.0;

void main() {
  vec3 color = texture(colorTex, uv).xyz;
  bool isNotTree = length(color - leafColor) > 0.001 && length(color - trunkColor) > 0.001;

  if (length(color.xyz) == 0.0) {
    discard;
  } else {
    vec3 posWorld = texture(positionTex, uv).xyz;
    float theta = texture(positionTex, uv).w;
    float phi = texture(colorTex, uv).w;

    vec3 normalWorld = vec3(cos(theta) * sin(phi), sin(theta) * sin(phi), cos(phi));
    vec3 toCamera = cameraPosition - posWorld;

    vec2 normalTreeXZ = normalize(posWorld.xz) * trunkLength;
    vec3 normalTree = normalize(vec3(normalTreeXZ[0], treeConeRadius, normalTreeXZ[1]));
    float maxDistToTrunkAtY = max(treeConeRadius * (trunkLength - posWorld.y) / trunkLength, 0.0);

    // darker towards axis of tree
    float ambientShadowFrac = min((maxDistToTrunkAtY - length(posWorld.xz)) / maxDistToTrunkAtY, 1.0);
    // darker on sides not facing light
    float diffuseShadowFrac = 1.0 - max(0.0, dot(normalTree, lightDirctn));
    // brighter when facing up
    float hemisphereDiffuse = max(normalWorld.y, 0.0) * hemisphereLightIntensity;
    // brighter when facing direct light
    float directLightDiffuse = max(dot(normalWorld, lightDirctn), 0.0) * diffuseLightIntensity;
    vec3 halfwayDir = normalize(lightDirctn + normalize(toCamera));
    float spec = pow(max(dot(normalWorld, halfwayDir), 0.0), shininess);

    float totalLight = min(directLightDiffuse * (1.0 - diffuseShadowFrac) + ambientIntensity * (1.0 - ambientShadowFrac) + hemisphereDiffuse, 1.0);


    fragmentColor = vec4(totalLight * color + spec * float(isNotTree) * moonLightColor, 1.0);
    gl_FragDepth = texture(depthTex, uv).x;
  }
}