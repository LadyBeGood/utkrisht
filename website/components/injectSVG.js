

class InjectSvg extends HTMLElement {
    async connectedCallback() {
        const src = this.getAttribute("src");
        if (!src) return;

        try {
            const res = await fetch(src);
            const svgText = await res.text();
            const svg = new DOMParser().parseFromString(svgText, "image/svg+xml").documentElement;

            for (const { name, value } of this.attributes) {
                if (name !== "src") svg.setAttribute(name, value);
            }

            this.replaceWith(svg);
        } catch (err) {
            console.error("Failed to load SVG:", err);
        }
    }
}

customElements.define("inject-svg", InjectSvg);