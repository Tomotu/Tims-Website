// <image-slot> — lightweight custom element that renders a photo.
// Attributes: src (image URL), placeholder (fallback text), shape (rect|square)
class ImageSlot extends HTMLElement {
  connectedCallback() {
    this.style.display = 'block';
    this.style.overflow = 'hidden';
    this.style.position = 'relative';
    this.style.background = 'var(--bg-2, #1a1a18)';
    if (this.getAttribute('shape') !== 'square') {
      this.style.aspectRatio = '3/4';
    }
    this._render();
  }

  static get observedAttributes() { return ['src', 'placeholder']; }
  attributeChangedCallback() { if (this.isConnected) this._render(); }

  _render() {
    this.innerHTML = '';
    const src = this.getAttribute('src');
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = this.getAttribute('placeholder') || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      this.appendChild(img);
    } else {
      const p = document.createElement('p');
      p.textContent = this.getAttribute('placeholder') || 'Drop image here';
      p.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted,#6a6a62);';
      this.appendChild(p);
    }
  }
}
customElements.define('image-slot', ImageSlot);
