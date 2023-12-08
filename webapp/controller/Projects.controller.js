sap.ui.define(
	[
		"manage/company/reuse/BOOverview",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/model/BusinessObjectsModel",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/Text",
		"sap/m/ObjectStatus",
		"sap/m/Link",
	],
	function (BOOverview, ValidateHelper, BusinessObjectsModel, formatter, Constants, JSONModel, MessageToast, Text, ObjectStatus, Link) {
		"use strict";

		return BOOverview.extend(
			"manage.company.controller.Projects",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Formatter functions object
				 */
				formatter: formatter,

				/**
				 * Configurations
				 */
				config: {
					entityName: Constants.PROJECTS,
					mainModelName: "mainModel",
					dialogFragmentName: "manage.company.view.fragments.ProjectDialog",
					detailsRouteName: "ProjectDetails",
					detailsRouteId: "ProjectID",
					dialogId: Constants.PROJECT_DIALOG_ID,
					addingFunctionName: "addEntity",
					filteringFunctionName: "getFilteredEntityData",
					tableId: Constants.ENTITIES_TABLE_ID,
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.Projects",
						columns: [
							{
								minScreenWidth: "Large",
								text: this.i18n("Name"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Type"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("DatePeriod"),
							},
							{
								minScreenWidth: "890px",
								text: this.i18n("Customer"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("Lead"),
							},
							{
								minScreenWidth: "1270px",
								text: this.i18n("Location"),
							},
							{
								minScreenWidth: "1500px",
								text: this.i18n("Status"),
							},
						],
					};
				},

				/**
				 * Controller's "init" lifecycle method
				 */
				onInit: function () {
					BOOverview.prototype.onInit.apply(this, arguments);

					this.getRouter().getRoute("Projects").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * "Projects" route pattern matched event handler
				 */
				onPatternMatched: async function () {
					await this.setInitialModels();

					this.setNavButton();
				},

				/**
				 * Set initial view models method
				 */
				setInitialModels: async function () {
					this.setModel(new JSONModel(this.getBusinessObjectViewConfig()), "viewConfig");

					this.oBusinessObjectsModel = new BusinessObjectsModel();

					try {
						var aVariableNames = ["aProjectsData", "aProjectsTypes", "aBusinessPartners", "aEmployeesData", "aGenericStatuses"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.PROJECTS),
							this.oBusinessObjectsModel.loadData(Constants.PROJECT_TYPES),
							this.oBusinessObjectsModel.loadData(Constants.BUSINESS_PARTNERS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.aGenericStatuses = this.aGenericStatuses.filter((oItem) => {
							return oItem.Domain === Constants.PROJECT_LOW_CASE;
						});
						var oJSONModel = {
							busy: false,
							data: this.aProjectsData,
							types: this.aProjectsTypes,
							partners: this.aBusinessPartners,
							employees: this.aEmployeesData,
							dataLength: this.aProjectsData.length,
							statuses: this.aGenericStatuses,
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
						Type: null,
						StartDate: null,
						EndDate: null,
						CustomerID: null,
						LeadID: null,
						Location: null,
						StatusCode: null,
					};
				},

				/**
				 * Get initial dialog model function
				 *
				 * @returns {Object} initial dialog model object
				 */
				getInitialDialogObject: function () {
					return {
						Name: null,
						Type: null,
						Location: null,
						StartDate: null,
						EndDate: null,
						LeadID: null,
						CustomerID: null,
						StatusCode: Constants.PROJECT_PLANNED,
					};
				},
			})
		);
	}
);
