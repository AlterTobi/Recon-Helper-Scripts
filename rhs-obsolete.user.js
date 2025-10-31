// ==UserScript==
// @name           RHS - Obsolete
// @version        1.0.0
// @description    Obsolete Template
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/RHS/
// @homepage       https://altertobi.github.io/Recon-Helper-Scripts/
// @supportURL     https://github.com/AlterTobi/Recon-Helper-Scripts/issues
// @icon           https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Recon-Helper-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Recon-Helper-Scripts/rhs-obsolete.user.js
// @updateURL      https://altertobi.github.io/Recon-Helper-Scripts/rhs-obsolete.meta.js
// @match          https://opr.ingress.com/*
// @grant          none
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

  const warnText = "This script is no longer supported, please uninstall.";

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
  console.error(GM_info.script.name, ":", warnText);
  window.rhs.f.createNotification(`${GM_info.script.name}: ${warnText}`, "red" );
  window.alert(GM_info.script.name + "\n" + warnText);
  // 2025-10-31
})();
