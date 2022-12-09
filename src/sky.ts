/*
use code from https://github.com/mrdoob/three.js/blob/4a1a4ca8815c561827910b3914c276f54dc1da85/examples/jsm/objects/Sky.js
*/

// @ts-nocheck

/**
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight
 *
 * First implemented by Simon Wallner
 * http://simonwallner.at/project/atmospheric-scattering/
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/

import {
	BackSide,
	BoxGeometry,
	Mesh,
	ShaderMaterial,
	Vector3
} from 'three';

const skyVertexShader = require('./shaders/sky_v.glsl');
const skyFragmentShader = require('./shaders/sky_f.glsl');

class Sky extends Mesh {
	constructor() {
		const material = new ShaderMaterial( {
			uniforms: {
        'turbidity': { value: 0 },
        'rayleigh': { value: 0.02 },
        'mieCoefficient': { value: 0.005 },
        'mieDirectionalG': { value: 0.8 },
        'sunPosition': { value: new Vector3() },
        'up': { value: new Vector3( 0, 1, 0 ) }
      },
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
			side: BackSide,
			depthWrite: false
		} );

		super( new BoxGeometry( 1, 1, 1 ), material );
		this.isSky = true;
	}
}

export { Sky };
