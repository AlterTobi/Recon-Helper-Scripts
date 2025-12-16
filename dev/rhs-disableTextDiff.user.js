// ==UserScript==
// @name           RHS - Disable Text Diff
// @version        1.0.0
// @description    disables the Niantic text diff display by clicking at the slider
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-disableTextDiff.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-disableTextDiff.meta.js
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