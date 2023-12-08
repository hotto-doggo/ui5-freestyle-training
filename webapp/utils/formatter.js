sap.ui.define(["sap/ui/core/ValueState", "manage/company/utils/Constants"], function (ValueState, Constants) {
	"use strict";

	return {
		/**
		 * Formatter function for entity data.
		 *
		 * @param {integer} iId entity ID
		 * @param {Object[]} aEntityData entity data
		 * @param {string} sProperty name of returning property
		 *
		 * @returns {string} formatted data
		 */
		formatEntityDataByProperty: function (iId, aEntityData, sProperty) {
			if (!iId || !aEntityData) {
				return;
			} else {
				var oResult = aEntityData.find((oItem) => {
					return oItem.ID === iId;
				});

				return oResult[sProperty] || iId;
			}
		},

		/**
		 * Formatter function for status text.
		 *
		 * @param {string} sStatus status
		 * @param {Object[]} aStatuses array with all statuses
		 *
		 * @returns {string} formatted data
		 */
		formatGenericStatuses: function (sStatus, aStatuses) {
			if (!sStatus || !aStatuses) {
				return;
			} else {
				if (sStatus === Constants.EMPLOYEE_ON_PROJECT) {
					return "Employee is on a project";
				}

				var oResult = aStatuses.find((oItem) => {
					return oItem.StatusCode === sStatus;
				});

				return oResult.Description || sStatus;
			}
		},

		/**
		 * Formatter function for status state.
		 *
		 * @param {string} sStatus status
		 *
		 * @returns {string} formatted data
		 */
		formatStatusState: function (sStatus) {
			if (sStatus === Constants.EMPLOYEE_EDUCATION || sStatus === Constants.PROJECT_FINISHED) {
				return ValueState.None;
			} else if (sStatus === Constants.EMPLOYEE_ON_PROJECT || sStatus === Constants.EMPLOYEE_ON_PROJECT_WITHOUT_UNDERSCORE || sStatus === Constants.PROJECT_IN_PROCESS) {
				return ValueState.Success;
			} else if (sStatus === Constants.EMPLOYEE_ONBOARDING || sStatus === Constants.PROJECT_PLANNED) {
				return ValueState.Warning;
			} else if (sStatus === Constants.EMPLOYEE_BENCH || sStatus === Constants.PROJECT_CANCELED) {
				return ValueState.Error;
			} else {
				return ValueState.None;
			}
		},

		/**
		 * Formatter function for BossID.
		 *
		 * @param {integer} iId boss ID
		 * @param {Object[]} aEntityData employees data
		 *
		 * @returns {string} formatted data
		 */
		formatBossName: function (iId, aEmployees) {
			if (!iId || !aEmployees) {
				return;
			}

			var oResult = aEmployees.find((oItem) => {
				return oItem.ID === iId;
			});

			return oResult.FirstName + " " + oResult.LastName || iId;
		},

		/**
		 * Formatter function for date.
		 *
		 * @param {string} aDate date
		 *
		 * @returns {string} formatted data
		 */
		formatDate: function (sDate) {
			return sDate.split("T")[0].split("-").join("/");
		},

		/**
		 * Formatter function for date.
		 *
		 * @param {string} aDate date
		 *
		 * @returns {string} formatted data
		 */
		formatDateWithDot: function (sDate) {
			var aDate = sDate.split("T")[0];
			return aDate.split("-").reverse().join(".");
		},

		/**
		 * Formatter function for date period.
		 *
		 * @param {string} aDate date
		 *
		 * @returns {string} formatted data
		 */
		formatDateRange: function (sStartDate, sEndDate) {
			var aStartDate = sStartDate.split("T")[0];
			var aEndDate = sEndDate.split("T")[0];
			return aStartDate.split("-").reverse().join(".") + " - " + aEndDate.split("-").reverse().join(".");
		},

		/**
		 * Formatter function for attachment author
		 *
		 * @param {integer} iId attachment id
		 * @param {Object[]} aAttachments attachments data
		 * @param {Object[]} aEmployees employees data
		 *
		 * @returns {string} formatted data
		 */
		formatAttachmentAuthor: function (iId, aAttachments, aEmployees) {
			if (!iId || !aAttachments || !aEmployees) {
				return;
			}

			var oAttachment = aAttachments.find((oItem) => {
				return oItem.ID === iId;
			});

			var oResult = aEmployees.find((oItem) => {
				return oItem.ID === oAttachment.CreatedByID;
			});

			return oResult.FirstName + " " + oResult.LastName || iId;
		},

		/**
		 * Formatter function for attachment author
		 *
		 * @param {integer} iId attachment id
		 * @param {Object[]} aAttachments attachments data
		 *
		 * @returns {string} formatted data
		 */
		formatAttachmentId: function (iId, aAttachments) {
			if (!iId || !aAttachments) {
				return;
			}

			var oAttachment = aAttachments.find((oItem) => {
				return oItem.ID === iId;
			});

			return oAttachment.CreatedByID || iId;
		},

		/**
		 * Formatter function for attachment date
		 *
		 * @param {integer} iId attachment id
		 * @param {Object[]} aAttachments attachments data
		 *
		 * @returns {string} formatted data
		 */
		formatAttachmentDate: function (iId, aAttachments) {
			if (!iId || !aAttachments) {
				return;
			}

			var oAttachment = aAttachments.find((oItem) => {
				return oItem.ID === iId;
			});

			return oAttachment.CreatedOn.split("T")[0].split("-").reverse().join(".");
		},

		/**
		 * Formatter function for rating
		 *
		 * @param {integer} iRating
		 *
		 * @returns {string} formatted data
		 */
		formatRating: function (iRating) {
			return !isNaN(iRating) ? iRating / 2 : "";
		},

		/**
		 * Formatter function for TreeTable selection mode
		 *
		 * @param {boolean} bEdit
		 *
		 * @returns {string} formatted data
		 */
		formatTableSelectionMode: function (bEdit) {
			if (typeof bEdit !== "boolean") {
				return "";
			}
			return bEdit === true ? "MultiToggle" : "None";
		},

		/**
		 * Formatter function for utilization ProgressIndicator state
		 *
		 * @param {integer} iUtilization
		 *
		 * @returns {string} formatted data
		 */
		formatProgressIndicator: function (iUtilization) {
			if (isNaN(iUtilization)) {
				return ValueState.None;
			}
			if (iUtilization > 100) {
				return ValueState.Error;
			} else if (iUtilization < 100) {
				return ValueState.Warning;
			} else {
				return ValueState.Success;
			}
		},

		/**
		 * Formatter function for employee details link
		 *
		 * @param {string} sId employee id
		 *
		 * @returns {string} formatted data
		 */
		formatEmployeeLink: function (sId) {
			return !isNaN(sId) ? "#/employees/" + sId : "";
		},

		/**
		 * Formatter function for project details link
		 *
		 * @param {string} sId project id
		 *
		 * @returns {string} formatted data
		 */
		formatProjectLink: function (sId) {
			return !isNaN(sId) ? "#/projects/" + sId : "";
		},
	};
});
