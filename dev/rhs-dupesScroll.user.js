// ==UserScript==
// @name           RHS - dupes Scroll
// @version        1.0.0
// @description    make duplicates strip scrollable by mouse wheel
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-dupesScroll.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-dupesScroll.meta.js
// @match          https://opr.ingress.com/*
// ==/UserScript==

/* Copyright 2025 AlterTobi

   This file is part of the Recon Helper Scripts Extension Scripts collection. Further scripts
   can be found on the @homepage, see above.

   Recon Helper Scripts are free software: you can redistribute and/or modify
   them under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Recon Helper Scripts are distributed in the hope that they will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You can find a copy of the GNU General Public License at the
   web space where you got this script from
   https://altertobi.github.io/Recon-Helper-Scripts/dev/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

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
