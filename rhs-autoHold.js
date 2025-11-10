// @name         AutoHold
// @version      0.0.1
// @description  put nomination on HOLD when additional stament contains the text "#hold"
// @author       AlterTobi

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
        window.setTimeout(_prozessNext, timeout);
      } else {
        w.rhs.f.createNotification("AutoHold failed, see console for details", "red");
        console.warn(request.statusText, request.responseText);
      }
    });
    request.send(postData);
  }

  function _reloadPage() {
    window.location.reload();
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
      window.setTimeout(_prozessNext, timeout);
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
    window.addEventListener("OPRNominationListLoaded", autoHold);
  } else {
    console.warn(GM_info.script.name, "Need at least rhs-base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
