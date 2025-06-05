/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"globalhitss/ee/site/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});