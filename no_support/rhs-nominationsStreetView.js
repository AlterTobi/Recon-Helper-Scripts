// @name         Nomination page StreetView
// @version      0.0.1
// @description  Adds the streetview view a reviewer will see on your own nominations!
// @author       AlterTobi

/* global google */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "marker" }]*/

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  let SVMap;
  let panorama = null;
  const headSelector = "mat-sidenav-content div.details-header > div > h4";

  function scrollUp() {
    // const _dom = document.querySelector("mat-sidenav-content");
    w.rhs.f.awaitElem("mat-sidenav-content").then(
      mat => {
        const _evfunc= () => {
          w.rhs.f.awaitElem(headSelector).then(
            elem => {
              elem.scrollIntoView();
              mat.removeEventListener("scroll", _evfunc);
            }
          )
            .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
        };
        mat.addEventListener("scroll", _evfunc);
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  function setStreetView() {
    // remove existing street view, free memory
    if (null !== panorama) {
      panorama.setVisible(false);
      panorama = null;
    }

    if (null === document.getElementById("pano")) {
      const lastPane = document.getElementsByClassName("details-pane__map")[0];
      if (lastPane === undefined) {
        console.log("failed to find attach elem");
        return;
      }
      const SVMapElement = document.createElement("div");
      SVMapElement.id = "pano";
      SVMapElement.style.height = "480px";
      SVMapElement.style.marginTop = "10px";
      lastPane.parentElement.insertBefore(SVMapElement, lastPane.nextSibling);
    }

    const nomDetail = w.rhs.g.nominationDetail();
    const lat = nomDetail.lat;
    const lng = nomDetail.lng;

    SVMap = new google.maps.Map(document.getElementById("pano"), {
      center : {
        lat : lat,
        lng : lng
      },
      mapTypeId : "hybrid",
      zoom : 17,
      scaleControl : true,
      scrollwheel : true,
      gestureHandling : "greedy",
      mapTypeControl : false
    });
    const marker = new google.maps.Marker({
      map : SVMap,
      position : {
        lat : parseFloat(lat),
        lng : parseFloat(lng)
      },
      title : nomDetail.title
    });
    panorama = SVMap.getStreetView();
    const client = new google.maps.StreetViewService;
    client.getPanoramaByLocation({
      lat : lat,
      lng : lng
    }, 50, function(result, status) {
      if ("OK" === status) {
        let point = new google.maps.LatLng(lat, lng);
        const oldPoint = point;
        point = result.location.latLng;
        const heading = google.maps.geometry.spherical.computeHeading(point, oldPoint);
        panorama.setPosition(point);
        panorama.setPov({
          heading : heading,
          pitch : 0,
          zoom : 1
        });
        panorama.setMotionTracking(false);
        panorama.setVisible(true);
      }
    });

    // console.log("[NomSVMap] Setting Nomination Streetview image");
  }

  w.addEventListener("OPRNominationDetailLoaded", setStreetView);
  w.addEventListener("OPRNominationDetailLoaded", scrollUp);
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
