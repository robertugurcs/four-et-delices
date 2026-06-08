const BTN_SRC = "/assets/footer/website-design-btn.webp?v=15";

/** Full pill CTA artwork — illustration + label baked in as one asset. */
export function WebsiteDesignBtnScene() {
  return (
    <img
      src={BTN_SRC}
      alt=""
      aria-hidden
      className="site-footer__design-btn__img"
      width={691}
      height={178}
      decoding="async"
      draggable={false}
    />
  );
}
