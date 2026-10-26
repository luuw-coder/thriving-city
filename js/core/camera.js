// Camera: kéo chuột để di chuyển, lăn chuột để phóng to/thu nhỏ.
Game.camera = {
  x: 0, y: 0, zoom: 1, attached: false,
  apply(ctx, w, h) {
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  },
  screenToWorld(sx, sy, w, h) {
    return { x: (sx - w / 2) / this.zoom + this.x, y: (sy - h / 2) / this.zoom + this.y };
  },
  attach(canvas) {
    if (this.attached) return;
    this.attached = true;
    let drag = null;
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('pointerup', () => { drag = null; });
    window.addEventListener('pointermove', e => {
      if (!drag) return;
      this.x -= (e.clientX - drag.x) / this.zoom;
      this.y -= (e.clientY - drag.y) / this.zoom;
      drag = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.zoom = Math.min(2.5, Math.max(0.4, this.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    }, { passive: false });
  }
};
