// ==UserScript==
// @name           RHS - Expire Timer
// @version        1.0.0
// @description    Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author         MrJPGames / AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/rhs-expireTimer.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/rhs-expireTimer.meta.js
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

  const logoElem = "wf-logo";
  const sessvarMiss = "warnBase";
  const myCSSId = "rhsExpireCSS";
  const myStyle = `.rhsExpire {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .rhsExpireCounter {
      font-size: 20px;
      color: #20B8E3;
    }
    .dark .rhsExpire {
      color: #ddd;
    }
`;

  const buttonID = "expireButton";
  let timeElem;

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  // Helper functions
  function pad(num, size) {
    let s = num + "";
    while (s.length < size) {s = "0" + s;}
    return s;
  }

  function updateTimer() {
    const now = Date.now();
    const tDiff = w.rhs.g.reviewPageData().expires - now;

    if (tDiff > 0) {
      const tDiffMin = Math.floor(tDiff / 1000 / 60);
      const tDiffSec = Math.ceil((tDiff / 1000) - (60 * tDiffMin));
      timeElem.innerText = pad(tDiffMin, 2) + ":" + pad(tDiffSec, 2);
      // Retrigger function in 1 second
      setTimeout(updateTimer, 1000);
    } else {
      timeElem.innerText = "EXPIRED!";
      timeElem.setAttribute("style", "color: red;");
    }
  }

  function createTimer(message) {
    w.rhs.f.addCSS(myCSSId, myStyle);
    w.rhs.f.awaitElem(logoElem).then(elem=>{
      const div = document.createElement("div");
      div.className = "rhsExpire";
      div.id = buttonID;
      const expireTimer = document.createElement("p");
      expireTimer.appendChild(document.createTextNode(message));
      div.appendChild(expireTimer);
      timeElem = document.createElement("p");
      timeElem.appendChild(document.createTextNode("??:??"));
      timeElem.className = "rhsExpireCounter";
      div.appendChild(timeElem);
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
      updateTimer();
    })
      .catch(e => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  const init = () => {
    w.addEventListener("OPRReviewPageLoaded", () => createTimer("Time remaining: "));
    w.addEventListener("OPRReviewDecisionSent", removeButton);
  };


  // === no changes needed below this line ======================
  if("undefined" === typeof(rhs)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
      console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
    }
  } else {
    init();
  }

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
