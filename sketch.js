const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
  context: 'webgl',
  animate: true,
  dimensions: [564, 317],
  duration: 1,
  fps: 28,
};

// Your glsl code
const frag = glsl(/* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uResolution;

  // First Experiment with GLSL and Shaders.
  // Thanks to @inspirnathan for the tutorial.
  // A few of the loopeing techniques I used here I learned from Etienne Jacob (@etiennejcb)
  
  float TAU = 2.0*3.14159256;
  
  float sdfCircle(vec2 uv, float r, vec2 offset) {
    float x = uv.x - offset.x;
    float y = uv.y - offset.y;
    
    return length(vec2(x, y)) - r;  
  }
  
  vec3 drawScene(vec2 uv) {
    vec3 col = vec3(0);
    
    float t = mod(uTime,1.0);
    
    const int k = 600;
    
    for(float n=0.2; n<=.8; n+=.05)
    for(int i=0; i<k; i++) { 
      float p = (float(i)+t)/float(k);
      float x=p *(uResolution.x/uResolution.y);
      float off = TAU-10.0*n;
      float damp = abs(x-((uResolution.x/uResolution.y)/2.));
      float y=n+.11*pow((1.0-damp),2.0)*sin(20.*x+off - (TAU*t));
      float circle = sdfCircle(uv, 0.004, vec2(x, y));
      col = mix(vec3(1.0+pow((1.0-damp),2.0)*sin(20.*x+off - TAU*t)), col, step(0., circle));      
    }
    
    return col;
  }  

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv.x *= uResolution.x / uResolution.y; 
    
    vec3 col = drawScene(uv);
    
    gl_FragColor = vec4(col, 1.0);
    
    // if (t > 1.0) t = 0.0;
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl, width, height }) => {
  // Create the shader and return it
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      uTime: ({ time, playhead }) => playhead,
      uResolution: () => [width, height],
    },
  });
};

canvasSketch(sketch, settings);
