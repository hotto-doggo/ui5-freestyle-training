sap.ui.define(
	[
		"manage/company/model/BusinessObjectsModel",
		"manage/company/reuse/BODetails",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
	],
	function (BusinessObjectsModel, BODetails, ValidateHelper, formatter, Constants, JSONModel, MessageToast) {
		"use strict";

		return BODetails.extend(
			"manage.company.controller.BusinessPartnerDetails",
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
					relatedEntityName: Constants.REL_PROJECTS,
					mainModelName: "mainModel",
					entityId: "/BusinessPartnerID",
					entityDataProperty: "/businessPartnerData",
					overviewName: "BusinessPartners",
					detailsRouteName: "ProjectDetails",
					detailsRouteId: "ProjectID",
					deleteText: "DeleteEmployee",
					pageId: Constants.DETAILS_PAGE_ID,
					editGlobalProperty: "/businessPartnerEdit",
					editFunctionName: "editEntityInfo",
					getDataFunctionName: "getEntityById",
					deleteEntityFunctionName: "deleteEntityById",
					dataPropertyName: "/businessPartnerData",
					assignDialogId: Constants.ASSIGN_PROJECT_DIALOG_ID,
					tableBusyProperty: "/projectsBusy",
					mainDataVariableName: "aProjects",
					mainRelationPropertyName: "/projects",
					tableId: Constants.ENTITIES_TABLE_ID,
					projectsDataPath: ">/projects",
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.BusinessPartnerDetails",
						columns: [
							{
								minScreenWidth: "Large",
								text: this.i18n("Status"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("ProjectName"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Type"),
							},
							{
								minScreenWidth: "890px",
								text: this.i18n("DatePeriod"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("Lead"),
							},
							{
								minScreenWidth: "1270px",
								text: this.i18n("Location"),
							},
						],
					};
				},

				/**
				 * Controller's "init" lifecycle method
				 */
				onInit: function () {
					BODetails.prototype.onInit.apply(this, arguments);
					this.oBusinessObjectsModel = new BusinessObjectsModel();

					this.getRouter().getRoute("BusinessPartnerDetails").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * Set initial view models method
				 */
				setInitialModels: async function () {
					this.setModel(new JSONModel(this.getBusinessObjectViewConfig()), "viewConfig");

					var oJSONModel = {
						BusinessPartnerID: null,
						edit: false,
						titleBusy: true,
						headerBusy: true,
						generalInfoBusy: true,
						projectsBusy: true,
					};

					this.oBusinessPartnerDetailsViewModel = new JSONModel(oJSONModel);

					this.setModel(this.oBusinessPartnerDetailsViewModel, "mainModel");
				},

				/**
				 * Update initial view models with server data method
				 */
				updateInitialModelData: async function () {
					var sBusinessPartnerID = this.getModel("mainModel").getProperty("/BusinessPartnerID");

					try {
						var aVariableNames = ["aBusinessPartnerData", "aProjects"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.getEntityById(this.config.entityName, sBusinessPartnerID),
							this.oBusinessObjectsModel.loadDataByIdAndRelation(Constants.BUSINESS_PARTNERS, sBusinessPartnerID, Constants.REL_PROJECTS),
						]);
						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						if (this.aBusinessPartnerData.hasOwnProperty("error")) {
							if (this.aBusinessPartnerData.error.status === 404) {
								window.history.go(-1);
								return;
							}
						}
						this.oBusinessPartnerDetailsViewModel.setProperty("/businessPartnerData", this.aBusinessPartnerData);
						this.oBusinessPartnerDetailsViewModel.setProperty("/titleBusy", false);
						this.oBusinessPartnerDetailsViewModel.setProperty("/headerBusy", false);
						this.oBusinessPartnerDetailsViewModel.setProperty("/generalInfoBusy", false);
						this.oBusinessPartnerDetailsViewModel.setProperty("/projects", this.aProjects);
						this.oBusinessPartnerDetailsViewModel.setProperty("/projectsBusy", false);

						this.oEditModel = new JSONModel(this.getInitialEditObject(this.aBusinessPartnerData));
						this.setModel(this.oEditModel, "editModel");
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * Get initial edit model function
				 *
				 * @param {Object[]} array with business partner data
				 *
				 * @returns {Object} initial edit model object
				 */
				getInitialEditObject: function (aBusinessPartnerData) {
					return {
						Type: aBusinessPartnerData.Type,
						Name: aBusinessPartnerData.Name,
						Country: aBusinessPartnerData.Country,
						City: aBusinessPartnerData.City,
						Address: aBusinessPartnerData.Address,
						Contacts: aBusinessPartnerData.Contacts,
						password: "lolkek",
					};
				},

				/**
				 * Set API data function
				 */
				setApiData: async function () {
					try {
						var aVariableNames = ["aGenericStatusesProject", "aEmployeesData"];

						var aResponses = await Promise.all([this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES), this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES)]);
						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.aGenericStatusesProject = this.aGenericStatusesProject.filter((oItem) => {
							return oItem.Domain === Constants.PROJECT_LOW_CASE;
						});

						this.oBusinessPartnerDetailsViewModel.setProperty("/allEmployees", this.aEmployeesData);
						this.oBusinessPartnerDetailsViewModel.setProperty("/allStatusesProject", this.aGenericStatusesProject);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * "Business Partners Details" route pattern matched event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onPatternMatched: function (oEvent) {
					this.setInitialModels();
					this.setNavButton();

					var mRouteArguments = oEvent.getParameter("arguments");

					var sBusinessPartnerID = mRouteArguments.BusinessPartnerID;

					this.oBusinessPartnerDetailsViewModel.setProperty("/BusinessPartnerID", sBusinessPartnerID);

					this.updateInitialModelData();
					this.setApiData();

					var oNavButtonModel = this.getModel("navButtonModel");
					oNavButtonModel.setProperty("/columnLayout", "TwoColumnsBeginExpanded");
				},
			})
		);
	}
);
