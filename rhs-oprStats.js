// @name        OPR Stats
// @version     1.0.0
// @description save OPR statistics in local browser storage
// @author      AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const selfname = "rhs_oprStats";
  const maincount = 14;

  // define names
  const lStoreStats = selfname+"_Stats";
  const lStoreTypes = selfname+"_TypeCount";
  const lStoreCheck = selfname+"_IsChecked";
  const lStoreUpgrades = selfname+"_myUpgrades";

  const myCssId = "oprStatsCSS";
  const myStyle = `
    th { text-align: center; }
    td, th { padding: 5px; border: 1px solid; }
    td { text-align: right; }
    table { margin-top: 10px; font-family: monospace
            background-color: #2d2d2d; width: 100%; }
    #reversebox { margin: 0 10px; }
    #buttonsdiv button { margin: 0 10px; }
    #buttonsdiv, #statsdiv, #typesdiv { margin-bottom: 2em; }

    #statsdiv table, td, th { border-color: black;}
    .dark #statsdiv table, td, th {
      border-color: #ddd;
    }
  `;

  let RHSstats, oprStats, isChecked;
  const isInitialized = false;

  const body = document.getElementsByTagName("body")[0];
  const head = document.getElementsByTagName("head")[0];

  // init
  function init() {
    // get Values from localStorage
    w.rhs.f.localGet(lStoreTypes, []).then((PS)=>{
      RHSstats = PS;
      w.rhs.f.localGet(lStoreStats, []).then((wf)=>{
        oprStats = wf;
        w.rhs.f.localGet(lStoreCheck, false).then((ic)=>{
          isChecked = ic;
        });
      });
    });
  }

  function YMDfromTime(time) {
    const curdate = new Date();
    curdate.setTime(time);

    const Jahr = curdate.getFullYear().toString(),
      Monat = ("0" + ( 1 + curdate.getMonth())).slice(-2),
      Tag = ("0" + curdate.getDate()).slice(-2);

    const ymd = Tag + "." + Monat + "." + Jahr;
    return ymd;
  }

  function upgrades() {
    /* die Upgrades zählen */
    console.log(selfname + " zähle Upgrades");
    const profile = w.rhs.g.profile();
    const progress = profile.progress;
    const total = profile.total;
    let lastProgress = 0;
    let lastTotal = 0;

    w.rhs.f.localGet(lStoreUpgrades, []).then((myOPRupgrades)=>{
      if (myOPRupgrades.length > 0) {
        lastProgress = myOPRupgrades[myOPRupgrades.length-1].progress;
        lastTotal = myOPRupgrades[myOPRupgrades.length-1].total;
      }

      if ((total !== lastTotal ) || (progress !== lastProgress)) {
        const ut = new Date().getTime();
        const curstats = {"datum":ut, "progress":progress, "total":total};
        myOPRupgrades.push(curstats);
        w.rhs.f.localSave(lStoreUpgrades, myOPRupgrades);
      }
    });
  }

  function oprstats() {
    let heute, last, ut;

    // nur tun, wenn heute noch nicht und Stunde > 3
    const jetzt = new Date();
    const stunde = jetzt.getHours();

    if (stunde < 3) {
      heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()-1 );
    } else {
      heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() );
    }

    const heuteTS = heute.getTime();

    if (oprStats.length > 0) {
      last = oprStats[oprStats.length-1].datum;
    } else {
      last = 0;
    }

    if (heuteTS > last) {
      console.log(selfname + " saving stats");

      const profile = w.rhs.g.profile();

      const reviewed = profile.finished;
      const accepted = profile.accepted;
      const rejected = profile.rejected;
      const duplicated = profile.duplicated;
      let curstats;

      if ( last > 0 ) {
        // nur wenn schon gespeicherte Werte vorhanden.
        const einTag = 25*60*60*1000; // milliseconds
        // 25hours because of DST

        const letzter = new Date();
        letzter.setTime(last);
        let letzterTS = new Date(letzter.getFullYear(), letzter.getMonth(), letzter.getDate()).getTime();

        while ( (heuteTS - letzterTS) > einTag ) {
          letzterTS += einTag;
          curstats = {"datum":letzterTS, "reviewed":reviewed, "accepted":accepted, "rejected":rejected, "duplicated":duplicated};
          oprStats.push(curstats);
        }
      }

      if (stunde > 3) {
        ut = jetzt.getTime();
      } else {
        ut = heuteTS;
      }

      curstats = {"datum":ut, "reviewed":reviewed, "accepted":accepted, "rejected":rejected, "duplicated":duplicated};

      oprStats.push(curstats);
      w.rhs.f.localSave(lStoreStats, oprStats);

    } else {
      console.log("stats already saved today");
    }
  }

  function emptyPage(histText) {
    // fake history Eintrag (wegen zurückbutton)
    const stateObj = {info: "fake Chronik"};
    history.pushState(stateObj, "opr main page", histText);
    w.addEventListener("popstate", function() {
      location.reload();
    });

    isChecked = document.getElementById("reversebox").checked || false;

    // Body leeren
    body.innerHTML = null;

    // styles & Co. entfernen
    const removables = ["script", "style", "link"];
    for (const r of removables) {
      const rms = head.getElementsByTagName(r);
      while (rms.length > 0) {
        head.removeChild(rms[0]);
      }
    }

    const fav = document.createElement("link");
    fav.setAttribute("rel", "shortcut icon");
    fav.setAttribute("href", "/imgpub/favicon.ico");
    head.appendChild(fav);
  }

  /* Reviews zählen */
  function handleReview() {
    if (!isInitialized) {
      return;
    }

    const newPortalData = w.rhs.g.reviewPageData();
    const type = newPortalData.type;

    // Statistik speichern
    const jetzt = new Date();
    const curstats = {
      "datum" : jetzt.getTime(),
      "typ" : type,
      "latE6" : newPortalData.lat * 1E6,
      "lngE6" : newPortalData.lng * 1E6,
      "titel" : newPortalData.title
    };
    RHSstats.push(curstats);
    w.rhs.f.localSave(lStoreTypes, RHSstats);
  }

  function handleProfile() {
    if (!isInitialized) {
      return;
    }
    oprstats();
    upgrades();
  }

  function handleShowcase() {
    if (!isInitialized) {
      return;
    }

    const section = document.getElementsByClassName("showcase")[0];

    // --- helper functions ---
    function addDivs() {
      const cText = isChecked ? "checked" : "";
      section.insertAdjacentHTML("beforeEnd",
        '<div id="statsdiv"></div>' +
         '<div id="typesdiv"></div>' +
         '<div id="buttonsdiv" class="pull-right">reverse: <input type="checkbox" id="reversebox" ' + cText + "/>" +
         '<button class="button-primary" id="OPRStatsBtn">show my stats</button>'+
         '<button class="button-primary" id="OPRSUpgrBtn">show my upgrades</button>' +
         "</div>"
      );
    }

    function showStatsTable() {
      // Stats - Tabelle

      const end = Math.max(0, oprStats.length - maincount);
      const week = Math.min(7, oprStats.length - 1);

      // Tabelle für die Statistik
      document.getElementById("statsdiv").insertAdjacentHTML("beforeEnd", '<table border="2"><thead><tr><th></th><th colspan="5">total</th><th colspan="5">yesterday</th><th colspan="5">last ' + week + " days (sliding window)</th></tr>"+
        '<tr style="border-bottom: 1px solid;"><th>date</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th></tr></thead>'+
        '<tbody id="statstablebody"></tbody></table>');
      const innertable = document.getElementById("statstablebody");

      // Statistik einfügen
      let gproz, grev, gacc, grej, gdup, wproz, wrev, wacc, wrej, wdup, trev, tacc, trej, tdup;
      trev = tacc = trej = tdup = 0;

      for (let i = oprStats.length - 1; i >= end; i--) {
        const ymd = YMDfromTime(oprStats[i].datum);

        const prozent = oprStats[i].reviewed > 0 ? 100*(oprStats[i].accepted + oprStats[i].rejected + oprStats[i].duplicated)/ oprStats[i].reviewed : 0;
        if (i > 0) {
          grev = oprStats[i].reviewed - oprStats[i-1].reviewed;
          gacc = oprStats[i].accepted - oprStats[i-1].accepted;
          grej = oprStats[i].rejected - oprStats[i-1].rejected;
          gdup = oprStats[i].duplicated - oprStats[i-1].duplicated;
          gproz = grev > 0 ? (100*(gacc+grej+gdup)/grev).toFixed(2) : " -- ";
          trev += grev;
          tacc += gacc;
          trej += grej;
          tdup += gdup;
        } else {
          gproz = grev = gacc = grej = gdup = " -- ";
        }
        if (i > week-1) {
          wrev = oprStats[i].reviewed - oprStats[i-week].reviewed;
          wacc = oprStats[i].accepted - oprStats[i-week].accepted;
          wrej = oprStats[i].rejected - oprStats[i-week].rejected;
          wdup = oprStats[i].duplicated - oprStats[i-week].duplicated;
          wproz = wrev > 0 ? (100*(wacc+wrej+wdup)/wrev).toFixed(2) : " -- ";
        } else {
          wproz = wrev = wacc = wrej = wdup = " -- ";
        }
        innertable.insertAdjacentHTML("beforeEnd", "<tr><td>" + ymd +"</td><td>" + oprStats[i].reviewed + "</td><td>"+
         oprStats[i].accepted + "</td><td>" + oprStats[i].rejected + "</td><td>" + oprStats[i].duplicated + "</td><td>" + prozent.toFixed(2) + "%</td>"+
         "<td>" + grev + "</td><td>" + gacc + "</td><td>" + grej + "</td><td>" + gdup + "</td><td>(" + gproz + "%)</td>" +
         "<td>" + wrev + "</td><td>" + wacc + "</td><td>" + wrej + "</td><td>" + wdup + "</td><td>(" + wproz + "%)</td></tr>");
      }
      const tproz = trev > 0 ? (100*(tacc+trej+tdup)/trev).toFixed(2) : " -- ";
      const agr = tacc+trej+tdup;
      const aproz = agr > 0 ? (100*tacc/agr).toFixed(2) : " -- ";
      const rproz = agr > 0 ? (100*trej/agr).toFixed(2) : " -- ";
      const dproz = agr > 0 ? (100*tdup/agr).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><td colspan="6" rowspan="2"></td>'+
       "<td>" + trev + "</td><td>" + tacc + "</td><td>" + trej + "</td><td>" + tdup + "</td><td>(" + tproz + "%)</td>" +
       '<td colspan="5" rowspan="2"></td></tr>' +
       "<td></td><td>" + aproz + "%</td><td>" + rproz + "%</td><td>" + dproz + "%</td><td></td>");
    }


    function buttonFuncs() {
      // Stats
      function _writeLine(stats) {
        const dupes = "undefined" === typeof(stats.duplicated) ? "" : stats.duplicated;
        body.insertAdjacentHTML("beforeEnd", YMDfromTime(stats.datum) + ";" + stats.reviewed + ";" + stats.accepted + ";" + stats.rejected + ";" + dupes + "<br/>");
      }
      document.getElementById("OPRStatsBtn").addEventListener("click", function() {
        emptyPage("/#mystats");
        if (isChecked) {
          for (let i = oprStats.length -1; i >= 0; i--) {
            _writeLine(oprStats[i]);
          }
        } else {
          for (let i = 0; i < oprStats.length; i++) {
            _writeLine(oprStats[i]);
          }
        }
        w.rhs.f.localSave(lStoreCheck, isChecked);
      });

      // Upgrades
      document.getElementById("OPRSUpgrBtn").addEventListener("click", function() {
        emptyPage("/#myupgrades");
        w.rhs.f.localGet(lStoreUpgrades, []).then((myup)=>{
          if (isChecked) {
            for (let i = myup.length -1; i >= 0; i--) {
              body.insertAdjacentHTML("beforeEnd", myup[i].datum + ";" + myup[i].progress + ";" + myup[i].total + "<br/>");
            }
          } else {
            for (let i = 0; i < myup.length; i++) {
              body.insertAdjacentHTML("beforeEnd", myup[i].datum + ";" + myup[i].progress + ";" + myup[i].total + "<br/>");
            }
          }
          w.rhs.f.localSave(lStoreCheck, isChecked);
        });
      });
    }

    function showTypesTable() {
      const typesdiv = document.getElementById("typesdiv");
      typesdiv.insertAdjacentHTML("afterBegin",
        '<table border="2"><colgroup><col width="26%"><col width="10%"><col width="10%"><col width="10%">' +
        '<col width="10%"><col width="10%"><col width="10%"><col width="14%"></colgroup>' +
        '<thead><tr><th></th><th colspan="2">Nominations</th>' +
        '<th colspan="2">Edits</th><th colspan="2">Photo</th>' +
        "<th>total</th></tr></thead>" +
        '<tbody id="gamesTBbody"></tbody></table>');

      const innertable = document.getElementById("gamesTBbody");
      let prig, edig, phog;
      prig = edig = phog = 0;

      // Zählen
      for (let i = 0; i < RHSstats.length; i++) {
        switch (RHSstats[i].typ) {
          case "EDIT":
            edig++;
            break;
          case "NEW":
            prig++;
            break;
          case "PHOTO":
            phog++;
            break;
          default:
            console.warn(selfname + " falscher typ: " + RHSstats[i].typ);
        }
      }

      const revg = prig + edig + phog;

      // Tabelle füllen
      const prigp = revg > 0 ? (100*prig/revg).toFixed(2) : " -- ";
      const edigp = revg > 0 ? (100*edig/revg).toFixed(2) : " -- ";
      const phogp = revg > 0 ? (100*phog/revg).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><th>reviews total </th><td>'+
                         prig + "</td><td>"+prigp+"%</td><td>" + edig + "</td><td>"+edigp+"%</td><td>" + phog + "</td><td>"+phogp+"%</td><td>" + revg + "</td></tr>");

    }

    w.rhs.f.addCSS(myCssId, myStyle);

    addDivs();
    showStatsTable();
    showTypesTable();
    buttonFuncs();

  }

  /* =========== MAIN ================================ */

  // setTimeout(init, 200);
  init(); // die promises sollten es richten :-)
  // install Event Handlers
  w.addEventListener("OPRReviewPageLoaded", () => {setTimeout(handleReview, 2000);});
  w.addEventListener("OPRProfileLoaded", handleProfile);
  w.addEventListener("OPRHomePageLoaded", handleShowcase);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
