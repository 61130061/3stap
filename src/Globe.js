import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import countries from './assets/countries.json';
import tleUrl from './assets/tle.txt';
import globeTextureUrl from './assets/earth-water.png';

class Globe {
  constructor(globeRef, frameTicker) {
    this.EARTH_RADIUS_KM = 6371; // km
    this.SAT_SIZE = 200; // km
    this.FOCUS_COLOR = 'red';
    this.TIME_STEP = {
      x2: 2 * 1000,
      x5: 5 * 1000,
      x10: 10 * 1000
    }; // per frame
    this.TIME_SELECT = 'x2';
    this.TIME_PAUSE = false;

    this.PATH_TIME_RANGE = 6000;
    this.PATH_TIME_STEP = 7;

    this.globeRef = globeRef;
    this.frameTicker = frameTicker;
    this.time = new Date();
    this.satData = [];
    this.focusSat = null;

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
      .pathColor(() => 'rgba(200,200,200,0.8)')
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
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;

    this.animate();

    this.load(tleUrl);

    this.ticker();

    // Update Screen Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
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

      const gmst = satellite.gstime(this.time);
      this.satData.forEach((d, i) => {
        const eci = satellite.propagate(d.satrec, this.time);
        if (eci.position) {
          const gdPos = satellite.eciToGeodetic(eci.position, gmst);
          d.lat = satellite.radiansToDegrees(gdPos.latitude);
          d.lng = satellite.radiansToDegrees(gdPos.longitude);
          d.alt = gdPos.height / this.EARTH_RADIUS_KM
        }
      });
    }

    this.globe.objectsData(this.satData);
    this.frameTicker(this.satData, this.time, this.TIME_PAUSE, this.TIME_SELECT);
  }

  load(url) {
    fetch(url).then(r => r.text()).then(rawData => {
      const tleData = rawData.replace(/\r/g, '').split(/\n(?=[^12])/).map(tle => tle.split('\n'));
      this.satData = tleData.map(([name, ...tle]) => ({
        satrec: satellite.twoline2satrec(...tle),
        name: name.trim().replace(/^0 /, ''),
        path: null,
        showLabel: true
      }));
    }).then(() => {
      this.satData.map((d, i) => {
        if (i) {
          this.genPath(d);
        }
      });

      this.updatePath();
    });
  }

  set pause(value) {
    this.TIME_PAUSE = value;
  }

  set timeSel(value) {
    this.TIME_SELECT = value;
  }

  setSatData(data) {
    this.satData = data;
  }

  getSatData() {
    return this.satData;
  }

  setTime(t) {
    this.time = new Date(t);
  }

  getTime() {
    return this.time;
  }

  getCamera() {
    return this.camera;
  }

  genPath(data) {
    const index = this.satData.findIndex(item => item.name == data.name);

    if (index > -1) {
      const pathArr = [];

      for (let i = 0; i < this.PATH_TIME_RANGE; i += this.PATH_TIME_STEP) {
        const newt = new Date(+this.time + (i * 1000));
        const gmst = satellite.gstime(newt);
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
}

export default Globe;