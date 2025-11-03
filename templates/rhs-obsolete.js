// @name         Obsolete
// @version      1.0.0
// @description  Obsolete Template (do not install)
// @author       AlterTobi

(function() {
  "use strict";
  const w = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

  const warnText = "This script is no longer supported, please uninstall.";

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
  console.error(GM_info.script.name, ":", warnText);
  w.rhs.f.createNotification(`${GM_info.script.name}: ${warnText}`, "red" );
  w.alert(GM_info.script.name + "\n" + warnText);
  // 2025-10-31
})();
