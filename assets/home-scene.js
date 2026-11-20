(() => {
  const scene = document.querySelector('.hero-scene');
  const canvas = scene.querySelector('canvas');
  const button = scene.querySelector('.motion-button');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
  if (!gl) return;

  const vertexSource = `
    attribute vec3 position;
    attribute vec3 normal;
    uniform vec2 rotation;
    uniform vec2 scale;
    varying vec3 surfaceNormal;
    varying vec3 surfacePoint;

    vec3 rotate(vec3 p) {
      float x = rotation.x, y = rotation.y;
      p = vec3(p.x, cos(x) * p.y - sin(x) * p.z, sin(x) * p.y + cos(x) * p.z);
      return vec3(cos(y) * p.x + sin(y) * p.z, p.y, -sin(y) * p.x + cos(y) * p.z);
    }

    void main() {
      vec3 p = rotate(position);
      surfaceNormal = rotate(normal);
      surfacePoint = p;
      float w = 1.0 - p.z * 0.12;
      gl_Position = vec4(p.xy * scale, -p.z * 0.24, w);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec3 surfaceNormal;
    varying vec3 surfacePoint;

    void main() {
      vec3 n = normalize(surfaceNormal);
      vec3 eye = normalize(vec3(0.0, 0.0, 8.33) - surfacePoint);
      vec3 reflected = reflect(-eye, n);
      float daylight = max(0.0, dot(n, normalize(vec3(-0.5, 1.0, 0.7))));
      float rim = pow(1.0 - max(0.0, dot(n, eye)), 2.4);
      float softbox = pow(max(0.0, dot(reflected, normalize(vec3(-0.55, 0.85, 0.65)))), 8.0);
      float highlight = pow(max(0.0, dot(reflected, normalize(vec3(0.75, 0.2, 0.35)))), 35.0);
      float strip = exp(-22.0 * abs(reflected.y + 0.35 * reflected.x - 0.32)) * (0.5 + 0.5 * reflected.z);
      float lower = pow(max(0.0, dot(reflected, normalize(vec3(0.0, -1.0, 0.1)))), 4.0);
      vec3 color = mix(vec3(0.045, 0.115, 0.30), vec3(0.38, 0.52, 0.75), daylight);
      color += softbox * vec3(0.88, 0.91, 0.96);
      color += highlight * vec3(0.58, 0.64, 0.75);
      color += strip * vec3(0.34, 0.51, 0.69);
      color += lower * vec3(0.09, 0.23, 0.45);
      color += rim * vec3(0.24, 0.49, 0.68);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function buildShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  }

  const vertex = buildShader(gl.VERTEX_SHADER, vertexSource);
  const fragment = buildShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const tau = Math.PI * 2;
  const curveSegments = 168;
  const tubeSegments = 28;
  const vertices = [];
  const indices = [];
  const normalize = vector => {
    const length = Math.hypot(...vector);
    return vector.map(value => value / length);
  };
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const point = t => {
    const radius = 1.35 + 0.46 * Math.cos(3 * t);
    return [radius * Math.cos(2 * t), radius * Math.sin(2 * t), 0.61 * Math.sin(3 * t)];
  };

  for (let i = 0; i <= curveSegments; i += 1) {
    const t = i * tau / curveSegments;
    const center = point(t);
    const ahead = point(t + 0.001);
    const tangent = normalize(ahead.map((value, axis) => value - center[axis]));
    const normal = normalize(cross(tangent, [0, 0, 1]));
    const binormal = cross(tangent, normal);

    for (let j = 0; j <= tubeSegments; j += 1) {
      const angle = j * tau / tubeSegments;
      const direction = normal.map((value, axis) => value * Math.cos(angle) + binormal[axis] * Math.sin(angle));
      const thickness = 0.265 + 0.065 * Math.sin(3 * t + 0.6);
      const oval = [direction[0], direction[1], direction[2] * 0.84];
      vertices.push(...center.map((value, axis) => value + thickness * oval[axis]), ...direction);
    }
  }

  const row = tubeSegments + 1;
  for (let i = 0; i < curveSegments; i += 1) {
    for (let j = 0; j < tubeSegments; j += 1) {
      const start = i * row + j;
      indices.push(start, start + 1, start + row, start + row, start + 1, start + row + 1);
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  for (const [attribute, offset] of [['position', 0], ['normal', 12]]) {
    const location = gl.getAttribLocation(program, attribute);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, offset);
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  const rotation = gl.getUniformLocation(program, 'rotation');
  const scale = gl.getUniformLocation(program, 'scale');
  const pointer = { x: 0, y: 0 };
  let visible = false;
  let paused = false;
  let lost = false;
  let frame = null;
  let previous = null;
  let elapsed = 0;
  let tiltX = 0;
  let tiltY = 0;

  function resize() {
    if (lost) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    const aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(scale, 0.435 / Math.max(1, aspect), 0.435 * Math.min(1, aspect));
    if (frame === null) draw();
  }

  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(rotation, -0.27 + Math.sin(elapsed * 0.38) * 0.2 + tiltX, -0.25 + Math.sin(elapsed * 0.49) * 0.65 + tiltY);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  function animate(now) {
    const delta = previous === null ? 0 : Math.min((now - previous) / 1000, 0.045);
    previous = now;
    elapsed += delta;
    const smoothing = 1 - Math.exp(-delta * 5);
    tiltX += (pointer.y - tiltX) * smoothing;
    tiltY += (pointer.x - tiltY) * smoothing;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    const playing = visible && !paused && !lost && !motionPreference.matches && !document.hidden;
    if (playing && frame === null) frame = requestAnimationFrame(animate);
    if (!playing && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
      previous = null;
    }
    button.hidden = lost || motionPreference.matches;
    const hindi = document.documentElement.lang === 'hi-IN';
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', hindi ? '3D एनीमेशन रोकें' : 'Pause 3D animation');
    button.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
  }

  scene.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = scene.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.6;
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.5;
  });
  scene.addEventListener('pointerleave', () => {
    pointer.x = 0;
    pointer.y = 0;
  });
  button.addEventListener('click', () => {
    paused = !paused;
    updateMotion();
  });
  canvas.addEventListener('webglcontextlost', () => {
    lost = true;
    scene.classList.remove('scene-rendered');
    updateMotion();
  });
  new ResizeObserver(resize).observe(scene);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updateMotion();
  }).observe(scene);
  document.addEventListener('visibilitychange', updateMotion);
  motionPreference.addEventListener('change', updateMotion);
  resize();
  scene.classList.add('scene-rendered');
  updateMotion();
})();
