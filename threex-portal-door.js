// descrated from https://github.com/jeromeetienne/AR.js/blob/024318c67121bd57045186b83b42f10c6560a34a/aframe/demos/demo-portal-door/src/threex-portal-door.js
var THREEx = THREEx || {}

THREEx.Portal360 = function(videoImageURL, doorWidth, doorHeight, doorMeshUrl, doorMaskUrl, doorInsideMaskUrl){
	
	var doorCenter = new THREE.Group
	this.object3d = doorCenter

	//////////////////////////////////////////////////////////////////////////////
	//		build texture360
	//////////////////////////////////////////////////////////////////////////////
	var isVideo = videoImageURL.match(/.(mp4|webm|ogv)/i) ? true : false
	if( isVideo ){
		var video = document.createElement( 'video' )
		video.width = 640;
		video.height = 360;
		video.loop = true;
		video.muted = true;
		video.src = videoImageURL;
		video.crossOrigin = 'anonymous'
		video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
		video.play();

		var texture360 = new THREE.VideoTexture( video );
		texture360.minFilter = THREE.LinearFilter;
		texture360.format = THREE.RGBFormat;	
		texture360.flipY = false;		
	}else{
		var texture360 = new THREE.TextureLoader().load(videoImageURL)
		texture360.minFilter = THREE.NearestFilter;
		texture360.format = THREE.RGBFormat;
		texture360.flipY = false;		
	}
    this.texture360 = texture360
    this._fetchMesh(doorMeshUrl, 'Portal', this, 
        function(doorMesh, parentThis) { parentThis._fetchMesh(doorMaskUrl, "PortalMask", parentThis, 
        function(doorMask, parentThis) { parentThis._fetchMesh(doorInsideMaskUrl, "PortalInsideMask", parentThis, 
        function(insideMask, parentThis) { parentThis._finishDoor(doorMesh, doorMask, insideMask, parentThis) }) }) } , )
}

THREEx.Portal360.prototype._fetchMesh = function(doorMeshUrl, meshName, parentThis, next){
    const loader = new THREE.GLTFLoader();
    loader.load(
        // resource URL
        doorMeshUrl,
        // called when the resource is loaded
        function ( gltf ) {
            var mesh = gltf.scene.getObjectByName(meshName);
            next(mesh, parentThis)
        },
        function ( error ) {

            console.log( 'An error happened: ' + error );
    
        });
}

THREEx.Portal360.prototype._finishDoor = function(doorMesh, doorMask, doorInsideMask, parentThis){

	//////////////////////////////////////////////////////////////////////////////
	//		build mesh
	//////////////////////////////////////////////////////////////////////////////

	// create insideMesh which is visible IIF inside the portal
	var insideMesh = this._buildInsideMesh(parentThis.texture360, doorMask, doorInsideMask)
	parentThis.object3d.add(insideMesh)
	parentThis.insideMesh = insideMesh

	// create outsideMesh which is visible IIF outside the portal
	var outsideMesh = this._buildOutsideMesh(parentThis.texture360, doorMask)
	parentThis.object3d.add(outsideMesh)
	parentThis.outsideMesh = outsideMesh

	// create frameMesh for the frame of the portal
	//var frameMesh = this._buildRectangularFrame(doorWidth/100, doorWidth, doorHeight)
    //var frameMesh = this._buildGLTFFrame(doorMeshUrl, doorCenter);
    parentThis.object3d.add(doorMesh)
    parentThis.doorMesh = doorMesh
	
}
//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////
THREEx.Portal360.buildTransparentMaterial = function(){
	// if there is a cached version, return it
	if( THREEx.Portal360.buildTransparentMaterial.material ){
		return THREEx.Portal360.buildTransparentMaterial.material
	}
	var material = new THREE.MeshBasicMaterial({
		colorWrite: false // only write to z-buf
	})
	// an alternative to reach the same visual - this one seems way slower tho. My guess is it is hitting a slow-path in gpu
	// var material   = new THREE.MeshBasicMaterial();
	// material.color.set('black')
	// material.opacity   = 0;
	// material.blending  = THREE.NoBlending;
	
	// cache the material
	THREEx.Portal360.buildTransparentMaterial.material = material
	
	return material		
}

//////////////////////////////////////////////////////////////////////////////
//		Build various cache
//////////////////////////////////////////////////////////////////////////////
THREEx.Portal360.buildSquareCache = function(doorMesh){

    //doorMesh.material = THREEx.Portal360.buildTransparentMaterial();

	//var container = new THREE.Group
	// add outter cube - invisibility cloak
	//var geometry = new THREE.PlaneGeometry(50,50);
	var material = THREEx.Portal360.buildTransparentMaterial()

    
    return new THREE.Mesh( doorMesh.geometry, material)

	var mesh = new THREE.Mesh( geometry, material);
	mesh.position.x =  geometry.parameters.width/2 + 0.5
	mesh.position.y = -geometry.parameters.height/2 + 0.5
	container.add(mesh)
	
	var mesh = new THREE.Mesh( geometry, material);
	mesh.position.x = -geometry.parameters.width/2 + 0.5
	mesh.position.y = -geometry.parameters.height/2 - 0.5
	container.add(mesh)
	
	var mesh = new THREE.Mesh( geometry, material);
	mesh.position.x = -geometry.parameters.width/2 - 0.5
	mesh.position.y =  geometry.parameters.height/2 - 0.5
	container.add(mesh)
	
	var mesh = new THREE.Mesh( geometry, material);
	mesh.position.x = +geometry.parameters.width/2 - 0.5
	mesh.position.y =  geometry.parameters.height/2 + 0.5
	container.add(mesh)

	return container
}

