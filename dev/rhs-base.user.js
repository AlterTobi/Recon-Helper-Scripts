// ==UserScript==
// @name           RHS - Base
// @version        0.0.8
// @description    basic functionality for OPR
// @author         AlterTobi
// @run-at         document-start
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-base.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/dev/rhs-base.meta.js
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

/* eslint no-unused-vars: ["error", { "args": "none" }] */

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  /* RHS data structures */
  const PREFIX = "/api/v1/vault/";
  const loginPath = "/login";
  // session storage
  const sStoreReview = "rhs_Reviews";
  const sStoreNominationsDetails = "rhs_nominationDetails";
  // indexedDB
  const idbName = "rhs-data";
  const idbLocalStorageCompat = "localStorage";

  const myCssId = "notifyAreaCSS";
  const myStyle = `
    /* Container */
        #rhsNotify {
          position: absolute;
          bottom: 1em;
          right: 1em;
          width: 40em;
          z-index: 100;
        }

    /* Einzelne Notifications */
        .rhsNotification {
          border-radius: 0.5em;
          padding: 1em;
          margin-top: 1.5em;
          color: white;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

    /* Inhalt mit Text und Buttons */
        .rhsNotificationContent {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

    /* Text */
        .rhsTextGroup {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .rhsNotificationContent p {
          flex: 1; /* Flexibles Wachstum des Textes */
          margin: 0;
          padding-right: 10px; /* Platz zwischen Text und Buttons */
          word-wrap: break-word; /* Zeilenumbruch für lange Texte */
          overflow-wrap: break-word;
        }

    /* Buttons-Gruppe */
        .rhsButtonGroup {
          display: flex;
          align-items: center;
        }

    /* notification Buttons */
        .rhsNotiButton {
          font-size: 32px;
          cursor: pointer;
        }

    .rhsBgGreen{
    background-color: #3e8e41CC;
    }
    .rhsBgRed{
    background-color: #CC0000B0;
    }
    .rhsBgOrange{
    background-color: #FC9000D0;
    }
    .rhsBgBlue{
    background-color: #0010DFD0;
    }
    .rhsBgFuchsia{
    background-color: fuchsia;
    }
    `;

  const rhs = {};
  rhs.showcase = {};
  rhs.review = {};
  rhs.review.decision = {};
  rhs.review.appeal = {};
  rhs.profile = {};
  rhs.nominations = {};
  rhs.edit = {};
  rhs.properties = {};
  rhs.settings = {};
  rhs.messages = {};
  rhs.version = "0.0.0";
  rhs.userId = false;
  rhs.currentPage = null;

  rhs.OPR_PAGES = {
    HOME: 1,
    REVIEW: 2,
    PROFILE: 3,
    MANAGE: 4,
    MANAGE_DETAIL: 5,
    PROPERTIES: 6,
    SETTINGS: 7,
    HELP: 8
  };

  const tmpUserId = "temporaryUserId";
  let propsLoaded = false;
  let _isMobile = false;

  w.rhs = {};
  w.rhs.f = w.rhs.g = w.rhs.s = {}; // functions, getter, setter

  // test for mobile platform, for browser compatibility see
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
  if ((undefined !== window.navigator.userAgentData ) && window.navigator.userAgentData.mobile ) {
    _isMobile = true;
  }

  /* =========== helper ============================= */
  function _awaitElem(selector, maxWaitTime = 5000) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const checkForElement = () => {
        const elem = document.querySelector(selector);
        if (elem) {
          resolve(elem);
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(new Error(`Timeout waiting for element with selector ${selector} after ${maxWaitTime/1000} seconds`));
        } else {
          setTimeout(checkForElement, 100);
        }
      };
      checkForElement();
    });
  }

  function checkWfVersion(v) {
    if (rhs.version !== v) {
      console.log("OPR version changed from", rhs.version, "to", v);
      rhs.version = v;
      w.dispatchEvent(new Event("OPRVersionChanged"));
    }
  }

  // make a copy of data
  function jCopy(data) {
    return (JSON.parse(JSON.stringify(data)));
  }

  // Hash funktion
  const TSH = s => {let h=9; for(let i=0; i<s.length;) {h=Math.imul(h^s.charCodeAt(i++), 9**9);}return h^(h>>>9);};

  // set UserID when properties available
  function setUserId() {
    try {
      rhs.userId = TSH(rhs.properties.socialProfile.username).toString(16);
    } catch(e) {
      console.error(GM_info.script.name, ": userprofile does not contain username ", e);
    }
  }
  w.addEventListener("OPRPropertiesLoaded", setUserId);

  // sometimes (i.e. when pressing F5) properties are not (re-)loaded by WF
  function _getPropsOnce() {
    if (false === propsLoaded) {
      if ( null !== document.querySelector("body > app-root > app-wayfarer")) {
        // make sure, application is loaded, login is: document.querySelector('body > app-root > app-login')
        const theUrl = "/api/v1/vault/properties";
        const request = new XMLHttpRequest();
        request.open("GET", theUrl, true);
        request.addEventListener("load", function(event) {
          if (!(request.status >= 200 && request.status < 300)) {
            console.warn(request.statusText, request.responseText);
          }
        });
        request.send();
        propsLoaded = true;
      }
    }
  }

  // wait for UserId
  const getUserId = () => new Promise((resolve, reject) => {
    const checkUID = tries => {
      if (tries > 20) {
        // resolve(tmpUserId);
        _getPropsOnce();
        reject();
      } else if (rhs.userId) {
        resolve(rhs.userId);
      } else {
        setTimeout(() => checkUID(tries + 1), 200);
      }
    };
    checkUID(1);
  });

  /* =========== IndexedDB ============================= */
  const getIDBInstance = version => new Promise((resolve, reject) => {

    if (!w.indexedDB) {
      reject("This browser doesn't support IndexedDB!");
      return;
    }

    const openRequest = w.indexedDB.open(idbName, version);
    openRequest.onsuccess = event => {
      const db = event.target.result;
      resolve(db);
    };
    openRequest.onerror = (event) => {
      console.error("Error using IndexedDB", event.target.errorCode);
      reject(event.target.errorCode);
    };
    openRequest.onupgradeneeded = event => {
      console.log(GM_info.script.name, "Upgrading database...");
      const db = event.target.result;
      // const ver = db.version;
      if (!db.objectStoreNames.contains(idbLocalStorageCompat)) {
        db.createObjectStore(idbLocalStorageCompat, { keyPath: "index" });
      }
    };
  });
  /* =========== /IndexedDB ============================ */

  /* ================ overwrite XHR ================ */
  const openOrig = w.XMLHttpRequest.prototype.open, sendOrig = w.XMLHttpRequest.prototype.send;

  /* handle data */
  function handleReviewData(result) {
    // save review data in ...pagedata and sessionstore
    w.rhs.f.sessionGet(sStoreReview, [] ).then((reviewSessionHist)=>{
      rhs.review.sessionHist = w.rhs.f.makeIDbasedDictionary(reviewSessionHist);
      if (undefined === rhs.review.sessionHist[result.id]) {
        reviewSessionHist.push(result);
        w.rhs.f.sessionSave(sStoreReview, reviewSessionHist);
        rhs.review.sessionHist[result.id] = result;
      }
    });
    rhs.edit.isEdit = false;

    rhs.review.pageData = result;
    switch (rhs.review.pageData.type) {
      case "NEW":
        w.dispatchEvent(new Event("OPRReviewPageNewLoaded"));
        break;
      case "EDIT":
        rhs.edit.isEdit = true;
        rhs.edit.what = {};
        rhs.edit.what.location = result.locationEdits.length > 1;
        rhs.edit.what.description = result.descriptionEdits.length > 0;
        rhs.edit.what.title = result.titleEdits.length > 0;
        w.dispatchEvent(new Event("OPRReviewPageEditLoaded"));
        break;
      case "PHOTO":
        w.dispatchEvent(new Event("OPRReviewPagePhotoLoaded"));
        break;
    }
    w.dispatchEvent(new Event("OPRReviewPageLoaded"));
    w.dispatchEvent(new Event("OPRPageLoaded"));
  }

  function handleLoadEvent(e) {
    try {
      const response = this.response;
      const json = JSON.parse(response);
      // ignore captcha
      if (json.captcha) {
        return;
      }
      if ("OK" !== json.code) {
        console.warn("OPR: got no OK from server", response);
        return;
      }
      if (json.result) {
        checkWfVersion(json.version);
      } else {
        console.warn("OPR: got no result from server");
        return;
      }

      let lang;
      switch (this._url) {
        case PREFIX + "home":
          rhs.currentPage = rhs.OPR_PAGES.HOME;
          rhs.showcase.list = json.result.showcase;
          w.dispatchEvent(new Event("OPRHomePageLoaded"));
          w.dispatchEvent(new Event("OPRPageLoaded"));
          break;
        case PREFIX + "review":
          rhs.currentPage = rhs.OPR_PAGES.REVIEW;
          if ("GET" === this._method) {
            handleReviewData(json.result);
          }
          break;
        case PREFIX + "profile":
          rhs.currentPage = rhs.OPR_PAGES.PROFILE;
          rhs.profile = json.result;
          w.dispatchEvent(new Event("OPRProfileLoaded"));
          w.dispatchEvent(new Event("OPRPageLoaded"));

          break;
        case PREFIX + "manage":
          rhs.currentPage = rhs.OPR_PAGES.MANAGE;
          // nomination list
          rhs.nominations.list = json.result.submissions; // .filter(obj => "NOMINATION" === obj.type).slice();
          rhs.nominations.canAppeal = json.result.canAppeal;
          w.dispatchEvent(new Event("OPRNominationListLoaded"));
          w.dispatchEvent(new Event("OPRPageLoaded"));
          break;
        case PREFIX + "manage/detail":
          rhs.currentPage = rhs.OPR_PAGES.MANAGE_DETAIL;
          // nomination detail
          rhs.nominations.detail = json.result;
          // save nomination Details in Sessionstorage
          w.rhs.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
            nominationDict[rhs.nominations.detail.id] = rhs.nominations.detail;
            w.rhs.f.sessionSave(sStoreNominationsDetails, nominationDict).then(()=>{
              w.dispatchEvent(new Event("OPRNominationDetailLoaded"));
              w.dispatchEvent(new Event("OPRNominationDetailLoaded"+json.result.type));
            });
          });
          break;
        case PREFIX + "properties":
          rhs.currentPage = rhs.OPR_PAGES.PROPERTIES;
          rhs.properties = json.result;
          w.dispatchEvent(new Event("OPRPropertiesLoaded"));
          break;
        case PREFIX + "settings":
          rhs.currentPage = rhs.OPR_PAGES.SETTINGS;
          rhs.settings = json.result;
          w.dispatchEvent(new Event("OPRSettingsLoaded"));
          w.dispatchEvent(new Event("OPRPageLoaded"));
          break;
        case PREFIX + "help":
          rhs.currentPage = rhs.OPR_PAGES.HELP;
          w.dispatchEvent(new Event("OPRHelpPageLoaded"));
          w.dispatchEvent(new Event("OPRPageLoaded"));
          break;
        default:
        // messages?language=de
          if (PREFIX + "messages?language=" === this._url.substr(0, 18 + PREFIX.length)) {
            lang = this._url.substr(18 + PREFIX.length);
            rhs.messages[lang] = json.result;
          } else {
          // console.log('RHS Base - unhandled URL: ',
          // this._url);
          }
          break;
      }
    } catch (e) {
      console.warn("OPR: failed to parse response from server");
      console.log(e);
    }
  }

  function openReplacement(method, url, async, user, password) {
    this._url = url;
    this._method = method;
    // console.log( "RHS OPEN: ", method, url );
    if (PREFIX === this._url.substr(0, PREFIX.length)) {
      // handle only OPR URLs
      this.addEventListener("load", handleLoadEvent);
    }
    return openOrig.apply(this, arguments);
  }

  function sendReplacement(daten) {
    let candidate, json;
    // handle only POST requests
    if ("POST" === this._method) {
      switch (this._url) {
        case PREFIX + "review":
          json = JSON.parse(daten);
          candidate = rhs.review.sessionHist[json.id];
          rhs.review.decision.candidate = candidate;
          rhs.review.decision.decision = json;
          w.dispatchEvent(new Event("OPRReviewDecisionSent"));
          break;
        case PREFIX + "review/skip":
          json = JSON.parse(daten);
          candidate = rhs.review.sessionHist[json.id];
          rhs.review.decision.candidate = candidate;
          json.skipped = true;
          rhs.review.decision.decision = json;
          w.dispatchEvent(new Event("OPRReviewDecisionSent"));
          break;
        case PREFIX + "manage/appeal":
          json = JSON.parse(daten);
          rhs.review.appeal = json;
          w.dispatchEvent(new Event("OPRReviewAppealSent"));
          break;
        default:
          break;
      }
    }
    return sendOrig.apply(this, arguments);
  }

  w.XMLHttpRequest.prototype.open = openReplacement;
  w.XMLHttpRequest.prototype.send = sendReplacement;
  /* ================ /overwrite XHR ================ */

  /* ================ showcase ====================== */
  function showCaseSwipe() {
    const myDetail = document.getElementsByTagName("app-showcase-item")[0].__ngContext__[29];
    rhs.showcase.current = myDetail;
    w.dispatchEvent(new Event("OPRShowCaseClick"));
  }

  function showCaseLoaded() {
    let touchstartX = 0;
    //      let touchstartY = 0;
    let touchendX = 0;
    //      let touchendY = 0;
    function handleGesture() {
      if (touchendX !== touchstartX) {
        // swipe horizontally
        setTimeout(showCaseSwipe(), 100);
      }
    }

    rhs.showcase.current = rhs.showcase.list[0];
    const buttons = document.getElementsByClassName("wf-button showcase-gallery__button wf-button--icon ng-star-inserted");
    for (let i=0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", () => setTimeout(()=>{
        const myDetail = document.getElementsByTagName("app-showcase-item")[0].__ngContext__[29];
        rhs.showcase.current = myDetail;
        w.dispatchEvent(new Event("OPRShowCaseClick"));
      }, 100));
    }
    if (_isMobile) {
      _awaitElem("app-showcase-gallery").then((elem) => {
        elem.addEventListener("touchstart", function(event) {
          touchstartX = event.changedTouches[0].screenX;
          //          touchstartY = event.changedTouches[0].screenY;
        }, false);
        elem.addEventListener("touchend", function(event) {
          touchendX = event.changedTouches[0].screenX;
          //          touchendY = event.changedTouches[0].screenY;
          handleGesture();
        }, false);
      })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }
  }

  w.addEventListener("OPRHomePageLoaded", () => {setTimeout(showCaseLoaded, 250);});
  /* ================ /showcase ===================== */

  /* ================ nomination page =============== */
  function loadCachedNomination(nomItem) {
    if (undefined === rhs.nominations.detail) {
      setTimeout(loadCachedNomination, 250, nomItem);
      return;
    }
    const myID = nomItem.__ngContext__[22].id;
    if (myID === rhs.nominations.detail.id) {
      // already loaded, do nothing
      return;
    }
    w.rhs.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
      const nomDetail = nominationDict[myID];
      if (undefined === nomDetail) {
        // nothing there, ignore
        return;
      }
      // set cached values
      rhs.nominations.detail = nomDetail;
      w.dispatchEvent(new Event("OPRNominationDetailLoaded"));
    });
  }
  function nominationsClickHander(elem) {
    const nomItem = elem.target.closest("app-submissions-list-item");
    if (nomItem) {
      setTimeout(loadCachedNomination, 250, nomItem);
    } else {
      console.warn(GM_info.script.name, ": app-submissions-list-item missing");
    }
  }
  function addNominationsClickHandler() {
    const nomList = document.getElementsByTagName("app-submissions-list")[0];
    if (nomList) {
      nomList.addEventListener("click", nominationsClickHander);
    } else {
      console.warn(GM_info.script.name, ": app-submissions-list missing");
    }
  }
  w.addEventListener("OPRNominationListLoaded", addNominationsClickHandler);
  /* ================ /nomination page ============== */

  /* ================ basic functions =============== */
  // save data in "localstorage"
  w.rhs.f.localSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      // console.log(GM_info.script.name, "localSave:", userId, name, content);
      const index = name+"_"+userId;
      const data = {index: index, data:content};
      getIDBInstance().then(db => {
        const tx = db.transaction([idbLocalStorageCompat], "readwrite");
        tx.oncomplete = event => { db.close(); resolve(); };
        tx.onerror = reject;
        const objectStore = tx.objectStore(idbLocalStorageCompat);
        objectStore.put(data);
        tx.commit();
      })
        .catch(reject);
    })
      .catch(()=>{
        console.warn(GM_info.script.name, "no userID - save rejected");
        reject();
      }
      );
  });

  // get data from "localstorage"
  w.rhs.f.iDBGetLScompat = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      // console.log(GM_info.script.name, "iDBGetLScompat:", userId, name);
      const index = name+"_"+userId;
      getIDBInstance().then(db => {
        const tx = db.transaction([idbLocalStorageCompat], "readonly");
        tx.oncomplete = ( event ) => {db.close();};
        tx.onerror = ( event ) => {console.log("transaction error:", event);};
        const objectStore = tx.objectStore(idbLocalStorageCompat);
        const request = objectStore.get(index);
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            resolve(content);
          }
        };
        request.onerror = (event) => {
          console.log("error retrieving data:", event);
          resolve(undefined);
        };
      });
    });
  });

  // save data in localstorage
  w.rhs.f.localStorageSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const json = JSON.stringify(content);
      localStorage.setItem(name+"_"+userId, json);
      resolve();
    });
  });

  // get data from localstorage
  w.rhs.f.localStorageGet = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const data = JSON.parse(localStorage.getItem(name+"_"+userId)) || JSON.parse(localStorage.getItem(name)) || content;
      resolve(data);
    });
  });

  // remove data from localstorage
  w.rhs.f.localStorageRemove = (name) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      localStorage.removeItem(name+"_"+userId);
      resolve();
    });
  });

  // get data from IDB or localstorage
  w.rhs.f.localGet = (name, content = "") => new Promise((resolve, reject) => {
    w.rhs.f.iDBGetLScompat(name, content)
      .then(data => {
        if ((data !== content)&&(undefined !== data)) { // got something
          resolve(data);
        } else {
          w.rhs.f.localStorageGet(name, content)
            .then((data) => {
              // jetzt in IDB speichern
              w.rhs.f.localSave(name, data)
                .then(()=>{
                  getUserId().then((userId) => {
                    if (tmpUserId !== userId) {
                      // wenn in IDB gespeichert und eine gültige userID da ist: löschen
                      w.rhs.f.localStorageRemove(name);
                    }
                  });
                });
              resolve(data);
            });
        }
      });
  });

  // save data in sessionstorage
  w.rhs.f.sessionSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const json = JSON.stringify(content);
      sessionStorage.setItem(name+"_"+userId, json);
      resolve();
    });
  });

  // gete data from sessionstorage
  w.rhs.f.sessionGet = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const data = JSON.parse(sessionStorage.getItem(name+"_"+userId)) || content;
      resolve(data);
    });
  });

  // add CSS to the head, if not there
  w.rhs.f.addCSS = function(myID, styles) {
    if ("string"===typeof(myID) && myID.length>0) {
      // already there?
      if (null === document.getElementById(myID)) {
        const headElem = document.getElementsByTagName("HEAD")[0];
        const customStyleElem = document.createElement("style");
        customStyleElem.setAttribute("id", myID);
        customStyleElem.appendChild(document.createTextNode(styles));
        headElem.appendChild(customStyleElem);
      }
    } else {
      console.error(GM_info.script.name, " addCSS() error: need ID to be defined");
    }
  };

  // Useful to make comparing easier. Essentially this function iterates over
  // all items and uses it's unique ID as key and stores relevant values under
  // that key. This way on checking we can simply find the ID when looking at
  // a current item
  w.rhs.f.makeIDbasedDictionary = function(itemList) {
    const dict = {};
    let item;
    for (let i = 0; i < itemList.length; i++) {
      item = itemList[i];
      dict[item.id] = item;
    }
    return dict;
  };

  w.rhs.f.hasUserId = function() {
    return rhs.userId;
  };

  w.rhs.f.hasMinVersion = function(version = "1.0.0") {
    return version <= GM_info.script.version;
  };

  w.rhs.f.createNotificationArea = function() {
    const myID = "rhsNotify";
    if ( null === document.getElementById(myID)) {
      const container = document.createElement("div");
      container.id = myID;
      document.getElementsByTagName("body")[0].appendChild(container);
    }
  };

  w.rhs.f.createNotification = function(message = "no message", color = "green", callbackConfig = null) {
    const notification = document.createElement("div");
    switch (color) {
      case "red":
        notification.setAttribute("class", "rhsNotification rhsBgRed");
        break;
      case "orange":
        notification.setAttribute("class", "rhsNotification rhsBgOrange");
        break;
      case "blue":
        notification.setAttribute("class", "rhsNotification rhsBgBlue");
        break;
      case "fuchsia":
        notification.setAttribute("class", "rhsNotification rhsBgFuchsia");
        break;
      default:
        notification.setAttribute("class", "rhsNotification rhsBgGreen");
        break;
    }

    const notificationContent = document.createElement("div");
    notificationContent.setAttribute("class", "rhsNotificationContent");

    if ("string" === typeof message) {
      const content = document.createElement("p");
      content.textContent = message;
      notificationContent.appendChild(content);
    } else if (Array.isArray(message)) {
      const textGroup = document.createElement("div");
      textGroup.setAttribute("class", "rhsTextGroup");
      message.forEach(item => {
        if ("string" === typeof item) {
          const content = document.createElement("p");
          content.textContent = item;
          textGroup.appendChild(content);
        } else {
          console.warn("Ungültiges Element in der Nachrichtenliste: ", item);
        }
      });
      notificationContent.appendChild(textGroup);
    } else {
      console.error("Ungültiger Nachrichtentyp: Muss ein String oder ein Array von Strings sein.");
      return;
    }


    const buttonGroup = document.createElement("div");
    buttonGroup.setAttribute("class", "rhsButtonGroup");

    // Schließen-Button
    const closeButton = document.createElement("button");
    closeButton.setAttribute("class", "rhsNotiButton material-icons");
    closeButton.innerText = "close";
    closeButton.onclick = function() {
      notification.remove();
    };

    // Handle Callbacks - Buttons, autoclose...
    if (callbackConfig) {
      // do we have a callback function?
      if ("function" === typeof callbackConfig.callback) {
        const actionButton = document.createElement("button");
        actionButton.setAttribute("class", "wfesNotiButton material-icons");

        let actionIcon;
        switch (callbackConfig.icon) {
          case "play":
            actionIcon = "play_circle_outline";
            break;
          case "search":
            actionIcon = "search";
            break;
          case "renew":
            actionIcon="autorenew";
            break;
          default:
            actionIcon = "play_circle";
        }

        actionButton.innerText = actionIcon;

        actionButton.onclick = function(event) {
          event.stopPropagation(); // Verhindert, dass der Klick das notification-Element erreicht
          callbackConfig.callback(...(callbackConfig.params || [])); // Ruft die Callback-Funktion mit den übergebenen Parametern auf
        };
        buttonGroup.appendChild(actionButton);
      }
      // autoclose this notification?
      if (callbackConfig.autoclose && (callbackConfig.autoclose > 0)) {
        // setTimeout is MilliSeconds
        setTimeout(()=>{notification.remove();}, 1000*callbackConfig.autoclose);
      }
    }

    buttonGroup.appendChild(closeButton);

    notificationContent.appendChild(buttonGroup);

    notification.appendChild(notificationContent);

    notification.onclick = function() {
      notification.remove();
    };

    if (!document.getElementById("rhsNotify")) {
      w.rhs.f.createNotificationArea();
    }
    document.getElementById("rhsNotify").appendChild(notification);
  };

  w.rhs.f.isPage = function(...pages) {
    return pages.includes(rhs.currentPage);
  };

  w.rhs.f.awaitElem = _awaitElem;
  /* ================ /basic functions=============== */

  /* ================ getter ======================== */
  w.rhs.g.baseVersion = function() {
    return GM_info.script.version;
  };
  w.rhs.g.canAppeal = function() {
    return jCopy(rhs.nominations.canAppeal);
  };
  w.rhs.g.curentPage = function() {
    return jCopy(rhs.currentPage);
  };
  w.rhs.g.edit = function() {
    return jCopy(rhs.edit);
  };
  w.rhs.g.isMobile = function() {
    return _isMobile;
  };
  w.rhs.g.messages = function() {
    return jCopy(rhs.messages);
  };
  w.rhs.g.nominationDetail = function() {
    return jCopy(rhs.nominations.detail);
  };
  w.rhs.g.nominationsList = function() {
    return jCopy(rhs.nominations.list);
  };
  w.rhs.g.profile = function() {
    return jCopy(rhs.profile);
  };
  w.rhs.g.properties = function() {
    return jCopy(rhs.properties);
  };
  w.rhs.g.reviewAppeal = function() {
    return jCopy(rhs.review.appeal);
  };
  w.rhs.g.reviewDecision = function() {
    return jCopy(rhs.review.decision);
  };
  w.rhs.g.reviewPageData = function() {
    return jCopy(rhs.review.pageData);
  };
  w.rhs.g.settings = function() {
    return jCopy(rhs.settings);
  };
  w.rhs.g.showcase = function() {
    return jCopy(rhs.showcase);
  };
  w.rhs.g.userId = new Promise((resolve, reject) => {
    getUserId().then((userID) => {
      resolve(userID);
    })
      .catch((e) => {
        console.warn(GM_info.script.name, ": ", e);
        reject();
      });
  });
  w.rhs.g.wfPages = function() {
    return jCopy(rhs.OPR_PAGES);
  };
  w.rhs.g.wfVersion = function() {
    return jCopy(rhs.version);
  };
  /* ================ /getter ======================= */

  /* ================ setter ======================== */
  w.rhs.s.callback = function(what, func) {
    switch (what) {
      case "showcaseclick":
        w.addEventListener("showcaseclick", func);
        break;
    }
  };
  /* ================ /setter ======================= */

  // make objects immutable
  Object.freeze(w.rhs.f);
  Object.freeze(w.rhs.g);
  Object.freeze(w.rhs.s);
  Object.freeze(w.rhs);

  if (document.location.pathname !== loginPath ) {
    w.rhs.f.addCSS(myCssId, myStyle);
    w.rhs.f.createNotificationArea();
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
