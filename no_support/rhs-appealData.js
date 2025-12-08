// @name         Appeal Data
// @version      0.0.1
// @description  save and show appeal your statements
// @author       AlterTobi

// obsolete in OPR?
(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const sessvarMiss = "warnBase";
  const baseMinVersion = "0.0.1";
  const lStoreList = "rhs_AppealData";
  const warnFlag = "rhs_AppealData_warn";
  const myID = "nominationAppealData";
  const nominationSelector = "app-details-pane > div > div > div > div.flex.flex-row.justify-between";

  function warnOnce() {
    w.rhs.f.localGet(warnFlag, false).then((warn)=>{
      if(warn) {
        return(false);
      } else {
        const msg = Array(GM_info.script.name + ":",
          "Wayfarer now handles appeal statements. This script still saves data, but will not show it in the future (as long as Wayfarer does this) ",
          "Maybe you want to disable the script?"
        );
        w.rhs.f.createNotification(msg, "fuchsia");
        w.rhs.f.localSave(warnFlag, true);
        return(true);
      }
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    return(false);
  }

  function storeAppealData() {
    const appeal = w.rhs.g.reviewAppeal();
    // console.log(GM_info.script.name, ": storeAppealData()");
    // console.dir(appeal);
    w.rhs.f.localGet(lStoreList, {}).then((appealHistory)=>{
      appealHistory[appeal.id] = appeal.statement;
      w.rhs.f.localSave(lStoreList, appealHistory)
        // .then(() => { console.log(GM_info.script.name, ": ", "appeal data saved for:", appeal.id);})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }


  function NominationSelected() {
    const myElem = document.getElementById(myID);
    // remove if there
    if (myElem) { myElem.remove();}

    const nom = w.rhs.g.nominationDetail();
    w.rhs.f.localGet(lStoreList, {}).then((appealHistory)=>{
      if (nom.id in appealHistory) {
        w.rhs.f.awaitElem(nominationSelector)
          .then(elem => {
            const h5 = document.createElement("h5");
            h5.appendChild(document.createTextNode("Appeal Statement"));
            h5.setAttribute("class", "rhsBold");
            h5.style.fontWeight = "bold";

            const textDiv = document.createElement("div");
            // Ersetze Zeilenumbrüche durch <br>, sanitize text
            const safeText = appealHistory[nom.id].split("\n").map(line => {
              const div = document.createElement("div");
              div.textContent = line;
              return div.innerHTML;
            })
              .join("<br>");

            textDiv.innerHTML = safeText;

            const appealDiv = document.createElement("div");
            appealDiv.setAttribute("class", "ng-star-inserted");
            appealDiv.setAttribute("id", myID);
            appealDiv.style.marginBottom = "1em";
            appealDiv.appendChild(h5);
            appealDiv.appendChild(textDiv);

            elem.insertAdjacentElement("beforeBegin", appealDiv);
          })
          .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
      }
    }
    )
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

  }

  const init = () => {
    w.addEventListener("OPRReviewAppealSent", storeAppealData);
    // Wayfarer 5.24 shows user statement, no need to display duplicate content
    if (warnOnce()) {w.addEventListener("OPRNominationDetailLoaded", NominationSelected);}
  };

  // === no changes needed below this line ======================
  if("undefined" === typeof(rhs)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
      console.error("Missing RHS Base. Please install from https://altertobi.github.io/Recon-Helper-Scripts/");
    }
  } else if (w.rhs.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    console.warn(GM_info.script.name, "Need at least rhs-Base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);

})();
