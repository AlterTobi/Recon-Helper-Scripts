// ==UserScript==
// @name           RHS - Click Enlarge Images
// @version        0.0.1
// @description    auto-click the enlarge images symbols (requires image mod script)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-clickEnlargeImages.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-clickEnlargeImages.meta.js
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

  const l1Sel = "app-photo-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";
  const l2Sel = "app-supporting-info-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";

  function click() {
    w.rhs.f.awaitElem(l2Sel)
      .then((elem)=>{
        elem.click();
        console.log(GM_info.script.name, " - klick supporting image");
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    w.rhs.f.awaitElem(l1Sel)
      .then((elem)=>{
        elem.click();
        console.log(GM_info.script.name, " - klick main image");
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  w.addEventListener("OPRReviewPageNewLoaded", click);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();