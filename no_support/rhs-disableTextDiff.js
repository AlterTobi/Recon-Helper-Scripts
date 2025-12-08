// @name         Disable Text Diff
// @version      1.0.0
// @description  disables the Niantic text diff display by clicking at the slider
// @author       AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const matSlider = "mat-slide-toggle";
  const inputSlider = "input.mat-slide-toggle-input";

  function disableTextDiff() {
    const edit = w.rhs.g.edit();
    if (edit.what.description || edit.what.title) {
      w.rhs.f.awaitElem(matSlider).then( () =>{
        const sliders = document.querySelectorAll(inputSlider);
        sliders.forEach((s) => {
          if ("true" === s.getAttribute("aria-checked")) {
            s.click();
          }
        });
      })
        .catch( () => { console.log(GM_info.script.name, "no slider found"); } );
    }
  }

  w.addEventListener("OPRReviewPageEditLoaded", disableTextDiff);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();