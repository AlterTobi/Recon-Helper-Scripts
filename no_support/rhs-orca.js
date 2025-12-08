// @name         ORCa
// @version      1.0.0
// @description  ORCa
// @author       AlterTobi
// @resource     orca https://altertobi.github.io/Recon-Helper-Scripts/images/orca.png
// @grant        GM_getResourceURL

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const myCssId = "rhsORCaCSS";
  const myStyle = `.rhsORC {
      color: #333;
      margin-left: 2em;
      text-align: center;
      display: block;
    }
    `;

  const sessvarMiss = "warnBase";
  const acceptBtnList = ["#appropriate-card", "#safe-card", "#accurate-and-high-quality-card", "#permanent-location-card"];
  const rejectBtnList = ["#socialize-card", "#exercise-card", "#explore-card"];
  const categoriesSel = "#categorization-card > div.wf-review-card__body > div > mat-button-toggle-group > mat-button-toggle:nth-child(2) > button";
  const buttonID = "orcaButton";

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  function orcaClick() {
    // die ersten 4 Daumen hoch
    acceptBtnList.forEach(sel => {
      const fulSel = sel + "> div > div.action-buttons-row > button:nth-child(1)";
      w.rhs.f.awaitElem(fulSel).then((elem) => {elem.click();})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });
    // die nächsten 3 Daumen runter
    rejectBtnList.forEach(sel => {
      const fulSel = sel + "> div > div.action-buttons-row > button:nth-child(2)";
      w.rhs.f.awaitElem(fulSel).then((elem) => {elem.click();})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });

    // alle Kategorien abwählen
    const noBtnsList = document.querySelectorAll(categoriesSel);
    noBtnsList.forEach(elem => {elem.click();});
  }


  function createButton() {
    removeButton(); // remove before creating new
    w.rhs.f.awaitElem("wf-logo").then(elem=>{
      const image = GM_getResourceURL("orca");
      const div = document.createElement("div");
      div.className = "rhsORC";
      div.id = buttonID;
      const link = document.createElement("a");
      link.title = "ORC";
      link.addEventListener("click", orcaClick);
      const img = document.createElement("img");
      img.setAttribute("style", "height: 60px;");
      img.src = image;
      link.appendChild(img);
      div.appendChild(link);
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch(e => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  function ORCa() {
    w.rhs.f.addCSS(myCssId, myStyle);
    createButton();
  }

  function init() {
    w.addEventListener("OPRReviewPageNewLoaded", ORCa);
    w.addEventListener("OPRReviewDecisionSent", removeButton);
  }

  if("undefined" === typeof(rhs)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
      console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
    }
  } else {
    init();
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();