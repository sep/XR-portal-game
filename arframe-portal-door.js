/* global AFRAME, THREE */
AFRAME.registerComponent('arjs-portal-door', {
	schema: {
		url : {		// Url of the content - may be video or image
			type: 'string',
            default: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg"
		},
		doorMesh : {	// door gltf
			type: 'string',
            default: "/assets/gltf/portal.gltf"
		},
		doorMask : {	// door gltf
			type: 'string',
            default: "/assets/gltf/portal_mask.gltf"
		},
		doorInsideMask : {	// door gltf
			type: 'string',
            default: "/assets/gltf/portal_inside_mask.gltf"
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
	},
	tick: function(){
		this._portalDoor.update()
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