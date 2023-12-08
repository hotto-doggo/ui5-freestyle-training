sap.ui.define(["manage/company/controller/BaseController", "sap/ui/core/routing/History", "sap/ui/core/UIComponent", "sap/m/MessageBox"], function (BaseController, History, UIComponent, MessageBox) {
	"use strict";

	return BaseController.extend("manage.company.controller.App", {
		/**
		 * Controller's "init" lifecycle method
		 */
		onInit: function () {},

		/**
		 * Menu Item press event handler
		 *
		 * @param {string} sPage page view name
		 */
		onMenuItemPress: function (sPage) {
			this.getOwnerComponent().getRouter().navTo(sPage);
		},

		/**
		 * Nav back button press event handler
		 */
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			var bEmployeeEditState = this.getModel("navButtonModel").getProperty("/employeeEdit");
			var bProjectEditState = this.getModel("navButtonModel").getProperty("/projectEdit");
			var bBusinessPartnerEditState = this.getModel("navButtonModel").getProperty("/businessPartnerEdit");

			if (bEmployeeEditState || bProjectEditState || bBusinessPartnerEditState) {
				MessageBox.confirm(this.i18n("UnsavedDataPage"), {
					onClose: (sButton) => {
						if (sButton === MessageBox.Action.OK) {
							this.getModel("navButtonModel").setProperty("/employeeEdit", false);
							this.getModel("navButtonModel").setProperty("/projectEdit", false);
							this.getModel("navButtonModel").setProperty("/businessPartnerEdit", false);
							if (sPreviousHash !== undefined) {
								window.history.go(-1);
								return;
							} else {
								var oRouter = UIComponent.getRouterFor(this);
								oRouter.navTo("Launchpad", {}, true);
							}
						}
					},
				});
			} else {
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
					return;
				} else {
					var oRouter = UIComponent.getRouterFor(this);
					oRouter.navTo("Launchpad", {}, true);
				}
			}
		},
	});
});
