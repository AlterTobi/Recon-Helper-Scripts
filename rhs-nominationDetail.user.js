// ==UserScript==
// @name           RHS - Nomination Detail
// @version        0.0.1
// @description    improvements for nomination detail page
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/rhs-nominationDetail.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/rhs-nominationDetail.meta.js
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
   https://altertobi.github.io/Recon-Helper-Scripts/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  let propsLoaded = false;
  let needDiv = true;
  let rejDiv, flexDiv;

  function modifyNomDetail() {
    const myLang = w.rhs.g.properties().language;
    const messages = w.rhs.g.messages();
    const allStr = messages[myLang];
    const myID = "nominationDetailRejectDiv";
    const startTime = Date.now();
    const maxWaitTime = 5000;

    if (propsLoaded) {
      const nomDetail = w.rhs.g.nominationDetail();

      if (needDiv && ("APPEALED" === nomDetail.status)) {
        // add a DIV to bring back reject reasons
        rejDiv = document.createElement("div");
        rejDiv.setAttribute("class", "ng-star-inserted");
        rejDiv.setAttribute("id", myID);
        rejDiv.innerHTML = '<div class="details-pane__section"><h5>' +
                    allStr["criteria.rejection"] +"</h5><div></div><div></div>";
        flexDiv = document.querySelector("app-details-pane > div > div > div > div.flex.flex-row.justify-between");
        flexDiv.insertAdjacentElement("afterEnd", rejDiv);
        needDiv = false;
      } else if ("REJECTED" === nomDetail.status) {
        if (flexDiv && document.getElementById(myID)) {
          flexDiv.parentNode.removeChild(rejDiv);
          needDiv = true;
        }
      }

      if (["REJECTED", "APPEALED"].includes(nomDetail.status)) {
        let rlc, rName, rNameShort, fullText;
        const rejectReasons = [];

        for (let i=0; i < nomDetail.rejectReasons.length; i++) {
          rlc = nomDetail.rejectReasons[i].reason.toLowerCase();
          rName = "reject.reason." + rlc;
          rNameShort = rName + ".short";
          if (undefined === allStr[rName]) {
            fullText = rName;
          } else {
            fullText = "<strong>" + rlc + "</strong>: " + allStr[rNameShort]+" - "+allStr[rName];
          }
          rejectReasons.push(fullText);
        }
        const rejSection = document.querySelector("div.details-pane__section");
        // first child is heading, so start with 1 (second child)
        for (let i = 1; i <= rejectReasons.length; i++) {
          rejSection.children[i].innerHTML = rejectReasons[i-1];
        }
      }
    } else if (Date.now() - startTime >= maxWaitTime) {
      console.log(GM_info.script.name, ": properties not loaded, retry");
      setTimeout(modifyNomDetail, 500);
    } else {
      console.warn(GM_info.script.name, ": properties not loaded, abort");
    }
  }

  w.addEventListener("OPRNominationDetailLoaded", () => {setTimeout(modifyNomDetail, 200);});
  w.addEventListener("OPRPropertiesLoaded", () => {propsLoaded = true;});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