//////////////////////////////////////////////////////////////////////////////
//		build meshes
//////////////////////////////////////////////////////////////////////////////

/**
 * create insideMesh which is visible IIF inside the portal
 */
THREEx.Portal360.prototype._buildInsideMesh	= function(texture360, doorMask, insideMask){
	var doorInsideCenter = new THREE.Group

	var geometry = insideMask.geometry
	var material = THREEx.Portal360.buildTransparentMaterial()
	//var material = new THREE.MeshNormalMaterial()
	var insideHoleMask = new THREE.Mesh( geometry, material)
	insideHoleMask.rotation.y = 0
	// mesh.position.z = 0.03
	doorInsideCenter.add( insideHoleMask )


	//////////////////////////////////////////////////////////////////////////////
	//		add 360 sphere
	//////////////////////////////////////////////////////////////////////////////
	// add 360 texture
	// TODO put that in a this.data
	var radius360Sphere = 10
	// var radius360Sphere = 1

	var geometry = new THREE.SphereGeometry( radius360Sphere, 16, 16).rotateZ(Math.PI)
	var material = new THREE.MeshBasicMaterial( {
		map: texture360,
		// opacity: 0.9,
		side: THREE.DoubleSide,
	});
	//var material = new THREE.MeshLambertMaterial()
	var sphere360Mesh = new THREE.Mesh( geometry, material );
	sphere360Mesh.position.z = -0.1
	sphere360Mesh.rotation.y = Math.PI
	doorInsideCenter.add(sphere360Mesh)
	
	return doorInsideCenter
}

/**
 * create outsideMesh which is visible IIF outside the portal
 */
THREEx.Portal360.prototype._buildOutsideMesh = function(texture360, doorMask){
	var doorOutsideCenter = new THREE.Group

	//////////////////////////////////////////////////////////////////////////////
	//		add squareCache
	//////////////////////////////////////////////////////////////////////////////
	var squareCache = THREEx.Portal360.buildSquareCache(doorMask)
	//squareCache.scale.x = doorWidth
	//squareCache.scale.y = doorHeight
	doorOutsideCenter.add( squareCache )

	//////////////////////////////////////////////////////////////////////////////
	//		add 360 sphere
	//////////////////////////////////////////////////////////////////////////////
	// add 360 texture
	var radius360Sphere = 10
	// var radius360Sphere = 1

	// build half sphere geometry
	var geometry = new THREE.SphereGeometry( radius360Sphere, 16, 16, Math.PI, Math.PI, 0, Math.PI).rotateZ(Math.PI)
	// fix UVs
    const uvAttribute = geometry.getAttribute('uv');
    const uv = new THREE.Vector2();
    for ( let i = 0; i < uvAttribute.count; i ++ ) {
        uv.fromBufferAttribute( uvAttribute, i );
        uvAttribute.setXY( i, uv.x / 2, uv.y );
    }
	
	geometry.uvsNeedUpdate = true
	var material = new THREE.MeshBasicMaterial( {
		map: texture360,
		// opacity: 0.9,
		side: THREE.BackSide,
	});
	// var geometry = new THREE.SphereGeometry( radius360Sphere, 16, 16);
	// var material = new THREE.MeshNormalMaterial()
	var sphere360Mesh = new THREE.Mesh( geometry, material );
	sphere360Mesh.position.z = -0.1
	doorOutsideCenter.add(sphere360Mesh)
	
	return doorOutsideCenter
}

/**
 * create frameMesh for the frame of the portal
 */
THREEx.Portal360.prototype._buildRectangularFrame = function(radius, width, height){
	var container = new THREE.Group
	var material = new THREE.MeshNormalMaterial()
	var material = new THREE.MeshPhongMaterial({
		color: 'silver',
		emissive: 'green'
	})

	var geometryBeamVertical = new THREE.CylinderGeometry(radius, radius, height - radius)

	// mesh right
	var meshRight = new THREE.Mesh(geometryBeamVertical, material)
	meshRight.position.x = width/2
	container.add(meshRight)

	// mesh right
	var meshLeft = new THREE.Mesh(geometryBeamVertical, material)
	meshLeft.position.x = -width/2
	container.add(meshLeft)

	var geometryBeamHorizontal = new THREE.CylinderGeometry(radius, radius, width - radius).rotateZ(Math.PI/2)

	// mesh top
	var meshTop = new THREE.Mesh(geometryBeamHorizontal, material)
	meshTop.position.y = height/2
	container.add(meshTop)

	// mesh bottom
	var meshBottom = new THREE.Mesh(geometryBeamHorizontal, material)
	meshBottom.position.y = -height/2
	container.add(meshBottom)

	return container
}	

//////////////////////////////////////////////////////////////////////////////
//		update function
//////////////////////////////////////////////////////////////////////////////

THREEx.Portal360.prototype.update = function () {
	// determine if the user is isOutsidePortal   
    var cameraEl = document.getElementById("camera");   
    var localPosition = new THREE.Vector3();
    localPosition.setFromMatrixPosition(cameraEl.object3D.matrixWorld)
	this.object3d.worldToLocal(localPosition)
	var isOutsidePortal = localPosition.z >= 0 ? true : false

	// handle mesh visibility based on isOutsidePortal
    if (this.outsideMesh != undefined && this.insideMesh != undefined)
    {
        if( isOutsidePortal ){
            this.outsideMesh.visible = true
            this.insideMesh.visible = false
        }else{
            
            this.outsideMesh.visible = false
            this.insideMesh.visible = true
           //console.log("is inside")
        }
    }
}
