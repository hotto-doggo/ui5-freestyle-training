sap.ui.define(
	[
		"manage/company/controller/BaseController",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"sap/ui/core/Item",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/m/ColumnListItem",
	],
	function (BaseController, ValidateHelper, Item, Fragment, MessageToast, MessageBox, ColumnListItem) {
		"use strict";

		return BaseController.extend(
			"manage.company.controller.BOOverview",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Bind table aggregation method
				 *
				 * @param {string} sTableId
				 * @param {string} sMainModel
				 */
				bindTableAggregation: function (sTableId, sMainModel, sType) {
					var oTable = this.byId(sTableId);

					var oColumnListItemTemplate = new ColumnListItem({press: [this.onTableItemPress, this], vAlign: "Middle", type: sType, cells: this.getBusinessObjectViewConfig().cells });

					oTable.bindAggregation("items", sMainModel + ">/data", oColumnListItemTemplate);
				},

				/**
				 * "Search" event handler of the "FiltersField" in the Entity list
				 */
				onFilterSearch: async function () {
					this.getModel(this.config.mainModelName).setProperty("/busy", true);

					var oFiltersModel = this.getModel("filtersModel").getData();
					var sFilterQuery = this.oBusinessObjectsModel.getFilteringQuery(oFiltersModel);

					var aEntityData = await this.oBusinessObjectsModel[this.config.filteringFunctionName](this.config.entityName, sFilterQuery);

					this.getModel(this.config.mainModelName).setProperty("/data", aEntityData);

					this.getModel(this.config.mainModelName).setProperty("/dataLength", aEntityData.length);

					this.getModel(this.config.mainModelName).setProperty("/busy", false);
				},

				/**
				 * "Reset" event handler of the "FiltersField" in the Entity list
				 */
				onFilterReset: async function () {
					this.getModel(this.config.mainModelName).setProperty("/busy", true);

					var oFiltersModel = this.getModel("filtersModel");

					Object.keys(oFiltersModel.getData()).forEach((sKey) => {
						oFiltersModel.setProperty("/" + sKey, null);
					});

					var aEntityData = await this.oBusinessObjectsModel.loadData(this.config.entityName);

					this.getModel(this.config.mainModelName).setProperty("/data", aEntityData);

					this.getModel(this.config.mainModelName).setProperty("/dataLength", aEntityData.length);

					this.getModel(this.config.mainModelName).setProperty("/busy", false);
				},

				/**
				 * "Open dialog" button press event handler
				 */
				onOpenDialogPress: async function () {
					var oView = this.getView();

					if (!this.oDialog) {
						this.oDialog = await Fragment.load({
							id: oView.getId(),
							name: this.config.dialogFragmentName,
							controller: this,
						});

						oView.addDependent(this.oDialog);
					}

					this.oDialog.open();
				},

				/**
				 * "Cancel" button press event handler (in the dialog)
				 */
				onDialogCancelPress: function () {
					MessageBox.confirm(this.i18n("UnsavedData"), {
						onClose: async (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								this.oDialog.close();
							}
						},
					});
				},

				/**
				 * "Create" button press event handler (in the dialog)
				 */
				onDialogCreatePress: async function () {
					if (!this.validateForm(this.config.dialogId)) {
						return;
					}

					var oDialogModel = this.getModel("dialogModel").getData();

					this.getModel(this.config.mainModelName).setProperty("/busy", true);

					try {
						await this.oBusinessObjectsModel[this.config.addingFunctionName](this.config.entityName, oDialogModel);

						var aEntityData = await this.oBusinessObjectsModel.loadData(this.config.entityName);

						this.getModel(this.config.mainModelName).setProperty("/data", aEntityData);

						this.getModel(this.config.mainModelName).setProperty("/dataLength", aEntityData.length);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					MessageToast.show(this.i18n("SuccessfullyCreated"));

					this.oDialog.close();

					this.getModel(this.config.mainModelName).setProperty("/busy", false);
				},

				/**
				 * After dialog close event handler
				 */
				onAfterClose: function () {
					this.clearValidationStates(this.config.dialogId);

					this.getModel("dialogModel").setData(this.getInitialDialogObject());
				},

				/**
				 * Create and insert initial value into select method
				 *
				 * @param {string} sKey item key
				 * @param {string} sDescription item text
				 * @param {sap.ui.core.Control} oControl separate Select of FilterBar section
				 */
				addInitialFilterValue: function (sKey, sDescription, oControl) {
					var oItem = new Item({
						key: sKey,
						text: sDescription,
					});

					oControl.insertItem(oItem, 0);
				},

				/**
				 * Set initial Selects values of FilterBar section
				 */
				setInitialFiltersValues: function () {
					var aFilterBarSelects = this.getView().byId("filterBar").getControlsByFieldGroupId("filterBarGroupID");

					aFilterBarSelects.forEach((oControl) => {
						if (oControl.getMetadata().getName() === "sap.m.Select") {
							this.addInitialFilterValue("ALL", "ALL", oControl);
						}
					});

					this.getModel(this.config.mainModelName).updateBindings();
				},

				/**
				 * Open related entity details page on table row press event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onTableItemPress: function (oEvent) {
					var oSource = oEvent.getSource();

					var oCtx = oSource.getBindingContext(this.config.mainModelName);

					var ID = {
						[this.config.detailsRouteId]: oCtx.getObject("ID"),
					};

					this.getRouter().navTo(this.config.detailsRouteName, ID);
				},

				/**
				 * Delete button press event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onDeleteTableItem: async function (oEvent) {
					var oSource = oEvent.getSource();
					var oCtx = oSource.getBindingContext(this.config.mainModelName);
					var nId = oCtx.getObject("ID");

					this.getModel(this.config.mainModelName).setProperty("/busy", false);

					MessageBox.confirm(this.i18n(this.config.deleteText), {
						onClose: async (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								try {
									await this.oBusinessObjectsModel[this.config.deleteEntityFunctionName](this.config.entityName, nId);

									var aEntityData = await this.oBusinessObjectsModel.loadData(this.config.entityName);

									this.getModel(this.config.mainModelName).setProperty("/data", aEntityData);

									MessageToast.show(this.i18n("SuccessfullyDeleted"));
								} catch (oError) {
									console.error(oError);

									MessageToast.show(this.i18n("SomethingWentWrong"));
								}
							}
						},
					});

					this.getModel(this.config.mainModelName).setProperty("/busy", false);
				},
			})
		);
	}
);
