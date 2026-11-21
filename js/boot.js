(function () {
  if (typeof PRODUCT_NAME !== "string" || !PRODUCT_NAME) return;
  document.querySelectorAll("[data-product-name]").forEach(function (el) {
    el.textContent = PRODUCT_NAME;
  });
  var subtitle = document.body.getAttribute("data-title");
  document.title = subtitle ? PRODUCT_NAME + " — " + subtitle : PRODUCT_NAME;
})();
