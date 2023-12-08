/*global QUnit*/

sap.ui.define(["manage/company/utils/formatter", "sap/ui/core/ValueState", "manage/company/utils/Constants"], function (formatter, ValueState, Constants) {
	"use strict";

	function genericStatusStateTestCase(assert, sStatusCode, sExpectedState) {
		var sState = formatter.formatStatusState(sStatusCode);

		assert.strictEqual(sState, sExpectedState, "State converted correctly");
	}

	function formatISODateWithSlashDelimiterTestCase(assert, sISODate, sExpectedFormattedDate) {
		var sFormattedDate = formatter.formatDate(sISODate);

		assert.strictEqual(sFormattedDate, sExpectedFormattedDate, "Date converted correctly");
	}

	function formatISODatesIntoDateRangeTestCase(assert, sISOStartDate, sISOEndDate, sExpectedFormattedDateRange) {
		var sFormattedDate = formatter.formatDateRange(sISOStartDate, sISOEndDate);

		assert.strictEqual(sFormattedDate, sExpectedFormattedDateRange, "Date range converted correctly");
	}

	function formatRatingTestCase(assert, nRating, nExpectedRating) {
		var nFormattedRating = formatter.formatRating(nRating);

		assert.strictEqual(nFormattedRating, nExpectedRating, "Rating converted correctly");
	}

	function formatTableSelectionModeTestCase(assert, bEditFlag, sExpectedMode) {
		var sFormattedMode = formatter.formatTableSelectionMode(bEditFlag);

		assert.strictEqual(sFormattedMode, sExpectedMode, "Table selection mode converted correctly");
	}

	function formatProgressIndicatorTestCase(assert, iUtilization, sExpectedState) {
		var sFormattedState = formatter.formatProgressIndicator(iUtilization);

		assert.strictEqual(sFormattedState, sExpectedState, "Progress indicator state converted correctly");
	}

	function formatEmployeeLinkTestCase(assert, iId, sExpectedLink) {
		var sFormattedLink = formatter.formatEmployeeLink(iId);

		assert.strictEqual(sFormattedLink, sExpectedLink, "Employee link converted correctly");
	}

	function formatProjectLinkTestCase(assert, iId, sExpectedLink) {
		var sFormattedLink = formatter.formatProjectLink(iId);

		assert.strictEqual(sFormattedLink, sExpectedLink, "Employee link converted correctly");
	}

	QUnit.module("formatter - Generic status state");

	QUnit.test("Should convert Constants.EMPLOYEE_EDUCATION to ValueState.None", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.EMPLOYEE_EDUCATION, ValueState.None);
	});

	QUnit.test("Should convert Constants.PROJECT_FINISHED to ValueState.None", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.PROJECT_FINISHED, ValueState.None);
	});

	QUnit.test("Should convert Constants.EMPLOYEE_ON_PROJECT to ValueState.Success", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.EMPLOYEE_ON_PROJECT, ValueState.Success);
	});

	QUnit.test("Should convert Constants.PROJECT_IN_PROCESS to ValueState.Success", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.PROJECT_IN_PROCESS, ValueState.Success);
	});

	QUnit.test("Should convert Constants.EMPLOYEE_ONBOARDING to ValueState.Warning", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.EMPLOYEE_ONBOARDING, ValueState.Warning);
	});

	QUnit.test("Should convert Constants.PROJECT_PLANNED to ValueState.Warning", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.PROJECT_PLANNED, ValueState.Warning);
	});

	QUnit.test("Should convert Constants.EMPLOYEE_BENCH to ValueState.Error", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.EMPLOYEE_BENCH, ValueState.Error);
	});

	QUnit.test("Should convert Constants.PROJECT_CANCELED to ValueState.Error", function (assert) {
		genericStatusStateTestCase.call(this, assert, Constants.PROJECT_CANCELED, ValueState.Error);
	});

	QUnit.test("Should convert '' to ValueState.None", function (assert) {
		genericStatusStateTestCase.call(this, assert, "", ValueState.None);
	});

	QUnit.module("formatter - format ISO date with '/' delimiter");

	QUnit.test("Should convert 2021-01-12T06:40:51.608Z to 2021/01/12", function (assert) {
		formatISODateWithSlashDelimiterTestCase.call(this, assert, "2021-01-12T06:40:51.608Z", "2021/01/12");
	});

	QUnit.test("Should convert '' to ''", function (assert) {
		formatISODateWithSlashDelimiterTestCase.call(this, assert, "", "");
	});

	QUnit.module("formatter - format ISO dates into date range with '.' delimiter");

	QUnit.test("Should convert 2020-03-29T21:00:00.000Z and 2020-05-31T21:00:00.000Z to 29.03.2020 - 31.05.2020", function (assert) {
		formatISODatesIntoDateRangeTestCase.call(this, assert, "2020-03-29T21:00:00.000Z", "2020-05-31T21:00:00.000Z", "29.03.2020 - 31.05.2020");
	});

	QUnit.test("Should convert '' and '' to ' - '", function (assert) {
		formatISODatesIntoDateRangeTestCase.call(this, assert, "", "", " - ");
	});

	QUnit.module("formatter - format rating");

	QUnit.test("Should convert 10 to 5", function (assert) {
		formatRatingTestCase.call(this, assert, 10, 5);
	});

	QUnit.test("Should convert 6 to 3", function (assert) {
		formatRatingTestCase.call(this, assert, 6, 3);
	});

	QUnit.test("Should convert NaN to ''", function (assert) {
		formatRatingTestCase.call(this, assert, NaN, "");
	});

	QUnit.module("formatter - format table selection mode");

	QUnit.test("Should convert true to MultiToggle", function (assert) {
		formatTableSelectionModeTestCase.call(this, assert, true, "MultiToggle");
	});

	QUnit.test("Should convert false to None", function (assert) {
		formatTableSelectionModeTestCase.call(this, assert, false, "None");
	});

	QUnit.test("Should convert word to ''", function (assert) {
		formatTableSelectionModeTestCase.call(this, assert, "word", "");
	});

	QUnit.test("Should convert 0 to ''", function (assert) {
		formatTableSelectionModeTestCase.call(this, assert, 0, "");
	});

	QUnit.module("formatter - format progress indicator state");

	QUnit.test("Should convert 0 to ValueState.Warning", function (assert) {
		formatProgressIndicatorTestCase.call(this, assert, 0, ValueState.Warning);
	});

	QUnit.test("Should convert 100 to ValueState.Success", function (assert) {
		formatProgressIndicatorTestCase.call(this, assert, 100, ValueState.Success);
	});

	QUnit.test("Should convert 150 to ValueState.Error", function (assert) {
		formatProgressIndicatorTestCase.call(this, assert, 150, ValueState.Error);
	});

	QUnit.test("Should convert NaN to ValueState.None", function (assert) {
		formatProgressIndicatorTestCase.call(this, assert, NaN, ValueState.None);
	});

	QUnit.module("formatter - format employee link");

	QUnit.test("Should convert 1 to #/employees/1", function (assert) {
		formatEmployeeLinkTestCase.call(this, assert, 1, "#/employees/1");
	});

	QUnit.test("Should convert NaN to ''", function (assert) {
		formatEmployeeLinkTestCase.call(this, assert, NaN, "");
	});

	QUnit.module("formatter - format project link");

	QUnit.test("Should convert 1 to #/projects/1", function (assert) {
		formatProjectLinkTestCase.call(this, assert, 1, "#/projects/1");
	});

	QUnit.test("Should convert NaN to ''", function (assert) {
		formatProjectLinkTestCase.call(this, assert, NaN, "");
	});
});
