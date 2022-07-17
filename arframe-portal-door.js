/* global AFRAME, THREE */
AFRAME.registerComponent('arjs-portal-door', {
	schema: {
		url : {		// Url of the content - may be video or image
			type: 'string',
            default: "https://sep.github.io/XR-portal-game/assets/images/jwst_mapped_edited.jpg"
		},
		doorMesh : {	// door gltf
			type: 'string',
            default: "https://sep.github.io/XR-portal-game/assets/gltf/portal.gltf"
		},
		doorMask : {	// door gltf
			type: 'string',
            default: "https://sep.github.io/XR-portal-game/assets/gltf/portal_mask.gltf"
		},
		doorInsideMask : {	// door gltf
			type: 'string',
            default: "https://sep.github.io/XR-portal-game/assets/gltf/portal_inside_mask.gltf"
		},
		doorWidth : {	// width of the door
			type: 'number',
			default: 1,
		},
		doorHeight : {	// height of the door
			type: 'number',
			default: 1,
		},
	},
	init: function () {
		var _this = this

		var doorWidth = this.data.doorWidth
		var doorHeight = this.data.doorHeight
		var imageURL = this.data.url
        var meshUrl = this.data.doorMesh
        var maskUrl = this.data.doorMask
        var doorInsideMask = this.data.doorInsideMask

		var portalDoor = new THREEx.Portal360(imageURL, doorWidth, doorHeight, meshUrl, maskUrl, doorInsideMask)
		this._portalDoor = portalDoor

		this.el.object3D.add(portalDoor.object3d)

        var doorGltf = this.buildDoorGltf(meshUrl)
        this.doorGltf = doorGltf;
        this.el.appendChild(doorGltf)
        parentThis = this;

        var portalParticles = this.buildParticles();
        this.el.appendChild(portalParticles)
	},
	tick: function(){
		this._portalDoor.update()
	},

    buildDoorGltf: function(meshUrl)
    {
        const doorGltf = document.createElement('a-entity');
        doorGltf.setAttribute('response-type', "arraybuffer");
        doorGltf.setAttribute('gltf-model', meshUrl);
        doorGltf.setAttribute('animation-mixer', 'clip: Idle;');
        return doorGltf;
    },

    buildParticles: function() {
        var particles = this.particles = document.createElement('a-entity');
        particles.setAttribute("particle-system", 
            { 
                color: "#DD15FF,#6E0B7F", 
                particleCount: "50",
                randomise: true,
                texture: "./assets/images/smoke.png",
                opacity: "0.2 0",
                dragValue: "500",
                dragSpread: "1",
                type: 3,
                size: "10",
                velocityValue: "0 -0.5 -0.35",
                velocitySpread: "0.2 0.2 0.2",
                accelerationValue: "0 0.05 0",
                accelerationSpread: "0 .005 0",
                positionSpread: "1, 2, 0.2",
                maxAge: 2,
                rotationAxis: "y",
                rotationAngle: "3.14",
            });
        return particles;
    }
});


AFRAME.registerPrimitive('a-portal-door', AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
	defaultComponents: {
		'arjs-portal-door': {},
	},
	mappings: {
		'url': 'arjs-portal-door.url',
		'doorWidth': 'arjs-portal-door.doorWidth',
		'doorHeight': 'arjs-portal-door.doorHeight',
		'doorMesh': 'arjs-portal-door.doorMesh',
		'doorMask': 'arjs-portal-door.doorMask',
		'doorInsideMask': 'arjs-portal-door.doorInsideMask',
	}
}));