// @name         Click Enlarge Images
// @version      0.0.1
// @description  auto-click the enlarge images symbols (requires image mod script)
// @author       AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const l1Sel = "app-photo-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";
  const l2Sel = "app-supporting-info-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";

  function click() {
    w.rhs.f.awaitElem(l2Sel).then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    w.rhs.f.awaitElem(l1Sel)
      .then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  w.addEventListener("OPRReviewPageNewLoaded", click);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();