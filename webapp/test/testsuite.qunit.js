window.suite = function () {
	"use strict";

	var oSuite = new parent.jsUnitTestSuite();
	var sContextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

	oSuite.addTestPage(sContextPath + "unit/unitTests.qunit.html");

	return oSuite;
};
