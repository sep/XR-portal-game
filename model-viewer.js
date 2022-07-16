/* global AFRAME, THREE */
AFRAME.registerComponent('model-viewer', {
    schema: {
      gltfModel: {default: ''},
      title: {default: ''}
    },
    init: function () {
      var el = this.el;
      var floaters = this.floaters = [];
      const portalSpawnPoint = {x: 0, y: 1, z: -5}
      const portalWidth = 2
      const portalHeight = 3

      el.setAttribute('renderer', {colorManagement: true});
      el.setAttribute('cursor', {rayOrigin: 'mouse', fuse: false});
      el.setAttribute('webxr', {optionalFeatures: 'hit-test, local-floor'});
      el.setAttribute('raycaster', {objects: '.raycastable'});

      this.onModelLoaded = this.onModelLoaded.bind(this);

      this.onMouseUp = this.onMouseUp.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseDown = this.onMouseDown.bind(this);

      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);

      this.onOrientationChange = this.onOrientationChange.bind(this);

      this.initCameraRig();
      this.initEntities();
      this.initBackground();

      // Disable context menu on canvas when pressing mouse right button;
      this.el.sceneEl.canvas.oncontextmenu = function (evt) { evt.preventDefault(); };

      window.addEventListener('orientationchange', this.onOrientationChange);

      // Mouse 2D controls.
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mousedown', this.onMouseDown);

      // Mobile 2D controls.
      document.addEventListener('touchend', this.onTouchEnd);
      document.addEventListener('touchmove', this.onTouchMove);

      //this.modelEl.addEventListener('model-loaded', this.onModelLoaded);
      this.spawnPortal(this.el, portalSpawnPoint);
      this.floater = this.spawnFloater(this.el, portalSpawnPoint);
      this.floaters.push(this.floater);
      console.log(floaters);
      this.spawnFloater(this.el, portalSpawnPoint);
      this.spawnFloater(this.el, portalSpawnPoint);
    },

    spawnFloater: function(parent, portalSpawnPoint)  {
      const floaterEl = document.createElement('a-entity');
      floaterEl.setAttribute('response-type', "arraybuffer");
      floaterEl.setAttribute('gltf-model', '/assets/gltf/floater_bug.gltf');
      const x = this.randomFrom0(.5) + portalSpawnPoint.x
      const y = this.randomFrom0(.5) + portalSpawnPoint.y
      const z = portalSpawnPoint.z
      floaterEl.setAttribute('position', AFRAME.utils.coordinates.stringify({x:x, y:y, z:z}));
      floaterEl.setAttribute('scale', '0.05 0.05 0.05');
      floaterEl.setAttribute('animation-mixer', { timeScale: 1, clip: "Flying", repetitions: 1, loop: "once", crossFadeDuration: 0.2});
      parent.append(floaterEl)
      return floater;
    },

    moveFloaters: function(parent, floaters) {
      for (var i = 0; i < this.floaters.length; i++)
      {
        this.floaters[i].distance -= 1;
      }
    },

    spawnPortal: function(parent, portalSpawnPoint) {
      const portalEl = document.createElement('a-entity');
      portalEl.setAttribute('response-type', "arraybuffer");
      portalEl.setAttribute('gltf-model', '/assets/gltf/portal.gltf');
      portalEl.setAttribute('position', AFRAME.utils.coordinates.stringify(portalSpawnPoint));
      portalEl.setAttribute('scale', '0.8 0.8 0.8');
      portalEl.setAttribute('rotation', '0 90 90');
      parent.append(portalEl)
    },
    initCameraRig: function () {
      var cameraRigEl = this.cameraRigEl = document.createElement('a-entity');
      var cameraEl = this.cameraEl = document.createElement('a-entity');
      var rightHandEl = this.rightHandEl = document.createElement('a-entity');
      var leftHandEl = this.leftHandEl = document.createElement('a-entity');

      cameraEl.setAttribute('camera', {fov: 60});
      cameraEl.setAttribute('look-controls', {
        magicWindowTrackingEnabled: false,
        mouseEnabled: false,
        touchEnabled: false
      });

      cameraRigEl.appendChild(cameraEl);
      cameraRigEl.appendChild(rightHandEl);
      cameraRigEl.appendChild(leftHandEl);

      this.el.appendChild(cameraRigEl);
    },
    initBackground: function () {
      const backgroundEl = this.backgroundEl = document.querySelector('a-entity');
      backgroundEl.setAttribute('geometry', {primitive: 'sphere', radius: 65});
      backgroundEl.setAttribute('material', {
        shader: 'background-gradient',
        colorTop: '#37383c',
        colorBottom: '#757575',
        side: 'back'
      });
      backgroundEl.setAttribute('hide-on-enter-ar', '');
    },

    initEntities: function () {
      // Container for our entities to keep the scene clean and tidy.
      var containerEl = this.containerEl = document.createElement('a-entity');
      // Plane used as a hit target for laser controls when in VR mode
      var laserHitPanelEl = this.laserHitPanelEl = document.createElement('a-entity');
      // Models are often not centered on the 0,0,0.
      // We will center the model and rotate a pivot.
      var modelPivotEl = this.modelPivotEl = document.createElement('a-entity');
      // This is our glTF model entity.

      // Real time shadow only used in AR mode.
      var arShadowEl = this.arShadowEl = document.createElement('a-entity');
      // Scene ligthing.
      var lightEl = this.lightEl = document.createElement('a-entity');
      var sceneLightEl = this.sceneLightEl = document.createElement('a-entity');

      sceneLightEl.setAttribute('light', {
        type: 'hemisphere',
        intensity: 1
      });

      modelPivotEl.id = 'modelPivot';

      this.el.appendChild(sceneLightEl);

      //modelEl.id = 'model';

      laserHitPanelEl.id = 'laserHitPanel';
      laserHitPanelEl.setAttribute('position', '0 0 -10');
      laserHitPanelEl.setAttribute('geometry', 'primitive: plane; width: 30; height: 20');
      laserHitPanelEl.setAttribute('material', 'color: red');
      laserHitPanelEl.setAttribute('visible', 'false');
      laserHitPanelEl.classList.add('raycastable');

      this.containerEl.appendChild(laserHitPanelEl);

      //modelEl.setAttribute('rotation', '0 0 0');
      //modelEl.setAttribute('animation-mixer', { timeScale: 1, clip: "Flying", repetitions: 1, loop: "once", crossFadeDuration: 0.2});
      // this.modelEl.addEventListener("action-loop", function (action, loopDelta) {
      //   console.log("Animation finished")
      // });
      //modelEl.setAttribute('shadow', 'cast: true; receive: false');

     // modelPivotEl.appendChild(modelEl);

      arShadowEl.setAttribute('rotation', '-90 0 0');
      arShadowEl.setAttribute('geometry', 'primitive: plane; width: 30.0; height: 30.0');
      arShadowEl.setAttribute('shadow', 'recieve: true');
      arShadowEl.setAttribute('ar-shadows', 'opacity: 0.2');
      arShadowEl.setAttribute('visible', 'false');

      modelPivotEl.appendChild(arShadowEl);

      lightEl.id = 'light';
      lightEl.setAttribute('position', '-2 4 2');
      lightEl.setAttribute('light', {
        type: 'directional',
        castShadow: true,
        shadowMapHeight: 1024,
        shadowMapWidth: 1024,
        shadowCameraLeft: -7,
        shadowCameraRight: 5,
        shadowCameraBottom: -5,
        shadowCameraTop: 5,
        intensity: 0.5,
        target: 'modelPivot'
      });

      this.containerEl.appendChild(lightEl);
      this.containerEl.appendChild(modelPivotEl);

      this.el.appendChild(containerEl);
    },

    onOrientationChange: function () {
      if (AFRAME.utils.device.isLandscape()) {
        this.cameraRigEl.object3D.position.z -= 1;
      } else {
        this.cameraRigEl.object3D.position.z += 1;
      }
    },

    tick: function () {
      var modelPivotEl = this.modelPivotEl;
      var intersection;
      var intersectionPosition;
      var laserHitPanelEl = this.laserHitPanelEl;
      var activeHandEl = this.activeHandEl;

      this.moveFloaters(parent, this.floaters);
      
      if (!this.el.sceneEl.is('vr-mode')) { return; }
      if (!activeHandEl) { return; }
      intersection = activeHandEl.components.raycaster.getIntersection(laserHitPanelEl);
      if (!intersection) {
        activeHandEl.setAttribute('raycaster', 'lineColor', 'white');
        return;
      }
      activeHandEl.setAttribute('raycaster', 'lineColor', '#007AFF');
      intersectionPosition = intersection.point;
      this.oldHandX = this.oldHandX || intersectionPosition.x;
      this.oldHandY = this.oldHandY || intersectionPosition.y;

      modelPivotEl.object3D.rotation.y -= (this.oldHandX - intersectionPosition.x) / 4;
      modelPivotEl.object3D.rotation.x += (this.oldHandY - intersectionPosition.y) / 4;

      this.oldHandX = intersectionPosition.x;
      this.oldHandY = intersectionPosition.y;
    },

    onTouchMove: function (evt) {
      if (evt.touches.length === 1) { this.onSingleTouchMove(evt); }
      if (evt.touches.length === 2) { this.onPinchMove(evt); }
    },

    onSingleTouchMove: function (evt) {
      var dX;
      var dY;
      var modelPivotEl = this.modelPivotEl;
      this.oldClientX = this.oldClientX || evt.touches[0].clientX;
      this.oldClientY = this.oldClientY || evt.touches[0].clientY;

      dX = this.oldClientX - evt.touches[0].clientX;
      dY = this.oldClientY - evt.touches[0].clientY;

      modelPivotEl.object3D.rotation.y -= dX / 200;
      this.oldClientX = evt.touches[0].clientX;

      modelPivotEl.object3D.rotation.x -= dY / 100;

      // Clamp x rotation to [-90,90]
      modelPivotEl.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x), Math.PI / 2);
      this.oldClientY = evt.touches[0].clientY;
    },

    onPinchMove: function (evt) {
      var dX = evt.touches[0].clientX - evt.touches[1].clientX;
      var dY = evt.touches[0].clientY - evt.touches[1].clientY;
      var modelPivotEl = this.modelPivotEl;
      var distance = Math.sqrt(dX * dX + dY * dY);
      var oldDistance = this.oldDistance || distance;
      var distanceDifference = oldDistance - distance;
      var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;

      modelScale -= distanceDifference / 500;
      modelScale = Math.min(Math.max(0.8, modelScale), 2.0);
      // Clamp scale.
      modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);

      this.modelScale = modelScale;
      this.oldDistance = distance;
    },

    onTouchEnd: function (evt) {
      this.oldClientX = undefined;
      this.oldClientY = undefined;
      if (evt.touches.length < 2) { this.oldDistance = undefined; }
    },

    onMouseUp: function (evt) {
      this.leftRightButtonPressed = false;
      if (evt.buttons === undefined || evt.buttons !== 0) { return; }
      this.oldClientX = undefined;
      this.oldClientY = undefined;
    },

    onMouseMove: function (evt) {
      if (this.leftRightButtonPressed) {
        this.dragModel(evt);
      } else {
        this.rotateModel(evt);
      }
    },

    dragModel: function (evt) {
      var dX;
      var dY;
      var modelPivotEl = this.modelPivotEl;
      if (!this.oldClientX) { return; }
      dX = this.oldClientX - evt.clientX;
      dY = this.oldClientY - evt.clientY;
      modelPivotEl.object3D.position.y += dY / 200;
      modelPivotEl.object3D.position.x -= dX / 200;
      this.oldClientX = evt.clientX;
      this.oldClientY = evt.clientY;
    },

    rotateModel: function (evt) {
      var dX;
      var dY;
      var modelPivotEl = this.modelPivotEl;
      if (!this.oldClientX) { return; }
      dX = this.oldClientX - evt.clientX;
      dY = this.oldClientY - evt.clientY;
      modelPivotEl.object3D.rotation.y -= dX / 100;
      modelPivotEl.object3D.rotation.x -= dY / 200;

      // Clamp x rotation to [-90,90]
      modelPivotEl.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x), Math.PI / 2);

      this.oldClientX = evt.clientX;
      this.oldClientY = evt.clientY;
    },

    onModelLoaded: function () {
      this.centerAndScaleModel();
    },

    centerAndScaleModel: function () {
      var box;
      var size;
      var center;
      var scale;
      //var modelEl = this.modelEl;
      var shadowEl = this.shadowEl;
      var gltfObject = modelEl.getObject3D('mesh');

      // Reset position and scales.
      //modelEl.object3D.position.set(0, 0, 0);
      //modelEl.object3D.scale.set(1.0, 1.0, 1.0);
      this.cameraRigEl.object3D.position.z = 3.0;

      // Calculate model size.
      //modelEl.object3D.updateMatrixWorld();
      box = new THREE.Box3().setFromObject(gltfObject);
      size = box.getSize(new THREE.Vector3());

      // Calculate scale factor to resize model to human scale.
      scale = 1.6 / size.y;
      scale = 2.0 / size.x < scale ? 2.0 / size.x : scale;
      scale = 2.0 / size.z < scale ? 2.0 / size.z : scale;

      //modelEl.object3D.scale.set(scale, scale, scale);

      // Center model at (0, 0, 0).
      //modelEl.object3D.updateMatrixWorld();
      box = new THREE.Box3().setFromObject(gltfObject);
      center = box.getCenter(new THREE.Vector3());
      size = box.getSize(new THREE.Vector3());

      // When in mobile landscape we want to bring the model a bit closer.
      if (AFRAME.utils.device.isLandscape()) { this.cameraRigEl.object3D.position.z -= 1; }
    },

    onMouseDown: function (evt) {
      if (evt.buttons) { this.leftRightButtonPressed = evt.buttons === 3; }
      this.oldClientX = evt.clientX;
      this.oldClientY = evt.clientY;
    },

    randomFrom0: function (rangeFrom0) {
      const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      return Math.random() * rangeFrom0 * plusOrMinus;
    }
  });
