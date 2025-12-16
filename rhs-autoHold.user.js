// ==UserScript==
// @name           RHS - AutoHold
// @version        1.0.0
// @description    put nomination on HOLD when additional stament contains the text "#hold"
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/rhs-autoHold.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/rhs-autoHold.meta.js
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

/* eslint no-use-before-define: ["error", { "functions": false }]*/

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;
  const sessvarMiss = "warnBase";
  const baseMinVersion = "0.0.1";

  const searchRegex = /#hold|,yxcv|,zxcv|placeholder|Platzhalter/;
  const idlist = [];
  const timeout = 2500;

  // based on example from https://www.w3schools.com/js/js_cookies.asp
  function _getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (" " === c.charAt(0)) {
        c = c.substring(1);
      }
      if (0 === c.indexOf(name)) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function _setHold(id) {
    // XHR -> HOLD
    const theUrl = "/api/v1/vault/manage/hold";
    const request = new XMLHttpRequest();
    const csrf = _getCookie("XSRF-TOKEN");

    const data = {};
    data.id = id;
    const postData = JSON.stringify(data);

    request.open("POST", theUrl, true);
    request.setRequestHeader("content-type", "application/json");
    request.setRequestHeader("accept", "application/json, text/plain, */*");
    request.setRequestHeader("x-angular", "");
    request.setRequestHeader("x-csrf-token", csrf);

    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 300) {
        // prozess next
        setTimeout(_prozessNext, timeout);
      } else {
        w.rhs.f.createNotification("AutoHold failed, see console for details", "red");
        console.warn(request.statusText, request.responseText);
      }
    });
    request.send(postData);
  }

  function _reloadPage() {
    w.location.reload();
  }

  function _prozessNext() {
    if (idlist.length > 0) {
      // have more?
      const o = idlist.pop();
      w.rhs.f.createNotification(`AutoHold: ${o.title}`, "orange");
      _setHold(o.id);
    } else {
      w.rhs.f.createNotification("AutoHold: all nominations processed, click arrow to reload page", "green", { callback: _reloadPage, icon: "renew"});
    }
  }

  function autoHold() {
    const nomList = w.rhs.g.nominationsList();
    let nom;

    for (let i = 0; i < nomList.length; i++) {
      nom = nomList[i];
      // process all new / in queue - NOMINATION only
      if (("NOMINATION" === nom.type) && ("NOMINATED" === nom.status)) {
        // search for '#hold'
        if (nom.statement.toLowerCase().search(searchRegex) > -1) {
          const o = {};
          o.id = nom.id;
          o.title = nom.title;
          idlist.push(o);
        }
      }
    }
    if (idlist.length > 0) {
      // got some ;-)
      setTimeout(_prozessNext, timeout);
    }
  }

  // === no changes needed below this line ======================
  if("undefined" === typeof(rhs)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
      console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
    }
  } else if (w.rhs.f.hasMinVersion(baseMinVersion)) {
    w.addEventListener("OPRNominationListLoaded", autoHold);
  } else {
    console.warn(GM_info.script.name, "Need at least rhs-base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
