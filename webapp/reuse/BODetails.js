sap.ui.define(
	[
		"manage/company/controller/BaseController",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/m/ColumnListItem",
	],
	function (BaseController, ValidateHelper, JSONModel, Fragment, MessageToast, MessageBox, ColumnListItem) {
		"use strict";

		return BaseController.extend(
			"manage.company.controller.BODetails",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Bind table aggregation method
				 *
				 * @param {string} sTableId
				 * @param {string} sMainModel
				 */
				bindTableAggregation: function (sTableId, sMainModel, sDataPath, sType) {
					var oTable = this.byId(sTableId);

					var oColumnListItemTemplate = new ColumnListItem({press: [this.onTableItemPress, this], vAlign: "Middle", type: sType, cells: this.getBusinessObjectViewConfig().cells });

					oTable.bindAggregation("items", sMainModel + sDataPath, oColumnListItemTemplate);
				},

				/**
				 * Edit button press event handler
				 */
				onEditButtonPress: function () {
					this.getModel(this.config.mainModelName).setProperty("/edit", true);
					this.getModel("navButtonModel").setProperty(this.config.editGlobalProperty, true);
				},

				/**
				 * Cancel edit button press event handler
				 */
				onCancelChangesPress: function () {
					this.clearValidationStates(this.config.pageId);

					this.getModel(this.config.mainModelName).setProperty("/edit", false);
					this.getModel("navButtonModel").setProperty(this.config.editGlobalProperty, false);

					var oEditModel = this.getInitialEditObject(this.getModel(this.config.mainModelName).getProperty(this.config.entityDataProperty));
					this.oEditModel.setData(oEditModel);
				},

				/**
				 * Save edit button press event handler
				 */
				onSaveChangesPress: async function () {
					if (!this.validateForm(this.config.pageId)) {
						return;
					}

					this.getModel(this.config.mainModelName).setProperty("/titleBusy", true);
					this.getModel(this.config.mainModelName).setProperty("/headerBusy", true);
					this.getModel(this.config.mainModelName).setProperty("/generalInfoBusy", true);

					var oBody = this.oEditModel.getData();
					var sEntityID = this.getModel(this.config.mainModelName).getProperty(this.config.entityId);

					try {
						await this.oBusinessObjectsModel[this.config.editFunctionName](this.config.entityName ,oBody, sEntityID);

						this.aEntityData = await this.oBusinessObjectsModel[this.config.getDataFunctionName](this.config.entityName, sEntityID);

						this.getModel(this.config.mainModelName).setProperty(this.config.dataPropertyName, this.aEntityData);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					this.getModel(this.config.mainModelName).setProperty("/edit", false);
					this.getModel("navButtonModel").setProperty(this.config.editGlobalProperty, false);

					var oEditModel = this.getInitialEditObject(this.aEntityData);

					this.getModel(this.config.mainModelName).setProperty("/titleBusy", false);
					this.getModel(this.config.mainModelName).setProperty("/headerBusy", false);
					this.getModel(this.config.mainModelName).setProperty("/generalInfoBusy", false);
					this.oEditModel.setData(oEditModel);
				},

				/**
				 * Delete button press event handler
				 */
				onDeleteButtonPress: async function () {
					var sEntityID = this.getModel(this.config.mainModelName).getProperty(this.config.entityId);

					MessageBox.confirm(this.i18n(this.config.deleteText), {
						onClose: async (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								try {
									await this.oBusinessObjectsModel[this.config.deleteEntityFunctionName](this.config.entityName, sEntityID);
									this.getRouter().navTo(this.config.overviewName);
								} catch (oError) {
									console.error(oError);

									MessageToast.show(this.i18n("SomethingWentWrong"));
								}
							}
						},
					});
				},

				/**
				 * Open details page on table row press event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object.
				 */
				onTableItemPress: function (oEvent) {
					var oSource = oEvent.getSource();

					var oCtx = oSource.getBindingContext(this.config.mainModelName);

					var ID = {
						[this.config.detailsRouteId]: oCtx.getObject("ID"),
					};

					this.getRouter().navTo(this.config.detailsRouteName, ID);
				},
			})
		);
	}
);
