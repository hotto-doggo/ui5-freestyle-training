sap.ui.define(
	[
		"manage/company/reuse/BOOverview",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/model/BusinessObjectsModel",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
	],
	function (BOOverview, ValidateHelper, BusinessObjectsModel, formatter, Constants, JSONModel, MessageToast, MessageBox) {
		"use strict";

		return BOOverview.extend(
			"manage.company.controller.BusinessPartners",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Formatter functions object
				 */
				formatter: formatter,

				/**
				 * Configurations
				 */
				config: {
					entityName: Constants.BUSINESS_PARTNERS,
					mainModelName: "mainModel",
					dialogFragmentName: "manage.company.view.fragments.BusinessPartnersDialog",
					detailsRouteName: "BusinessPartnerDetails",
					detailsRouteId: "BusinessPartnerID",
					dialogId: Constants.BUSINESS_PARTNERS_DIALOG_ID,
					addingFunctionName: "addEntity",
					filteringFunctionName: "getFilteredEntityData",
					tableId: Constants.ENTITIES_TABLE_ID,
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.BusinessPartners",
						columns: [
							{
								minScreenWidth: "Large",
								text: this.i18n("Name"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Country"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Address"),
							},
							{
								minScreenWidth: "890px",
								text: this.i18n("Contacts"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("Type"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("ProjectsCount"),
								hAlign: "End",
							},
						],
					};
				},

				/**
				 * Controller's "init" lifecycle method
				 */
				onInit: function () {
					BOOverview.prototype.onInit.apply(this, arguments);

					this.getRouter().getRoute("BusinessPartners").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * Controller's "after rendering" lifecycle method
				 */
				onAfterRendering: async function () {
					await this.setInitialModels();

					this.setNavButton();
				},

				/**
				 * "Business Partners" route pattern matched event handler
				 */
				onPatternMatched: async function () {
					var oNavButtonModel = this.getModel("navButtonModel");
					oNavButtonModel.setProperty("/columnLayout", "OneColumn");

					await this.setInitialModels();

					this.setNavButton();
				},

				/**
				 * Set initial view models method
				 */
				setInitialModels: async function () {
					this.setModel(new JSONModel(this.getBusinessObjectViewConfig()), "viewConfig");

					var oJSONModel = {
						busy: true,
					};

					this.oProjectsViewModel = new JSONModel(oJSONModel);
					this.setModel(this.oProjectsViewModel, "mainModel");

					this.oBusinessObjectsModel = new BusinessObjectsModel();

					try {
						// var aVariableNames = ["aBusinessPartners"];

						this.aBusinessPartners = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.BUSINESS_PARTNERS, {
							include: ["rel_Projects"],
						});

						var oJSONModel = {
							busy: false,
							data: this.aBusinessPartners,
							locations: this.aLocations,
						};

						this.oProjectsViewModel = new JSONModel(oJSONModel);
						this.setModel(this.oProjectsViewModel, "mainModel");
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					this.oFiltersModel = new JSONModel(this.getInitialFormObject());
					this.oDialogModel = new JSONModel(this.getInitialDialogObject());

					this.setModel(this.oFiltersModel, "filtersModel");
					this.setModel(this.oDialogModel, "dialogModel");
				},

				/**
				 * Get initial form model function
				 *
				 * @returns {Object} initial form model object
				 */
				getInitialFormObject: function () {
					return {
						Name: null,
						Country: null,
						Type: null,
						include: ["rel_Projects"],
					};
				},

				/**
				 * Get initial dialog model function
				 *
				 * @returns {Object} initial dialog model object
				 */
				getInitialDialogObject: function () {
					return {
						Type: null,
						Name: null,
						Country: null,
						City: null,
						Address: null,
						Contacts: null,
					};
				},

				/**
				 * "Reset" event handler of the "FiltersField" in the Employees list
				 */
				onFilterReset: async function () {
					this.getModel(this.config.mainModelName).setProperty("/busy", true);

					var oFiltersModel = this.getModel("filtersModel");

					oFiltersModel.setData(this.getInitialFormObject());

					var aEntityData = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(this.config.entityName, {
						include: ["rel_Projects"],
					});

					this.getModel(this.config.mainModelName).setProperty("/data", aEntityData);

					this.getModel(this.config.mainModelName).setProperty("/dataLength", aEntityData.length);

					this.getModel(this.config.mainModelName).setProperty("/busy", false);
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

						var aEntityData = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(this.config.entityName, {
							include: ["rel_Projects"],
						});

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
				 * Open Project details on table row press event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onTableItemPress: function (oEvent) {
					var bBusinessPartnerEditState = this.getModel("navButtonModel").getProperty("/businessPartnerEdit");

					var oSource = oEvent.getSource();

					var oCtx = oSource.getBindingContext(this.config.mainModelName);

					var ID = {
						[this.config.detailsRouteId]: oCtx.getObject("ID"),
					};

					if (bBusinessPartnerEditState) {
						MessageBox.confirm(this.i18n("UnsavedDataPage"), {
							onClose: (sButton) => {
								if (sButton === MessageBox.Action.OK) {
									this.getModel("navButtonModel").setProperty("/businessPartnerEdit", false);

									this.getRouter().navTo(this.config.detailsRouteName, ID);
								}
							},
						});
					} else {
						var oSource = oEvent.getSource();

						var oCtx = oSource.getBindingContext(this.config.mainModelName);

						var ID = {
							[this.config.detailsRouteId]: oCtx.getObject("ID"),
						};

						this.getRouter().navTo(this.config.detailsRouteName, ID);
					}
				},
			})
		);
	}
);
