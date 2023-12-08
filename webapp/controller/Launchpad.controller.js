sap.ui.define(["manage/company/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("manage.company.controller.Launchpad", {
		/**
		 * Controller's "init" lifecycle method
		 */
		onInit: async function () {
			BaseController.prototype.onInit.apply(this, arguments);

			this.getRouter().getRoute("Launchpad").attachPatternMatched(this.onPatternMatched, this);
		},

		/**
		 * "Launchpad" route pattern matched event handler
		 */
		onPatternMatched: function () {
			this.setNavButton();
		},

		/**
		 * Launchpad Item press event handler
		 *
		 * @param {string} sPage page view name
		 */

		onMenuItemPress: function (sPage) {
			this.getRouter().navTo(sPage);
		},
	});
});
