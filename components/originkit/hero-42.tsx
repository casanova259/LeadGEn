"use client";

import React, { useEffect, useRef } from "react";
import "./hero-42.css";

interface DotMatrixCanvasProps {
  cellSize?: number;
  colors?: string;
  seed?: number;
  className?: string;
}

export function DotMatrixCanvas({
  cellSize = 12,
  colors = "#0A2013FF,#0B321CFF,#084425FF",
  seed = 0,
  className = "card__dots",
}: DotMatrixCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasRefCurrent = canvasRef.current;
    if (!canvasRefCurrent) return;

    const rawGl = canvasRefCurrent.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
    });
    if (!rawGl) return;

    const gl: WebGL2RenderingContext = rawGl;
    const canvasEl: HTMLCanvasElement = canvasRefCurrent;

    const perlinVertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

    const perlinFragmentShader = `#version 300 es
precision mediump float;
uniform float uFrequency;
uniform float uTime;
uniform float uSpeed;
uniform float uValue;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  uv = (uv - 0.5) * vec2(aspect, 1.0) + 0.5;
  float hue = abs(snoise(vec3(uv * uFrequency, uTime * uSpeed)));
  vec3 rainbowColor = hsv2rgb(vec3(hue, 1.0, uValue));
  fragColor = vec4(rainbowColor, 1.0);
}`;

    const dotVertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

    const dotFragmentShader = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform int uPaletteCount;
uniform vec3 uPalette[10];
uniform float uPaletteA[10];
uniform float uCellSize;
uniform float uGamma;
uniform float uPaletteBias;
uniform int uUseGlyphAtlas;
uniform sampler2D uGlyphAtlas;
uniform ivec2 uGlyphGrid;
uniform int uCharCount;
out vec4 fragColor;

