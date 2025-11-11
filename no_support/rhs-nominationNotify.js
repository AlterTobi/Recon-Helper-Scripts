// @name         Nomination Notify
// @version      0.0.1
// @description  show nomination status updates
// @author       AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const lStoreList = "rhsNomList";
  const lStoreVersion = "rhsNomListVersion";
  const lCanAppeal = "rhs_CurrentAppealState";
  const states = ["ACCEPTED", "REJECTED", "VOTING", "DUPLICATE", "WITHDRAWN", "NOMINATED", "APPEALED", "NIANTIC_REVIEW", "HELD"];
  const noHeldMsgDays = 42;
  const searchBarSel = "app-submissions app-submissions-search > div > input";

  function getCurrentDateStr() {
    return new Date().toISOString()
      .substr(0, 10);
  }

  function getDateDiff(date) {
    const today = new Date();
    const targetDate = new Date(date);
    const timeDiff = Math.abs(today.getTime() - targetDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

  function checkAppeal() {
    const canAppeal = w.rhs.g.canAppeal();
    w.rhs.f.localGet(lCanAppeal, false).then((savedState)=>{
      if (!savedState) {
        if(canAppeal) {
          w.rhs.f.createNotification("new Appeal available", "red");
          w.rhs.f.localSave(lCanAppeal, true);
        }
      } else if(!canAppeal) {
        w.rhs.f.localSave(lCanAppeal, false);
      }
    });
  }

  function checkNomListVersion() {
    w.rhs.f.localGet(lStoreVersion, 0).then((version) => {
      if (version < 1) {
        console.warn("NomListVersion less then 1, converting");
        // convert Dates
        w.rhs.f.localGet(lStoreList, []).then((historyDict) => {
          let myDates;
          // only if we have any saved data
          for (const histID in historyDict) {
            myDates = [];
            for (const dat in historyDict[histID].Dates) {
              myDates.push([historyDict[histID].Dates[dat], dat]);
            }
            historyDict[histID].rhsDates = myDates;
            delete historyDict[histID].Dates;
          }
          w.rhs.f.localSave(lStoreList, historyDict);
          w.rhs.f.localSave(lStoreVersion, 1);
        });
      }
    });
  }

  const detectMissing = () => new Promise((resolve, reject) => {
    // check if saved nomination is not in current list
    // might be in review by Niantic staff
    const nomDict = w.rhs.f.makeIDbasedDictionary(w.rhs.g.nominationsList());
    w.rhs.f.localGet(lStoreList, []).then((historyDict)=>{
      const today = getCurrentDateStr();
      const missingDict = {};
      let miss = {};

      for (const histID in historyDict) {
        if (undefined === nomDict[histID]) {
          // missing
          miss = historyDict[histID];
          if ((miss.status !== "MISSING")) {
            miss.rhsDates.push([today, "MISSING"]);
            miss.status = "MISSING";
            w.rhs.f.createNotification(`${miss.title} is missing`, "red");
          }
          missingDict[histID] = miss;
        }
      }
      resolve(missingDict);
    })
      .catch(()=>{reject();});
  });

  function searchSubmission(title) {
    const event = new Event("input", { bubbles: true, cancelable: true });
    w.rhs.f.awaitElem(searchBarSel).then(
      elem => {
        elem.value = title;
        elem.dispatchEvent(event);
      }
    )
      .catch(()=>{console.warn("searchbar not found");});
  }

  function detectChange() {
    const nomList = w.rhs.g.nominationsList();
    w.rhs.f.localGet(lStoreList, []).then((historyDict)=>{
      if ( 0 === historyDict.length) {
        // first run, save
        w.rhs.f.localSave(lStoreList, w.rhs.f.makeIDbasedDictionary(nomList));
      }else{
        // Only makes sense to look for change if we have data
        // of the previous state!
        const today = getCurrentDateStr();
        let myDates, historicalData, nom;

        for (let i = 0; i < nomList.length; i++) {
          nom = nomList[i];

          // find title
          const _title = nom.poiData?.title || nom.title;

          nom.title = _title;

          // prepare callback for createNotification()
          const callbackConfig = {
            callback: searchSubmission,
            params: [nom.title],
            icon: "search"
          };

          // set title for notification
          const notiTitle = nom.type + ": " + nom.title;

          historicalData = historyDict[nom.id];
          myDates = [];

          // detect unknown states
          if (!states.includes(nom.status)) {
            w.rhs.f.createNotification(`${notiTitle} has unknown state: ${nom.status}`, "blue", callbackConfig);
          }

          if (undefined === historicalData) {
            myDates.push([today, nom.status]); // save current date and
            // status
            nom.rhsDates = myDates;
            continue; // Skip to next as this is a brand new
            // entry so we don't know it's previous
            // status
          } else if (undefined !== historicalData.rhsDates) {
            // get saved dates - if they exist
            myDates = historicalData.rhsDates;
          }

          // upgrade?
          if (false === historicalData.upgraded && true === nom.upgraded) {
            myDates.push([today, "UPGRADE"]);
            w.rhs.f.createNotification(`${notiTitle} was upgraded!`, "green", callbackConfig);
          }

          // Niantic Review?
          if ((false === historicalData.isNianticControlled && true === nom.isNianticControlled)
          || (( "NIANTIC_REVIEW"!== historicalData.status) && ("NIANTIC_REVIEW" === nom.status))) {
            w.rhs.f.createNotification(`${notiTitle} went into Niantic review!`, "fuchsia", callbackConfig);
          }

          // was missing?
          if (("MISSING" === historicalData.status)) {
            w.rhs.f.createNotification(`${notiTitle} returned`, "orange", callbackConfig);
          }
          // In queue -> In voting
          if ((historicalData.status !== "VOTING") && ("VOTING" === nom.status)) {
            w.rhs.f.createNotification(`${notiTitle} went into voting!`, "green", callbackConfig);
          } else if ((historicalData.status !== "HELD") && ("HELD" === nom.status)) {
            // only if nomination is "old"
            if (getDateDiff(nom.day) > noHeldMsgDays) {
              w.rhs.f.createNotification(`${notiTitle} put on HOLD!`, "red", callbackConfig);
            }
          } else if ((historicalData.status !== "APPEALED") && ("APPEALED" === nom.status)) {
            w.rhs.f.createNotification(`${notiTitle} was appealed!`, "green", callbackConfig);
          } else if (historicalData.status !== "ACCEPTED" && historicalData.status !== "REJECTED" && historicalData.status !== "DUPLICATE") {
            if ("ACCEPTED" === nom.status) {
              w.rhs.f.createNotification(`${notiTitle} was accepted!`, "green", callbackConfig);
            }else if("REJECTED" === nom.status) {
              w.rhs.f.createNotification(`${notiTitle} was rejected!`, "red", callbackConfig);
            }else if("DUPLICATE" === nom.status) {
              w.rhs.f.createNotification(`${notiTitle} was marked as a duplicate!`, "", callbackConfig);
            }
          }

          // save Date if state changes
          if (historicalData.status !== nom.status) {
            myDates.push([today, nom.status]);
          }

          nom.rhsDates = myDates;
          nomList[i] = nom;
        }

        // Store the new state
        const nomDict = w.rhs.f.makeIDbasedDictionary(nomList);
        detectMissing().then((missingDict)=>{
          const fullDict = Object.assign(nomDict, missingDict);
          w.rhs.f.localSave(lStoreList, fullDict);
        });
      }
    });
  }

  function NominationPageLoaded() {
    checkNomListVersion();
    detectChange();
    checkAppeal();
  }

  function NominationSelected() {
    const nomDetail = w.rhs.g.nominationDetail();
    const myID = nomDetail.id;
    w.rhs.f.localGet(lStoreList, []).then((historyDict)=>{
      const myDates = historyDict[myID].rhsDates || [];
      const elem = document.querySelector("div.card.details-pane > div.flex.flex-row > span");
      // Inhalt entfernen
      while (elem.childNodes.length > 0) {
        elem.removeChild(elem.firstChild);
      }
      elem.appendChild(document.createTextNode(""));
      let p = document.createElement("p");
      p.appendChild(document.createTextNode(nomDetail.day + " - NOMINATED"));
      elem.appendChild(p);
      for ( let i = 0; i < myDates.length; i++) {
        if ((0 === i ) && ("NOMINATED" === myDates[i][1])) {
          continue;
        }
        p = document.createElement("p");
        p.appendChild(document.createTextNode(myDates[i][0] + " - " + myDates[i][1]));
        elem.appendChild(p);
      }
    });
  }

  let loadNomTimerId = null;
  if (w.rhs.f.hasMinVersion("1.5.1")) {
    w.addEventListener("OPRNominationListLoaded",
      () => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded, 250);});
  } else {
    alert(GM_info.script.name + ": Need at least rhs-Base version 1.5.1. Please upgrade.");
  }

  w.addEventListener("OPRNominationDetailLoaded", () => {setTimeout(NominationSelected, 10);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
