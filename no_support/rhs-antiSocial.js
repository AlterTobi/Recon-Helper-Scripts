// @name         Anti Social
// @version      0.0.1
// @description  hides group size selection from socialize card (greetings to @Tntnnbltn)
// @author       AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const myCssId = "antiSocialCSS";
  const myStyle = `div#socialize-card > div:nth-child(2) {
    display: none;
    }
    `;

  function antiSocial() {
    w.rhs.f.addCSS(myCssId, myStyle);
  }

  w.addEventListener("OPRReviewPageNewLoaded", antiSocial);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();