void main() {
  vec2 pix = gl_FragCoord.xy;
  float cell = max(uCellSize, 1.0);

  vec2 cellIdx = floor(pix / cell);
  vec2 cellCenter = (cellIdx + 0.5) * cell;
  vec3 col = texture(uTexture, cellCenter / uResolution.xy).rgb;
  float gray = 0.3 * col.r + 0.59 * col.g + 0.11 * col.b;
  gray = pow(clamp(gray, 0.0001, 1.0), uGamma);

  float mark = 0.0;
  if (uUseGlyphAtlas == 1 && uCharCount > 0 && uGlyphGrid.x > 0 && uGlyphGrid.y > 0) {
    float g = clamp(gray + uPaletteBias, 0.0, 1.0);
    int idx = int(clamp(floor(g * float(uCharCount - 1) + 0.5), 0.0, float(uCharCount - 1)));
    vec2 cellUV = fract(pix / cell);
    vec2 grid = vec2(uGlyphGrid);
    vec2 tileSize = 1.0 / grid;
    float colIdx = float(idx % uGlyphGrid.x);
    float rowIdx = floor(float(idx) / float(uGlyphGrid.x));
    vec2 atlasUV = (vec2(colIdx, rowIdx) + cellUV) * tileSize;
    vec3 glyphSample = texture(uGlyphAtlas, atlasUV).rgb;
    mark = dot(glyphSample, vec3(0.299, 0.587, 0.114));
  } else {
    vec2 cellUV = fract(pix / cell) - 0.5;
    float dist = length(cellUV);
    float radius = clamp(gray + uPaletteBias, 0.0, 1.0) * 0.5;
    float aa = fwidth(dist) + 1e-4;
    mark = 1.0 - smoothstep(radius - aa, radius + aa, dist);
  }

  float g2 = clamp(gray + uPaletteBias, 0.0, 1.0);
  int cnt = max(uPaletteCount, 1);
  vec3 dotCol;
  float dotOpacity;
  if (cnt <= 1) {
    dotCol = uPalette[0];
    dotOpacity = uPaletteA[0];
  } else {
    float scaled = g2 * float(cnt - 1);
    int i0 = int(floor(scaled));
    i0 = clamp(i0, 0, cnt - 2);
    float f = scaled - float(i0);
    dotCol = mix(uPalette[i0], uPalette[i0 + 1], f);
    dotOpacity = mix(uPaletteA[i0], uPaletteA[i0 + 1], f);
  }
  fragColor = vec4(dotCol, mark * dotOpacity);
}`;

    const MAX_COLORS = 10;
    const DEFAULTS = { frequency: 1, speed: 6, cellSize: 20, gamma: 4, paletteBias: 10 };

    function parseColorToRgba(input: string) {
      if (!input) return { r: 0, g: 0, b: 0, a: 1 };
      const str = String(input).trim();
      const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
      if (m) {
        return {
          r: Math.max(0, Math.min(255, parseFloat(m[1]))) / 255,
          g: Math.max(0, Math.min(255, parseFloat(m[2]))) / 255,
          b: Math.max(0, Math.min(255, parseFloat(m[3]))) / 255,
          a: m[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(m[4]))) : 1,
        };
      }
      let hex = str.replace(/^#/, "");
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split("").map((c) => c + c).join("");
      }
      if (hex.length === 6) hex += "ff";
      if (hex.length !== 8 || /[^0-9a-f]/i.test(hex)) return { r: 0, g: 0, b: 0, a: 1 };
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }

    function mapLinear(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
      if (inMax === inMin) return outMin;
      return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
    }
    const mapFrequency = (ui: number) => mapLinear(ui, 1, 10, 0.3, 6);
    const mapSpeed = (ui: number) => ui * 0.05;
    const mapCellSize = (ui: number) => mapLinear(ui, 1, 100, 6, 60);
    const mapGamma = (ui: number) => mapLinear(ui, 1, 20, 0.5, 8);
    const mapPaletteBias = (ui: number) => ui * 0.05;

    function compile(type: number, src: string) {
      const s = gl.createShader(type);
      if (!s) throw new Error("Could not create shader");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(s) || "shader compile failed";
        gl.deleteShader(s);
        throw new Error(err);
      }
      return s;
    }

    function link(vsSrc: string, fsSrc: string) {
      const p = gl.createProgram();
      if (!p) throw new Error("Could not create program");
      const vs = compile(gl.VERTEX_SHADER, vsSrc);
      const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const err = gl.getProgramInfoLog(p) || "program link failed";
        gl.deleteProgram(p);
        throw new Error(err);
      }

      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const attrs: [string, Float32Array][] = [
        ["position", new Float32Array([-1, -1, 3, -1, -1, 3])],
        ["uv", new Float32Array([0, 0, 2, 0, 0, 2])],
      ];
      for (let i = 0; i < attrs.length; i++) {
        const loc = gl.getAttribLocation(p, attrs[i][0]);
        if (loc < 0) continue;
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, attrs[i][1], gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      }
      gl.bindVertexArray(null);
      return { program: p, vao, vs, fs };
    }

    let perlin: ReturnType<typeof link>;
    let dot: ReturnType<typeof link>;
    try {
      perlin = link(perlinVertexShader, perlinFragmentShader);
      dot = link(dotVertexShader, dotFragmentShader);
    } catch {
      return;
    }

    const u = (prog: WebGLProgram, name: string) => gl.getUniformLocation(prog, name);

    const parsedColorList = (colors || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, MAX_COLORS);
    const colorItems = parsedColorList.length ? parsedColorList : ["#FFFFFF", "#E07000", "#000000"];

    const rgb = new Float32Array(MAX_COLORS * 3);
    const alpha = new Float32Array(MAX_COLORS);
    for (let i = 0; i < colorItems.length; i++) {
      const c = parseColorToRgba(colorItems[i]);
      rgb[i * 3] = c.r;
      rgb[i * 3 + 1] = c.g;
      rgb[i * 3 + 2] = c.b;
      alpha[i] = c.a;
    }

    const dummy = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dummy);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const rtTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rtTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rtTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    gl.useProgram(dot.program);
    gl.uniform1i(u(dot.program, "uTexture"), 0);
    gl.uniform1i(u(dot.program, "uGlyphAtlas"), 1);
    gl.uniform1i(u(dot.program, "uPaletteCount"), colorItems.length);
    gl.uniform3fv(u(dot.program, "uPalette"), rgb);
    gl.uniform1fv(u(dot.program, "uPaletteA"), alpha);
    gl.uniform1f(u(dot.program, "uCellSize"), mapCellSize(cellSize));
    gl.uniform1f(u(dot.program, "uGamma"), mapGamma(DEFAULTS.gamma));
    gl.uniform1f(u(dot.program, "uPaletteBias"), mapPaletteBias(DEFAULTS.paletteBias));
    gl.uniform1i(u(dot.program, "uUseGlyphAtlas"), 0);
    gl.uniform2i(u(dot.program, "uGlyphGrid"), 0, 0);
    gl.uniform1i(u(dot.program, "uCharCount"), 0);

    gl.useProgram(perlin.program);
    gl.uniform1f(u(perlin.program, "uFrequency"), mapFrequency(DEFAULTS.frequency));
    gl.uniform1f(u(perlin.program, "uSpeed"), mapSpeed(DEFAULTS.speed));
    gl.uniform1f(u(perlin.program, "uValue"), 1);

    const uPerlinTime = u(perlin.program, "uTime");
    const uPerlinRes = u(perlin.program, "uResolution");
    const uDotRes = u(dot.program, "uResolution");

    let currentW = 0;
    let currentH = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvasEl.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (w === currentW && h === currentH) return;
      currentW = w;
      currentH = h;
      canvasEl.width = w;
      canvasEl.height = h;
      gl.bindTexture(gl.TEXTURE_2D, rtTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    function draw(time: number) {
      if (currentW <= 0 || currentH <= 0) return;
      gl.viewport(0, 0, currentW, currentH);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.useProgram(perlin.program);
      gl.bindVertexArray(perlin.vao);
      gl.uniform1f(uPerlinTime, time * 0.001 + seed);
      gl.uniform2f(uPerlinRes, currentW, currentH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(dot.program);
      gl.bindVertexArray(dot.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, rtTex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dummy);
      gl.uniform2f(uDotRes, currentW, currentH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    resize();
    let rafId: number | null = null;
    let lastTime = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const ro = new ResizeObserver(() => {
      resize();
      draw(lastTime);
    });
    ro.observe(canvasEl);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      draw(0);
    } else {
      const tick = (time: number) => {
        rafId = requestAnimationFrame(tick);
        if (time - lastTime < FRAME_INTERVAL) return;
        lastTime = time;
        draw(time);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(rtTex);
      gl.deleteTexture(dummy);
      gl.deleteProgram(perlin.program);
      gl.deleteProgram(dot.program);
      gl.deleteShader(perlin.vs);
      gl.deleteShader(perlin.fs);
      gl.deleteShader(dot.vs);
      gl.deleteShader(dot.fs);
    };
  }, [cellSize, colors, seed]);

  return <canvas ref={canvasRef} className={className} />;
}

export interface Hero42Props {
  badgeLabel?: string;
  badgeLinkText?: string;
  badgeLinkHref?: string;
  headline?: string;
  description?: string;
}

export default function Hero42({
  badgeLabel = "Why Lost Leads",
  badgeLinkText = "Zero lead leakage",
  badgeLinkHref = "#",
  headline = "Built Around How Leads Actually Get Lost.",
  description = "Stay on top of every lead, draft context-aware responses instantly, and scale without losing anyone.",
}: Hero42Props) {
  return (
    <section className="hero-42-section">
      <div className="hero__texture" />
      <div className="frame">
        <div className="stack">
          {/* Headings */}
          <div className="headings">
            <div className="headings__left">
              <div className="badge">
                <div className="badge__pill">
                  <div className="badge__dot">
                    <img src="/hero-42/dot.svg" alt="" />
                  </div>
                  <span>{badgeLabel}</span>
                </div>
                <a className="badge__join" href={badgeLinkHref}>
                  <span>{badgeLinkText}</span>
                  <span className="badge__chev">
                    <img src="/hero-42/chevron.svg" alt="" />
                  </span>
                </a>
              </div>
              <h2 className="headline">{headline}</h2>
            </div>
            <div className="headings__right">
              <p>{description}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="cards">
            {/* Card 1: Focus & Smart Lead Insights */}
            <div className="card card--flex">
              <img className="card__bg" src="/hero-42/card1-bg.jpg" alt="" />
              <DotMatrixCanvas
                cellSize={12}
                colors="#0A2013FF,#0B321CFF,#084425FF"
                seed={0}
              />

              <div className="card__head card__head--l">
                <img src="/hero-42/logo-inmix-a.svg" alt="Lost Leads" />
                <span>lostleads.app</span>
              </div>

              <div className="widget">
                <div className="dates">
                  <div className="dates__row">
                    <p>3</p>
                    <p>4</p>
                    <p>5</p>
                    <p>6</p>
                    <p>7</p>
                    <div className="dates__sel">
                      <p>8</p>
                    </div>
                    <p>9</p>
                    <p>10</p>
                  </div>
                  <div className="dates__fade dates__fade--l" />
                  <div className="dates__fade dates__fade--r" />
                </div>

                <div className="panel panel--1">
                  <div className="panel__head">
                    <p>Today&apos;s Leads</p>
                    <div className="seg">
                      <button type="button" aria-label="Previous day">
                        <img className="flip" src="/hero-42/arrow-right-01.svg" alt="" />
                      </button>
                      <button type="button" aria-label="Next day">
                        <img src="/hero-42/arrow-right-02.svg" alt="" />
                      </button>
                    </div>
                  </div>
                  <div className="panel__rule">
                    <img src="/hero-42/line-2282.svg" alt="" />
                  </div>
                  <div className="rows">
                    <div>
                      <img src="/hero-42/icon-search-ai.svg" alt="" />
                      <p>3 Unanswered Inquiries</p>
                    </div>
                    <div>
                      <img src="/hero-42/icon-alert.svg" alt="" />
                      <p>2 Follow-ups Due Today</p>
                    </div>
                    <div>
                      <img src="/hero-42/icon-workflow.svg" alt="" />
                      <p>98% Follow-Up Rate</p>
                    </div>
                  </div>
                  <div className="cursor">
                    <img src="/hero-42/cursor.svg" alt="" />
                  </div>
                </div>
              </div>

              <div className="card__foot">
                <div className="card__foot-icon">
                  <img
                    src="/hero-42/icon-bolt.svg"
                    alt=""
                    style={{ inset: "8.84% 21.3% 8.49% 20.34%" }}
                  />
                </div>
                <div className="card__foot-text">
                  <p className="card__title">Focus & Smart Triage</p>
                  <p className="card__sub">
                    Keep every lead organized and see who needs follow-up next.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Connect & Intelligent Response Engine */}
            <div className="card card--wide">
              <img className="card__bg" src="/hero-42/card2-bg.jpg" alt="" />
              <DotMatrixCanvas
                cellSize={12}
                colors="#0C201AFF,#0C2755FF,#093A47FF"
                seed={137}
              />

              <div className="card__head card__head--c">
                <img src="/hero-42/logo-inmix-b.svg" alt="Lost Leads" />
                <span>lostleads.app</span>
              </div>

              <div className="draft panel panel--2">
                <div className="panel__head">
                  <p>AI Follow-Up Draft</p>
                  <div className="seg seg--solo">
                    <button type="button" aria-label="More options">
                      <img src="/hero-42/icon-dots.svg" alt="" />
                    </button>
                  </div>
                </div>
                <div className="panel__rule">
                  <img src="/hero-42/line-2282.svg" alt="" />
                </div>
                <div className="draft__body">
                  <div
                    className="draft__hl"
                    style={{ left: 9, top: 47, width: 112 }}
                  >
                    <img src="/hero-42/card2-bg.jpg" alt="" />
                  </div>
                  <div
                    className="draft__hl"
                    style={{ left: 31, top: 111, width: 145 }}
                  >
                    <img src="/hero-42/card2-bg.jpg" alt="" />
                  </div>
                  <div className="draft__text">
                    <p>Hey Alex,</p>
                    <p>&#8203;</p>
                    <p>
                      <b>I noticed your new lead from WhatsApp</b> requested
                      pricing 15m ago ⏳.
                    </p>
                    <p>&#8203;</p>
                    <p>
                      Based on clinic patterns,{" "}
                      <b>they are ready to book</b> once consultation options are
                      presented.
                    </p>
                    <p>&#8203;</p>
                    <p>
                      I’ve drafted a personalized follow-up with Saturday slots
                      ready to send with one click.
                    </p>
                    <p>&#8203;</p>
                    <p>Would you like me to send this now or adjust the timing?</p>
                  </div>
                  <div className="draft__fade" />
                </div>
              </div>

              <div className="chip" style={{ left: 27, top: 205 }}>
                <p>WhatsApp</p>
              </div>
              <div className="chip" style={{ left: 348, top: 270 }}>
                <p>Context</p>
              </div>

              <div className="wire" style={{ left: 292, top: 288, width: 60 }}>
                <img src="/hero-42/line-2283.svg" alt="" style={{ width: 60 }} />
              </div>
              <div className="node" style={{ left: 291, top: 286 }} />
              <div className="wire" style={{ left: 97, top: 223, width: 28 }}>
                <img src="/hero-42/line-2284.svg" alt="" style={{ width: 28 }} />
              </div>
              <div className="node" style={{ left: 123, top: 221 }} />

              <div className="card__foot">
                <div className="card__foot-icon">
                  <img
                    src="/hero-42/icon-book-ai.svg"
                    alt=""
                    style={{ inset: "0.05% 4.17% 8.33% 12.5%" }}
                  />
                </div>
                <div className="card__foot-text">
                  <p className="card__title card__title--c">
                    Intelligent Response Engine
                  </p>
                  <p className="card__sub">
                    Capture leads from WhatsApp, Web & IG with instant responses.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Scale & Predictive Performance Metrics */}
            <div className="card card--flex">
              <img className="card__bg" src="/hero-42/card3-bg.jpg" alt="" />
              <DotMatrixCanvas
                cellSize={12}
                colors="#0C1528FF,#17243CFF,#212F45FF"
                seed={291}
              />

              <div className="card__head card__head--l">
                <img src="/hero-42/logo-inmix-a.svg" alt="Lost Leads" />
                <span>lostleads.app</span>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="stat__row">
                    <div className="stat__meta">
                      <img src="/hero-42/icon-hourglass.svg" alt="" />
                      <p>First Response</p>
                    </div>
                    <p className="stat__val">&lt; 2m</p>
                  </div>
                </div>
                <div className="stat stat--light">
                  <div className="stat__row">
                    <div className="stat__meta">
                      <img src="/hero-42/icon-target.svg" alt="" />
                      <p>Lead Recovery Rate</p>
                    </div>
                    <p className="stat__val stat__val--grad">97%</p>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat__row">
                    <div className="stat__meta">
                      <div>
                        <img src="/hero-42/icon-ai.svg" alt="" />
                      </div>
                      <p>Conversion Score</p>
                    </div>
                    <p className="stat__val">92%</p>
                  </div>
                </div>
              </div>

              <div className="card__foot">
                <div className="card__foot-icon">
                  <img
                    src="/hero-42/icon-target-lg.svg"
                    alt=""
                    style={{ inset: "8.33%" }}
                  />
                </div>
                <div className="card__foot-text">
                  <p className="card__title">Scale & Performance Metrics</p>
                  <p className="card__sub">
                    From solo clinics to multi-location teams, never lose a lead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
