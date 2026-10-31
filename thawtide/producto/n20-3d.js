
(function () {
  const GROSOR = 0.42;   // grosor / ancho; se ajusta cuando llegue la muestra
  const COLORES = {
    blanco: {cuerpo: 0xeaeaec, delante: 'producto/blanco-delante.webp', detras: 'producto/blanco-detras.webp'},
    negro: {cuerpo: 0x09080b, delante: 'producto/negro-delante.webp', detras: 'producto/negro-detras.webp'}
  };

  function geometria(sil) {
    const shape = new THREE.Shape(sil.map(p => new THREE.Vector2(p[0], p[1])));
    const xs = sil.map(p => p[0]), ys = sil.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY, t = GROSOR * w;
    const bt = t * 0.4, depth = t - 2 * bt, bs = w * 0.07;
    const g = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelOffset: -bs, bevelSegments: 18, curveSegments: 1, steps: 1});
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    // cada triángulo va a delante, detrás o canto según hacia dónde mira; las caras llevan la foto proyectada de frente
    const pos = g.attributes.position, nor = g.attributes.normal, n = pos.count;
    const cubos = [[], [], []];
    for (let i = 0; i < n; i += 3) {
      const nz = (nor.getZ(i) + nor.getZ(i + 1) + nor.getZ(i + 2)) / 3;
      cubos[nz > 0.97 ? 0 : nz < -0.97 ? 1 : 2].push(i);   // la foto solo en la cara plana; los bordes redondeados, del color del cuerpo
    }
    // tres piezas separadas (delante, detrás, canto), cada una con un solo material: así el GLB sale bien en cualquier visor
    return cubos.map((lista, k) => {
      const P = [], N = [], U = [], out = new THREE.BufferGeometry();
      lista.forEach(i => {
        for (let j = 0; j < 3; j++) {
          const x = pos.getX(i + j), y = pos.getY(i + j);
          P.push(x, y, pos.getZ(i + j)); N.push(nor.getX(i + j), nor.getY(i + j), nor.getZ(i + j));
          const u = (x - minX) / w, v = (y - minY) / h;
          U.push(k === 1 ? 1 - u : u, v);   // detrás: la foto ya está en espejo
        }
      });
      out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
      out.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
      out.userData = {w, h, t};
      return out;
    });
  }

  window.N20_3D = function (canvas, sil, opciones) {
    const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, preserveDrawingBuffer: !!(opciones && opciones.capturable)});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const geos = geometria(sil), geo = geos[0];
    const cam = new THREE.PerspectiveCamera(22, 1, 0.1, 50);
    cam.position.set(0, 0, 6.2);
    // luz de estudio: principal arriba a la izquierda, relleno suave a la derecha y un contorno por detrás para que el canto brille
    scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8fa6, 0.55));
    const sol = new THREE.DirectionalLight(0xffffff, 0.75); sol.position.set(-2.5, 3, 4); scene.add(sol);
    const relleno = new THREE.DirectionalLight(0xdfeaff, 0.3); relleno.position.set(3, 0.5, 2); scene.add(relleno);
    const contorno = new THREE.DirectionalLight(0xffffff, 0.55); contorno.position.set(0.5, 2, -4); scene.add(contorno);
    const loader = new THREE.TextureLoader();
    const cache = {};
    function mats(color) {
      if (cache[color]) return cache[color];
      const c = COLORES[color], tex = src => { const t = loader.load(src, () => dibujar()); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
      // las fotos ya traen su luz: se pintan casi sin sombrear para no ensuciarlas
      return cache[color] = [
        new THREE.MeshBasicMaterial({map: tex(c.delante)}),
        new THREE.MeshBasicMaterial({map: tex(c.detras)}),
        new THREE.MeshStandardMaterial({color: c.cuerpo, roughness: 0.42, metalness: 0})
      ];
    }
    const mesh = new THREE.Group(), piezas = geos.map((g, k) => new THREE.Mesh(g, mats('blanco')[k]));
    piezas.forEach(p => mesh.add(p));
    scene.add(mesh);
    function tam() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      cam.aspect = r.width / r.height;
      // que entre el alto del producto con un poco de aire
      const fov = 2 * Math.atan((geo.userData.h * 0.56) / cam.position.z) * 180 / Math.PI;
      cam.fov = Math.max(fov, fov / cam.aspect * 0.62);
      cam.updateProjectionMatrix();
    }
    function dibujar() { renderer.render(scene, cam); }
    tam(); dibujar();
    window.addEventListener('resize', () => { tam(); dibujar(); });
    
    const ud = geo.userData;
    const brillo = (() => {   // la pantalla se enciende: un brillo cálido sobre ella (sin números)
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
      const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(255,190,120,1)'); g.addColorStop(.4, 'rgba(255,120,60,.55)'); g.addColorStop(1, 'rgba(255,90,40,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending}));
      s.position.set(0, ud.h * .3, ud.t / 2 + .02); s.scale.set(ud.w * .55, ud.w * .4, 1); mesh.add(s); return s;
    })();
    const placa = (() => {   // la placa de aluminio, entre las dos caras (solo se ve al abrirlo)
      const shape = new THREE.Shape(sil.map(p => new THREE.Vector2(p[0] * .86, p[1] * .86)));
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 1), new THREE.MeshStandardMaterial({color: 0xc9d1da, metalness: .45, roughness: .35, side: THREE.DoubleSide, transparent: true, opacity: 0}));
      m.visible = false; mesh.add(m); return m;
    })();
    let calorAhora = 0, colorAhora = 'blanco';
    const tiñe = () => {   // caliente: las caras tiran a naranja y el canto brilla un poco
      const m = mats(colorAhora), t = calorAhora;
      m[0].color.setRGB(1, 1 - .06 * t, 1 - .14 * t); m[1].color.setRGB(1, 1 - .06 * t, 1 - .14 * t);
      m[2].emissive = m[2].emissive || new THREE.Color(0); m[2].emissive.setRGB(0, 0, 0);   // el canto con su color real: el calor se ve en el halo y en la pantalla
      brillo.material.opacity = t;
    };
    const zBase = cam.position.z;
    return {
      girar(rad, inclinar) { mesh.rotation.y = rad; mesh.rotation.x = inclinar || 0; dibujar(); },
      color(c) { colorAhora = c; const m = mats(c); piezas.forEach((p, k) => { p.material = m[k]; }); tiñe(); dibujar(); },
      tam() { tam(); dibujar(); },
      calor(t) { calorAhora = Math.max(0, Math.min(1, t)); tiñe(); dibujar(); },
      zoom(f) { cam.position.z = zBase / Math.max(.7, Math.min(2, f)); cam.updateProjectionMatrix(); dibujar(); },
      abre(t) { t = Math.max(0, Math.min(1, t)); const d = ud.w * .45 * t; piezas[0].position.z = d; piezas[1].position.z = -d; brillo.position.z = ud.t / 2 + .02 + d; placa.visible = t > .01; placa.material.opacity = Math.min(1, t * 1.5); dibujar(); },
      mesh, scene
    };
  };
})();
