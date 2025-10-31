// @name         Template
// @version      1.0.0
// @description  Template
// @author       AlterTobi

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const baseMinVersion = "0.0.1";
  const myCssId = "templateCSS";
  const myStyle = `body {
        display: none;
    }
    `;

  function myTemplate() {
    window.rhs.f.addCSS(myCssId, myStyle);
    // YOUR CODE HERE
    // .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  const init = () => {
    window.addEventListener("RHSHomePageLoaded", myTemplate);

  };

  // === no changes needed below this line ======================
  if("undefined" === typeof(rhs)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
      console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
    }
  } else if (window.rhs.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    console.warn(GM_info.script.name, "Need at least rhs-base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();