class LoadingSpinner extends HTMLElement {
    connectedCallback() {
        if (!document.getElementById("loading-spinner-style")) {
            const style = document.createElement("style");
            style.id = "loading-spinner-style";
            style.textContent = `
                loading-spinner {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                loading-spinner > .spinner {
                    background: var(--almost-white);
                    width: 25px;
                    padding: 3px;
                    aspect-ratio: 1;
                    border-radius: 50%;
                    --_m: 
                      conic-gradient(#0000 10%,#000),
                      linear-gradient(#000 0 0) content-box;
                    -webkit-mask: var(--_m);
                            mask: var(--_m);
                    -webkit-mask-composite: source-out;
                            mask-composite: subtract;
                    animation: l3 1s infinite linear;
                }

                @keyframes l3 {
                    to { transform: rotate(1turn); }
                }
            `;
            document.head.appendChild(style);
        }

        const spinner = document.createElement("div");
        spinner.className = "spinner";
        this.appendChild(spinner);
    }
}

customElements.define("loading-spinner", LoadingSpinner);