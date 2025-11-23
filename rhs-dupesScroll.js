// @name         dupes Scroll
// @version      1.0.0
// @description  make duplicates strip scrollable by mouse wheel
// @author       AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;
  const sessvarMiss = "warnBase";

  function filmStripScroll() {
    // Make film strip (duplicates) scrollable
    const filmStripSelector ="#check-duplicates-card div.w-full.flex.overflow-x-auto.overflow-y-hidden.ng-star-inserted";
    const candidate = w.rhs.g.reviewPageData();

    function horizontalScroll(e) {
      this.scrollLeft += e.deltaY;
      e.preventDefault(); // Stop regular scroll
    }

    if (candidate.nearbyPortals.length > 0) {
      w.rhs.f.awaitElem(filmStripSelector).then((elem)=>{
      // Hook function to scroll event in filmstrip
        elem.addEventListener("wheel", horizontalScroll, false);

        // Schleife über alle Bilder
        const bilder = document.querySelectorAll(filmStripSelector + " img");
        for (let i = 0; i < bilder.length; i++) {
          const img = bilder[i];
          const alt = img.getAttribute("alt");

          // Wenn das Bild einen Alt-Text hat, füge einen title-Text hinzu
          if (alt) {
            img.setAttribute("title", alt);
          }
        }
      })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }
  }

  w.addEventListener("OPRReviewPageNewLoaded", filmStripScroll);

  // === no changes needed below this line ======================
  if("undefined" === typeof(rhs)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
      console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
    }
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
