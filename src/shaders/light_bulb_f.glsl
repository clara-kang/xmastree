precision highp float;


in vec3 vWorldPosition;

out vec4 fragmentColor;

uniform sampler2D positionTex;
uniform sampler2D colorTex;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

const vec3 lightColor = vec3(255.0, 215.0, 13.0) / 255.0;
const float lightRadius = 0.2;

void main() {

  vec2 texCoord = gl_FragCoord.xy/vec2(textureSize(positionTex, 0));

  vec3 targetPosition = texture(positionTex, texCoord).xyz;
  vec3 targetColor = texture(colorTex, texCoord).xyz;
  float theta = texture(positionTex, texCoord).w;
  float phi = texture(colorTex, texCoord).w;

  vec3 targetNormal = vec3(cos(theta) * sin(phi), sin(theta) * sin(phi), cos(phi));
  vec3 centerWorldPosition = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  float distToLight = length(centerWorldPosition - targetPosition);
  vec3 toLight = normalize(vWorldPosition - targetPosition);
  float diffuse = max(0.0, dot(toLight, targetNormal)) * (1.0 - clamp(distToLight / lightRadius, 0.0, 1.0));

  bool hasTargetColor = length(targetColor.xyz) > 0.0;

  if (hasTargetColor) {
    fragmentColor = vec4(diffuse * lightColor + targetColor, hasTargetColor);
  } else {
    discard;
  }
}