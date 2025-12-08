// ==UserScript==
// @name           RHS - show OPR version
// @version        1.0.0
// @description    show current OPR version
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/rhs-showOPRVersion.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/rhs-showOPRVersion.meta.js
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

  const versionDivID = "wfVersionDiv";
  const myCssId = "wfVersionCSS";
  const myStyle = `.wfVersionCSS {
    position: absolute;
    z-index: 9999;
    right: 270px;
    top: 10px;
    background-color: white;
    border: 2px solid red;
    padding: 5px;
    max-width: 50%;
    box-shadow: 7px 7px 5px grey;
    cursor: pointer;
    max-height: 95%;
    overflow: auto;}
    /* Styles for dark mode */
   .dark .wfVersionCSS {
        color: #ddd;
        background-color: #303030;
        box-shadow: 6px 6px 4px darkgrey;
      }
    .rhs-hidden { display: none; }
    .rhs-versionChanged {
      background-color: red !important;
      border-color: yellow !important;
      color: white !important;
    }
    `;

  const lStoreHist = "rhs_WFVersionHistory";
  let wfVersion;

  function showVersion(history) {
    function toggleVersions() {
      const versionList = document.getElementById("version-list");
      versionList.classList.toggle("rhs-hidden");
    }

    w.rhs.f.addCSS(myCssId, myStyle);
    // Erstelle das Dropdown-Menü
    const versionDropdown = document.createElement("div");
    versionDropdown.setAttribute("id", "version-dropdown");

    const versionButton = document.createElement("button");
    versionButton.setAttribute("id", "version-button");
    versionButton.appendChild(document.createTextNode("Version: " + wfVersion));
    versionDropdown.appendChild(versionButton);

    const versionList = document.createElement("ul");
    versionList.setAttribute("id", "version-list");
    versionList.setAttribute("class", "rhs-hidden");
    versionList.style.fontFamily = "Courier New, monospace"; // Nichtproportionaler Font
    versionDropdown.appendChild(versionList);

    for (let i = history.length - 1; i >= 0; i--) {
      const version = history[i].version;
      const date = history[i].date;
      const listItem = document.createElement("li");
      listItem.textContent = `${version} (${date})`;
      versionList.appendChild(listItem);
    }

    let versionDiv = document.getElementById(versionDivID);
    if (null === versionDiv) {
      const bodyElem = document.getElementsByTagName("body")[0];
      versionDiv = document.createElement("div");
      versionDiv.setAttribute("class", "wfVersionCSS");
      versionDiv.setAttribute("id", versionDivID);
      versionDiv.appendChild(versionDropdown);
      bodyElem.appendChild(versionDiv);
    } else {
      // remove existing child first
      versionDiv.removeChild(document.getElementById("version-dropdown"));
      versionDiv.appendChild(versionDropdown);
    }
    versionDropdown.addEventListener("click", toggleVersions);
  }

  function versionChanged(version) {
    console.warn(GM_info.script.name, "version changed");
    const msgStr = "WF version change " + version;
    w.rhs.f.createNotification(msgStr, "red");
    const elem = document.getElementById(versionDivID);
    if (null !== elem) {
      elem.classList.add("rhs-versionChanged");
    }
  }

  function handleVersion(versionHistory) {
    // get latest version
    const len = versionHistory.length;
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const now = new Date().toLocaleString(undefined, options);
    const v = {};
    v.date = now;
    v.version = wfVersion;

    if ( len > 0 ) {
      const last = versionHistory[len-1].version;
      if (last !== wfVersion) {
        versionChanged(wfVersion);
        versionHistory.push(v);
        w.rhs.f.localSave(lStoreHist, versionHistory);
      }
    } else {
      // first entry
      versionHistory.push(v);
      w.rhs.f.localSave(lStoreHist, versionHistory);
    }
  }

  function init() {
    wfVersion = w.rhs.g.wfVersion();
    w.rhs.f.localGet(lStoreHist, []).then((hist)=>{
      showVersion(hist);
      handleVersion(hist);
    });
  }

  w.addEventListener("OPRVersionChanged", init);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
