precision highp float;

uniform sampler2D positionTex;
uniform sampler2D colorTex;
uniform sampler2D depthTex;

in vec2 uv;
out vec4 fragmentColor;

const float ambient = 0.2;

void main() {
  vec3 color = texture(colorTex, uv).xyz;

  if (length(color.xyz) == 0.0) {
    discard;
  } else {
    // fragmentColor = vec4(color, 1.0);
    vec3 posWorld = texture(positionTex, uv).xyz;
    float theta = texture(positionTex, uv).w;
    float phi = texture(colorTex, uv).w;

    vec3 normalWorld = vec3(cos(theta) * sin(phi), sin(theta) * sin(phi), cos(phi));
    float maxDistToTrunkAtY = max(2.5 * (5.0 - posWorld.y) / 5.0, 0.0);
    float shadowFrac = min((maxDistToTrunkAtY - length(posWorld.xz)) / maxDistToTrunkAtY, 1.0);
    float diffuse = max( normalWorld.y, 0.0) * 0.5;
    diffuse = min(diffuse + ambient, 1.0);


    fragmentColor = vec4(diffuse * (1.0 - shadowFrac) * color, 1.0);
    // fragmentColor = vec4(color, 1.0);

    gl_FragDepth = texture(depthTex, uv).x;
  }
}