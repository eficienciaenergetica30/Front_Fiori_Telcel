/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"globalhitss/ee/company/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});