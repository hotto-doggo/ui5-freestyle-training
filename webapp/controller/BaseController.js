sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("manage.company.controller.BaseController", {
		/**
		 * Controller's "init" lifecycle method
		 */
		onInit: async function () {
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
		},

		/**
		 * Set nav button controller method
		 */
		setNavButton: function () {
			var sViewName = this.getView().getViewName();

			var oNavButtonModel = this.getModel("navButtonModel");

			if (sViewName === "manage.company.view.Launchpad") {
				oNavButtonModel.setProperty("/showNavButton", false);
			} else {
				oNavButtonModel.setProperty("/showNavButton", true);
			}

			oNavButtonModel.setProperty("/columnLayout", "OneColumn");
		},

		/**
		 * Get Model of View
		 *
		 * @param {string} sName name of model
		 *
		 * @returns {sap.ui.model.Model} object of model
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Set View Model
		 *
		 * @param {sap.ui.model.Model} oModel object of model
		 * @param {string} sName name of model
		 */
		setModel: function (oModel, sName) {
			this.getView().setModel(oModel, sName);
		},

		/**
		 * Get Router
		 *
		 *  @returns {sap.m.routing.Router} Router object
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * i18n function
		 *
		 * @param {string} sText i18n key
		 *
		 * @returns {string} current i18n text
		 */
		i18n: function (sText) {
			return this.getModel("i18n").getResourceBundle().getText(sText);
		},
	});
});
