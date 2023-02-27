import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import countries from './assets/countries.json';
import tleUrl from './assets/tle.txt';
import globeTextureUrl from './assets/earth-water.png';


class Globe {
  constructor(globeRef, norad, frameTicker) {
    this.scrollOption = { behavior: 'smooth', block: 'nearest', inline: 'start' };

    this.EARTH_RADIUS_KM = 6371; // km
    this.SAT_SIZE = 300; // km
    this.FOCUS_COLOR = 'red';
    this.TIME_STEP = {
      x2: 3 * 1000,
      x5: 10 * 1000,
      x10: 20 * 1000
    }; // per frame
    this.TIME_SELECT = 'x2';
    this.TIME_PAUSE = false;

    this.PATH_TIME_STEP = 30;

    this.globeRef = globeRef;
    this.frameTicker = frameTicker;
    this.time = new Date();
    this.satData = [];
    this.norad = norad;
    this.labelObjs = [];
    this.focusSat = 'OSCAR 7 (AO-7)';

    this.globe = new ThreeGlobe()
      .polygonsData(
        countries.features.filter((d) => d.properties.ISO_A2 !== "AQ")
      )
      .polygonCapColor(() => "rgba(24, 114, 249, 0.5)")
      .polygonSideColor(() => "rgba(167, 200, 249, 0.1)")
      .showAtmosphere(true)
      .objectLat('lat')
      .objectLng('lng')
      .objectAltitude('alt')
      .objectThreeObject((d) => {
        const satGeometry = new THREE.OctahedronGeometry(this.SAT_SIZE * this.globe.getGlobeRadius() / this.EARTH_RADIUS_KM / 2, 0);
        const satMaterial = new THREE.MeshLambertMaterial({ 
          color: d.name == this.focusSat ? this.FOCUS_COLOR : 'palegreen', 
          transparent: true, 
          opacity: 0.7 
        });
    
        const satMesh = new THREE.Mesh(satGeometry, satMaterial);
        satMesh.name = d.name;
        d.obj = satMesh;
    
        return satMesh;
      })
      .pathsData([])
      .pathColor((d) => this.updatePathColor(d))
      .pathPointAlt(pnt => pnt[2]) // set altitude accessor
      .pathTransitionDuration(0)

    const globeMaterial = this.globe.globeMaterial();
    globeMaterial.bumpScale = 10;
    new THREE.TextureLoader().load(globeTextureUrl, texture => {
      globeMaterial.specularMap = texture;
      globeMaterial.specular = new THREE.Color('blue');
      globeMaterial.color = new THREE.Color('black');
      globeMaterial.emissive = new THREE.Color("rgba(0, 16, 38, 1)");
      globeMaterial.shininess = 0;
    });

    // Label renderer
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.labelRenderer.domElement.style.left = '0px';
    this.labelRenderer.domElement.id = 'label-renderer';
    if (document.getElementById('label-renderer')) document.getElementById('label-renderer').outerHTML = '';
    document.body.appendChild(this.labelRenderer.domElement);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.globeRef.current.innerHTML = ''; // Ensure to render only one canvas
    this.globeRef.current.appendChild(this.renderer.domElement);

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.add(this.globe);
    this.scene.add(new THREE.AmbientLight(0xbbbbbb));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

    // Setup camera
    this.camera = new THREE.PerspectiveCamera();
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = 400;

    // Add camera controls
    this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 1000;

    // Setup mouse intersections
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.animate();

    this.load(tleUrl);

    this.ticker();

    // Update Screen Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    // Detect Click on Satellite
    document.addEventListener('mousedown', (e) => {
      // For the following method to work correctly, set the canvas position *static*; margin > 0 and padding > 0 are OK
      this.mouse.x = ((e.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.clientWidth) * 2 - 1;
      this.mouse.y = - ((e.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.clientHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const meshArr = [];
      this.satData.map((d) => {
        meshArr.push(d.obj);
      })

      const intersects = this.raycaster.intersectObjects(meshArr);

      if (intersects.length > 0) {
        this.setFocus(intersects[0].object.name);
        document.getElementById('sat-list-' + intersects[0].object.name).scrollIntoView(this.scrollOption);
      }

    }, false);
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
    // Send variable to react
    this.frameTicker(this.satData, this.time, this.TIME_PAUSE, this.TIME_SELECT, this.focusSat);
    requestAnimationFrame(this.animate.bind(this));
  }

  ticker() {
    requestAnimationFrame(this.ticker.bind(this));

    if (!this.TIME_PAUSE) {
      if (this.TIME_SELECT == 'live') {
        this.time = new Date();
      } else {
        this.time = new Date(+this.time + this.TIME_STEP[this.TIME_SELECT]);
      }

      let isUpdatePath = false;
      const gmst = satellite.gstime(this.time);
      this.satData.forEach((d, i) => {
        const eci = satellite.propagate(d.satrec, this.time);
        if (eci.position) {
          const gdPos = satellite.eciToGeodetic(eci.position, gmst);
          d.lat = satellite.radiansToDegrees(gdPos.latitude);
          d.lng = satellite.radiansToDegrees(gdPos.longitude);
          d.alt = gdPos.height / this.EARTH_RADIUS_KM;
          d.vel = Math.sqrt(Math.pow(eci.velocity.x, 2) + Math.pow(eci.velocity.y, 2) + Math.pow(eci.velocity.z, 2));
        }

        if (d.path) this.genPath(d);
      });

      this.globe.objectsData(this.satData);

      // if (isUpdatePath) this.updatePath();
      this.updatePath()

      // Update label position
      this.labelObjs.map((d, i) => {
        if (this.satData[i]) Object.assign(d.position, this.globe.getCoords(this.satData[i].lat, this.satData[i].lng, this.satData[i].alt));
      });
    }
  }

  load(url) {
    this.norad.slice(10, 20).map((d, i) => {
      const satrec = satellite.twoline2satrec(d.tle[1], d.tle[2]);
      this.satData.push({
        satrec,
        name: d.OBJECT_NAME,
        norad_id: d.NORAD_CAT_ID,
        orbitalPeriod: (2 * Math.PI)/(satrec.no/60),
        path: null,
        showLabel: i < 2 
      })
    });

    this.satData.map((d, i) => {
      if (i < 2) { // TODO: Fix this later
        this.genPath(d);
      }
    });

    this.updatePath();
    this.updateLabel();
  }

  set pause(value) {
    this.TIME_PAUSE = value;
  }

  set timeSel(value) {
    this.TIME_SELECT = value;
  }

  setFocus(value) {
    if (value == this.focusSat) {
      this.focusSat = null;
    } else {
      this.focusSat = value;
    }

    this.satData.map((d, i) => {
      if (d.name == this.focusSat) d.obj.material.color.set(this.FOCUS_COLOR);
      else d.obj.material.color.set('palegreen');
    })

    this.globe.pathColor((d) => this.updatePathColor(d));
    this.updateLabel();
  }

  getSatData() {
    return this.satData;
  }

  getTime() {
    return this.time;
  }

  getCamera() {
    return this.camera;
  }

  getEarthRadius() {
    return this.EARTH_RADIUS_KM;
  }

  setLabel(name) {
    this.satData.map((d, i) => {
      if (d.name == name) d.showLabel = !d.showLabel;
    });
    this.updateLabel();
  }

  updateLabel() {
    this.labelObjs.map((d, i) => {
      if (document.getElementById(d.htmlId)) document.getElementById(d.htmlId).outerHTML = '';
      this.scene.remove(d);
    });
    this.labelObjs = [];

    this.satData.map((d, i) => {
      const htmlId = `label-${d.name}`;

      const labelDiv = document.createElement("div");
      labelDiv.style.visibility = d.showLabel ? 'visible' : 'hidden';
      labelDiv.style.zIndex = 10;
      labelDiv.id = htmlId;
      labelDiv.classList.add('label');

      const label = new CSS2DObject(labelDiv);
      label.userData = {
        htmlId,
        cNormal: new THREE.Vector3(),
        cPosition: new THREE.Vector3(),
        mat4: new THREE.Matrix4(),
        trackVisibility: () => { // the closer to the edge, the less opacity
          // function hidden when satellite disappear
          // https://codepen.io/prisoner849/pen/oNopjyb?editors=0010
        }
      }
      Object.assign(label.position, this.globe.getCoords(this.satData[i].lat, this.satData[i].lng, this.satData[i].alt));
      this.labelObjs.push(label);
      this.scene.add(label);

      const textDiv = document.createElement('div');
      textDiv.classList.add('label-text');
      textDiv.classList.add('select-none');
      textDiv.id = `satName-${d.name}`;
      if (this.focusSat == d.name) labelDiv.classList.add('label-focus');
      textDiv.innerText = d.name;
      labelDiv.onclick = () => {
        this.setFocus(d.name);
        document.getElementById('sat-list-' + d.name).scrollIntoView(this.scrollOption);
      }
      labelDiv.appendChild(textDiv);

      /*
      const hoverDiv = document.createElement('div');
      hoverDiv.classList.add('hover-area');
      labelDiv.appendChild(hoverDiv);
      */

      document.body.appendChild(labelDiv);
    })
  }

  genPath(data) {
    const index = this.satData.findIndex(item => item.name == data.name);

    if (index > -1) {
      const pathArr = [];

      const t = new Date(+this.time);
      let gmst = satellite.gstime(t);

      for (let i = 0; i < data.orbitalPeriod + 100; i += this.PATH_TIME_STEP) {
        const newt = new Date(+t + (i * 1000));
        const eci = satellite.propagate(data.satrec, newt);
        if (eci.position) {
          const gdPos = satellite.eciToGeodetic(eci.position, gmst);
          const lat = satellite.radiansToDegrees(gdPos.latitude);
          const lng = satellite.radiansToDegrees(gdPos.longitude);
          const alt = gdPos.height / this.EARTH_RADIUS_KM
          pathArr.push([lat, lng, alt, data.name]);
        }
      }

      this.satData[index].path = pathArr;
    }
  }

  delPath(data) {
    const index = this.satData.findIndex(item => item.name == data.name);
    if (index > -1) {
      this.satData[index].path = null;

      this.updatePath();
    }
  }

  updatePath() {
    const setArr = [];

    this.satData.map((d, i) => {
      if (d.path && d.path.length > 0) {
        setArr.push(d.path);
      }
    })

    this.globe.pathsData(setArr);
  }

  updatePathColor(d) {
    if (d[0][3] == this.focusSat) {
      return 'yellow';
    }
    return 'rgba(200, 200, 200, 0.8)';
  }

  checkSatAdd(name) {
    for(let i=0; i<this.satData.length; i++) {
      if (name == this.satData[i].name) return true
    }

    return false;
  }

  delSat(name) {
    this.satData = this.satData.filter(item => item.name != name);
    if (this.focusSat == name) this.setFocus(null); 
    this.updatePath();
    this.updateLabel();
  }

  pushSats(arr) {
    arr.map((d, i) => {
      this.satData.unshift({
        satrec: satellite.twoline2satrec(d.tle[1], d.tle[2]),
        name: d.OBJECT_NAME,
        norad_id: d.NORAD_CAT_ID,
        path: null,
        showLabel: true
      });
    });

    this.updateLabel();
  }
}

export default Globe;