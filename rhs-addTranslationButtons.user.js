// ==UserScript==
// @name           RHS - Add Translation Buttons
// @version        1.0.0
// @description    Adds a button to translate the text associated with a wayspot
// @author         AlterTobi
// @match          https://opr.ingress.com/*
// @match          https://www.deepl.com/*
// @match          https://translate.kagi.com/*
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/rhs-addTranslationButtons.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/rhs-addTranslationButtons.meta.js
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
  const sessvarMiss = "warnBase";

  const ORIGIN_OPR = "https://opr.ingress.com";
  const ORIGIN_DEEPL = "https://www.deepl.com";
  const ORIGIN_KAGI = "https://translate.kagi.com";

  // ----- BEGIN - the OPR part ------
  const myCSSId = "rhsTranslateCSS";
  const myStyle = `.rhsTranslate {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .dark .rhsTranslate {
      color: #ddd;
    }
    .rhsTranslate select {
        margin-bottom: 0.2em; /* Abstand zwischen Dropdown und Button */
        background-color: inherit; /* firefox macht sonst grau */
    }
    .rhsTranslateButton {
        display: block; /* Button wird unterhalb des Selects angezeigt */
        text-decoration: none;
        color: #20B8E3;
        margin: 0 auto;
    }
    .dark .rhsTranslate select,
    .dark .rhsTranslate option {
        background: #000;
    }`;

  const engines ={
    Google: {
      name: "Google",
      title: "Google translate",
      url: "https://translate.google.com/?sl=auto&q=",
      target: "rhsTranslateGoogle",
      twindow: null
    },
    Deepl: {
      name: "Deepl",
      title: "DeepL translate",
      url: "https://www.deepl.com/translator#auto/"+navigator.language+"/",
      target: "rhsTranslateDeepl",
      twindow: null,
      origin: ORIGIN_DEEPL,
      ready: false,
      pendingText: null
    },
    Kagi: {name: "Kagi",
      title: "Kagi translate",
      url: "https://translate.kagi.com/?from=auto&to="+navigator.language+"&text=",
      target: "rhsTranslateKagi",
      twindow: null,
      origin: ORIGIN_KAGI,
      ready: false,
      pendingText: null
    }
  };

  const buttonID = "rhsTranslateButton";
  const storageName = "rhs_translateEngine";
  let currentEngine;

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  // prüfen, ob Fenster noch offen ist und bei Schließen Callback aufrufen
  function watchWindow(win, onClose) {
    const interval = setInterval(() => {
      if (!win || win.closed) {
        clearInterval(interval);
        onClose();
      }
    }, 1000); // alle 1 Sekunde prüfen
  }

  function sendTextToTranslateWindow(fenster, text, origin) {
    try {
      fenster.postMessage({
        type: "translate",
        payload: text
      }, origin);
    } catch (e) {
      console.warn("Nachricht konnte nicht gesendet werden:", e.message);
    }
  }

  function onTranslateButtonClick(text) {
    const engine = engines[currentEngine];
    const target = engine.target;

    // Google und Deepl unterscheiden
    switch(currentEngine) {
      case "Google": {
        const url = engine.url + encodeURIComponent(text);
        // fenster per Link öffnen
        if (engine.twindow && !engine.twindow.closed) {
          engine.twindow.location.href = url;
        } else {
          engine.twindow = window.open(url, target); // neues Tab/Fenster
        }
        break;
      }
      case "Deepl":
      case "Kagi":
        // fenster öffnen und nachricht senden
        if (engine.twindow && !engine.twindow.closed) {
          engine.twindow.focus();
          if (engine.ready) {
            sendTextToTranslateWindow(engine.twindow, text, engine.origin);
          } else {
            engine.pendingText = text;
          }
        } else {
          engine.ready = false;
          engine.pendingText = text;
          engine.twindow = window.open(engine.url, target);

          watchWindow(engine.twindow, () => {
            console.log(engine.name, "Übersetzungsfenster wurde geschlossen.");
            engine.twindow = null;
            engine.ready = false;
            engine.pendingText = null;
          });
        }
        break;
      default:
        console.warn("unbekannte Engine:", currentEngine, "not handeled");
    }
  }

  function createButton(text) {
    w.rhs.f.awaitElem("wf-logo").then(elem => {
      // remove if exist
      removeButton();
      const div = document.createElement("div");
      div.className = "rhsTranslate";
      div.id = buttonID;

      const select = document.createElement("select");
      select.title = "Select translation engine";

      for (const engineName of Object.keys(engines)) {
        const engine = engines[engineName];
        const option = document.createElement("option");
        option.value = engine.name;

        if (engine.name === currentEngine) {
          option.setAttribute("selected", "true");
        }

        option.innerText = engine.title;
        select.appendChild(option);
      }

      select.addEventListener("change", function() {
        currentEngine = select.value;
        w.rhs.f.localSave(storageName, currentEngine);
      });

      const button = document.createElement("button");
      button.title = "Translate nomination";
      button.className = "rhsTranslateButton";
      button.innerHTML = '<span class="material-icons">translate</span>';
      button.addEventListener("click", function() {
        onTranslateButtonClick(text);
      });

      div.appendChild(select);
      div.appendChild(button);

      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch((e) => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  function addTranslationButtonsNew() {
    const candidate = w.rhs.g.reviewPageData();

    let allText = candidate.title + "\n\n";
    allText += candidate.description + "\n\n";

    if (candidate.supportingImageUrl) {
      allText += candidate.statement;
    }
    createButton(allText);
  }

  function addTranslationButtonsEdit( ) {
    const candidate = w.rhs.g.reviewPageData();
    const edit = w.rhs.g.edit();
    let allText = "";

    // has title
    if (candidate.title) {
      allText += candidate.title + "\n\n";
    }

    // is title-edit
    if (edit.what.title) {
      for (let i = 0; i < candidate.titleEdits.length; i++) {
        allText += candidate.titleEdits[i].value + "\n\n";
      }
    }

    // has description
    if (candidate.description) {
      allText += candidate.description + "\n\n";
    }

    // is description-edit
    if (edit.what.description) {
      for (let i = 0; i < candidate.descriptionEdits.length; i++) {
        const value = candidate.descriptionEdits[i].value;
        if (value) {
          allText += value + "\n\n";
        }
      }
    }
    createButton(allText);
  }

  function addTranslationButtonsPhoto() {
    const candidate = w.rhs.g.reviewPageData();
    let allText = "";
    if(candidate.title) {
      allText += candidate.title + "\n\n";
    }

    if(candidate.description) {
      allText += candidate.description;
    }
    createButton(allText);
  }

  // add translation to Showcase (debug translations without loading a nomination)
  function addTranslationButtonsShowcase() {
    const candidate = w.rhs.g.showcase().list[0];
    let allText = "";
    if(candidate.title) {
      allText += candidate.title + "\n\n";
    }

    if(candidate.description) {
      allText += candidate.description;
    }
    createButton(allText);
  }
  // handle Swipe or Click through Showcase candidates
  function showCaseClick() {
    const candidate = w.rhs.g.showcase().current;
    let allText = "";
    if(candidate.title) {
      allText += candidate.title + "\n\n";
    }

    if(candidate.description) {
      allText += candidate.description;
    }
    createButton(allText);
  }

  function pageLoad() {
    const PAGES = w.rhs.g.wfPages(); // load constants
    if (!w.rhs.f.isPage(PAGES.HOME, PAGES.REVIEW)) {
      removeButton();
    }
  }

  function initOPR() {
    w.addEventListener("OPRReviewPageNewLoaded", addTranslationButtonsNew);
    w.addEventListener("OPRReviewPageEditLoaded", addTranslationButtonsEdit);
    w.addEventListener("OPRReviewPagePhotoLoaded", addTranslationButtonsPhoto);
    w.addEventListener("OPRReviewDecisionSent", removeButton);
    w.addEventListener("OPRHomePageLoaded", addTranslationButtonsShowcase);
    w.addEventListener("OPRShowCaseClick", showCaseClick);
    w.addEventListener("OPRPageLoaded", pageLoad);
    w.addEventListener("OPRNominationListLoaded", removeButton);

    w.rhs.f.addCSS(myCSSId, myStyle);
    w.rhs.f.localGet(storageName, "Deepl").then(e => {
      currentEngine = e;
    });

    // ready-Handler, Rückmeldung beim erstmaligen Öffnen eines Übersetzungsfensters
    window.addEventListener("message", (event) => {
      for (const key in engines) {
        const engine = engines[key];
        const expectedType = engine.name + "-ready";
        if (event.data?.type === expectedType) {
          engine.ready = true;
          if (engine.twindow && !engine.twindow.closed && engine.pendingText) {
            sendTextToTranslateWindow(engine.twindow, engine.pendingText, engine.origin);
            engine.pendingText = null;
          }
        }
      }
    });

  }
  // ----- END - the OPR part ------

  // common functions (can't use rhs functions in translation windows)
  function awaitElem(selector, maxWaitTime = 5000) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const checkForElement = () => {
        const elem = document.querySelector(selector);
        if (elem) {
          resolve(elem);
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(new Error(`Timeout waiting for element with selector ${selector} after ${maxWaitTime/1000} seconds`));
        } else {
          setTimeout(checkForElement, 200);
        }
      };
      checkForElement();
    });
  }

  // ----- BEGIN - the Deepl part ------
  const deeplInputArea = 'd-textarea[name="source"] div[contenteditable="true"]';

  function initD() {
    awaitElem(deeplInputArea)
      .then( () => {
        console.log("readyCheck -> post");
        window.opener?.postMessage({ type: "Deepl-ready" }, ORIGIN_OPR);
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    function escapeHTML(str) {
      return str.replace(/[&<>"']/g, (char) => {
        const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return escapeMap[char];
      });
    }

    function setDeepLText(text) {
      awaitElem(deeplInputArea)
        .then( elem => {
          const sanitizedText = escapeHTML(text).replace(/\n/g, "<br>");
          elem.innerHTML = `<p>${sanitizedText}</p>`;
          // DeepL über Änderungen informieren
          elem.dispatchEvent(new InputEvent("input", { bubbles: true }));
        })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }

    w.addEventListener("message", (event) => {
      const msg = event.data;

      if ("translate" === msg?.type && "string" === typeof msg.payload) {
        console.log("DeepL: Text erhalten:", msg.payload);
        setDeepLText(msg.payload);
      }
    });
  }
  // ----- END - the Deepl part ------

  // ----- BEGIN - the Kagi part ------
  const kagiInputArea = "textarea";

  function initK() {
    awaitElem(kagiInputArea)
      .then( () => {
        console.log("readyCheck -> post");
        window.opener?.postMessage({ type: "Kagi-ready" }, ORIGIN_OPR);
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    function setKagiText(text) {
      awaitElem(kagiInputArea)
        .then( elem => {
          elem.value = text;
          elem.dispatchEvent(new InputEvent("input", { bubbles: true }));
        })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }

    w.addEventListener("message", (event) => {
      const msg = event.data;
      if ("translate" === msg?.type && "string" === typeof msg.payload) {
        console.log("Kagi: Text erhalten:", msg.payload);
        setKagiText(msg.payload);
      }
    });
  }
  // ----- END - the Kagi part ------

  // ----- BEGIN - general instructions ------
  switch(window.origin) {
    case ORIGIN_OPR:
      // console.log("Init Script loading:", GM_info.script.name, " - OPR");
      if("undefined" === typeof(rhs)) {
        if (undefined === sessionStorage[sessvarMiss]) {
          sessionStorage[sessvarMiss] = 1;
          alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
          console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
        }
      } else {
        initOPR();
      }
      break;
    case ORIGIN_DEEPL:
      // console.log("Init Script loading:", GM_info.script.name, " - Deepl");
      initD();
      break;
    case ORIGIN_KAGI:
      // console.log("Init Script loading:", GM_info.script.name, " - Kagi");
      initK();
      break;
    default:
      console.warn("unknown origin", window.origin, "not handled");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
