// @name        Expire Timer
// @version     0.0.2
// @description Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author      MrJPGames / AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const sessvarMiss = "warnBase";
  const myCSSId = "rhsExpireCSS";
  const myStyle = `.rhsExpire {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: flex;
      align-items: center;
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
    w.rhs.f.awaitElem("wf-logo").then(elem=>{
      const div = document.createElement("div");
      div.className = "rhsExpire";
      div.id = buttonID;
      const expireTimer = document.createElement("span");
      expireTimer.appendChild(document.createTextNode(message));
      div.appendChild(expireTimer);
      timeElem = document.createElement("div");
      timeElem.appendChild(document.createTextNode("??:??"));
      timeElem.style.display = "inline-block";
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
