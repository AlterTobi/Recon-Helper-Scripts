// @name Review Improve CSS
// @version 0.0.3
// @description CSS modifcations for OPR
// @author AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const sessvarMiss = "warnBase";
  const baseMinVersion = "0.0.1";
  const reorder_thumbs = true;

  const myCssId = "rICSS";
  const myStyle = `
    .wf-review-card__header { padding: 0.5rem; }
    .wf-review-card__body { margin-bottom: 0.5rem !important; }
    .wf-review-card__footer { padding-bottom: 0.25rem !important; }
    .py-2 { padding-top: 0 !important;  padding-bottom: 0 !important;  margin-bottom: 0.3rem; }
    .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .rhs-mh100p { min-height: 100%; }
    .rhs-h490 { min-height: 490px; }
    .rhs-h725 { min-height: 725px; }
    .rhs-none { display: none; }
    .rhs-text-4xl { font-size: 1.9rem !important; line-height: 1.8rem !important; }
    .rhs-text-lg { line-height: 1.5rem !important; font-size: 1.1rem !important; }
    .rhs-h4 { font-size:1.5rem; line-height:1.2rem; padding-bottom:0.5rem; }
    .rhs-card__header { margin-top:-0.5rem; margin-bottom: -1.0rem; }
    .rhs-fit-content { max-width: fit-content; }
    .rhs-pad05 { padding: 0.5rem !important; }
    .rhs-smallgap { gap: 1rem 0 !important; }
    .rhs-photo { max-height: 350px !important; width: auto !important; }
    .rhs-btnrigth { justify-content: end !important; gap: 0 0.5rem; }
    .o1 { order: 1;}
    .o2 { order: 2;}
    .o3 { order: 3;}
    .bg_red { background-color: #f7c3c3;}
    .bg_green { background-color: #b1ffb1;}
    div.question-title.mb-1 { font-size: 1.25rem !important; line-height: 1.2rem;}
    `;
  // deaktiviert     .rhs-linebreak { line-break: auto !important; }

  // CSS by Alfonso-ML, posted on WDD
  const alCssID = "rhs-alfonso";
  const alStyle = `
    .review-new > div:nth-child(1)  > * {
      flex-basis: 32%;
    }
    .review-new > div:nth-child(1) {
      flex-direction: row !important;
      grid-column: span 4;
      display: flex;
      flex-wrap: wrap;
      gap: 0 0.2rem;
      justify-content: space-between;
    }
    `;

  const cardSelectors = ["app-photo-b > wf-review-card-b", "app-title-and-description-b > wf-review-card", "app-supporting-info-b > wf-review-card-b"];
  const dupeSelector = "#check-duplicates-card";
  const titleSelector = "#title-description-card > div.wf-review-card__body > div > a > div";
  const descriptionSelector = "#title-description-card > div.wf-review-card__body > div > div";
  const ccategorySelector = "app-review-categorization-b > wf-review-card > div.wf-review-card__header > div:nth-child(1) > h4";
  const displayNoneSelectors = ["app-review-new-b > div > div:nth-child(1) > h4",
    "app-review-new-b > div > div:nth-child(1) > p",
    "app-review-new-b > div > div:nth-child(2) > h4",
    "app-review-new-b > div > div:nth-child(2) > p"];
  //  const supportTextSel = "app-supporting-info-b > wf-review-card-b div.supporting-info-statement";
  const qCardsSel = "app-question-card > div";
  const qCardsBtnSel = "app-question-card button.dont-know-button";
  const questionSel = "app-review-new-b > div > div.review-questions";
  const mapSel = "app-review-new-b > div > div.review-questions";
  const photoSel = "app-photo-b > wf-review-card-b div.wf-image-modal > img";
  const suppImgSel = "app-supporting-info-b > wf-review-card-b div.wf-image-modal.supporting-info-img-container > img";

  function reviewImproveCSS() {
    w.rhs.f.addCSS(myCssId, myStyle);
    w.rhs.f.addCSS(alCssID, alStyle);

    cardSelectors.forEach(selector => {
      w.rhs.f.awaitElem(selector).then((elem)=>{elem.classList.add("rhs-mh100p");})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
      // remove description texts
      const seltext = selector + " > div.wf-review-card__header > div:nth-child(1) > div";
      w.rhs.f.awaitElem(seltext).then((elem)=>{elem.classList.add("rhs-none");})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });
    w.rhs.f.awaitElem(dupeSelector).then((elem)=>{elem.classList.add("rhs-h725");})
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    // smaller font site for title and description
    w.rhs.f.awaitElem(titleSelector).then((elem)=>{elem.classList.add("rhs-text-4xl");})
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    w.rhs.f.awaitElem(descriptionSelector).then((elem)=>{elem.classList.add("rhs-text-lg");})
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    // remove card headers and descriptions
    displayNoneSelectors.forEach(selector => {
      w.rhs.f.awaitElem(selector).then((elem)=>{elem.classList.add("rhs-none");})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });

    // "komische" Zelenumbrüche im Supporttext entfernen
    /*
    const pagedata = w.rhs.g.reviewPageData();
    if (pagedata.statement.length < 256) {
      // bei langen text gibt es den Unsinn nicht
      w.rhs.f.awaitElem(supportTextSel)
        .then((elem)=>{ elem.classList.add("rhs-linebreak");} )
        .catch((e) => { console.warn(GM_info.script.name, "- support statement ", e); });
    }
    */

    // bilder etwas kleiner und zentriert
    w.rhs.f.awaitElem(photoSel).then((elem) => {
      elem.classList.add("rhs-photo");
      elem.parentElement.setAttribute("style", "justify-content: center; display: flex;");
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    w.rhs.f.awaitElem(suppImgSel).then((elem) => {elem.classList.add("rhs-photo");})
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    // make all H4 smaller, wait for last box first
    w.rhs.f.awaitElem(ccategorySelector).then(()=>{
      const headerlist = document.querySelectorAll(".wf-review-card__header");
      headerlist.forEach(elem =>{elem.classList.add("rhs-card__header");});
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    // question cards mit kleinerem Rand
    w.rhs.f.awaitElem(questionSel).then(()=>{
      const qCardList = document.querySelectorAll(qCardsSel);
      qCardList.forEach(elem =>{
        elem.classList.remove("p-4");
        elem.classList.add("rhs-pad05");
      });
      const qCardBtnList = document.querySelectorAll(qCardsBtnSel);
      qCardBtnList.forEach(elem =>{
        elem.classList.add("rhs-pad05");
      });

      // buttons umsortieren
      let buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row");
      buttonList.forEach(elem => {elem.classList.add("rhs-btnrigth");});
      if (reorder_thumbs) {
        buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > button:nth-child(1)");
        buttonList.forEach(elem => {elem.classList.add("o3"); elem.classList.add("bg_green");});
        buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > button:nth-child(2)");
        buttonList.forEach(elem => {elem.classList.add("o2"); elem.classList.add("bg_red");});
        buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > div");
        buttonList.forEach(elem => {elem.classList.add("o1");});
      }
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    // reorder main cards
    w.rhs.f.awaitElem("app-title-and-description-b")
      .then(elem=>{elem.classList.add("o2");})
      .catch((e) => { console.warn(GM_info.script.name, "- reorder title ", e); });

    w.rhs.f.awaitElem("app-photo-b")
      .then(elem=>{elem.classList.add("o1"); elem.style.setProperty("margin-left", "0", "important");})
      .catch((e) => { console.warn(GM_info.script.name, "- reorder photo ", e); });

    w.rhs.f.awaitElem("app-supporting-info-b")
      .then(elem=>{elem.classList.add("o3"); elem.style.setProperty("margin-left", "0", "important");})
      .catch((e) => { console.warn(GM_info.script.name, "- reorder supporting info ", e); });

    w.rhs.f.awaitElem(mapSel).then(elem => { elem.setAttribute("style", "grid-column: span 4;"); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    w.rhs.f.awaitElem("app-review-new-b > div").then(elem => { elem.classList.add("rhs-smallgap"); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  function editImproveCSS() {
    // const abuseSelector = "div.report-abuse";
    const mapSelector = "app-select-location-edit > wf-review-card > div.wf-review-card__body";
    w.rhs.f.addCSS(myCssId, myStyle);

    /*
    w.rhs.f.awaitElem(abuseSelector).then((elem)=>{
      elem.classList.add("rhs-fit-content");
      elem.classList.add("wf-button");
    });
    */
    const edit = w.rhs.g.edit();
    if (edit.isEdit && edit.what.location) {
      w.rhs.f.awaitElem(mapSelector)
        .then((elem)=>{ elem.classList.add("rhs-h490"); })
        .catch((e) => { console.warn(GM_info.script.name, ": ", e); });
    }

  }

  function init() {
    w.addEventListener("OPRReviewPageNewLoaded", reviewImproveCSS);
    w.addEventListener("OPRReviewPageEditLoaded", editImproveCSS);
  }

  init();

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
    console.warn(GM_info.script.name, "Need at least rhs-base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
