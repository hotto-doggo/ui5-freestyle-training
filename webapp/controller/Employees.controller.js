sap.ui.define(
	[
		"manage/company/reuse/BOOverview",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/model/BusinessObjectsModel",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
	],
	function (BOOverview, ValidateHelper, BusinessObjectsModel, formatter, Constants, JSONModel, MessageToast) {
		"use strict";

		return BOOverview.extend(
			"manage.company.controller.Employees",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Formatter functions object
				 */
				formatter: formatter,

				/**
				 * Configurations
				 */
				config: {
					entityName: Constants.EMPLOYEES,
					mainModelName: "mainModel",
					dialogFragmentName: "manage.company.view.fragments.EmployeeDialog",
					detailsRouteName: "EmployeeDetails",
					detailsRouteId: "EmployeeID",
					dialogId: Constants.EMPLOYEE_DIALOG_ID,
					addingFunctionName: "addEntity",
					filteringFunctionName: "getFilteredEntityData",
					tableId: Constants.ENTITIES_TABLE_ID,
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.Employees",
						columns: [
							{
								minScreenWidth: "Large",
								text: this.i18n("FullName"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Department"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Position"),
							},
							{
								minScreenWidth: "890px",
								text: this.i18n("Level"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("Role"),
							},
							{
								minScreenWidth: "1270px",
								text: this.i18n("Location"),
							},
							{
								minScreenWidth: "1500px",
								text: this.i18n("EnglishLevel"),
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

					this.getRouter().getRoute("Employees").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * "Employees" route pattern matched event handler
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
						var aVariableNames = ["aEmployeesData", "aDepartments", "aGenericStatuses", "aEmployeeLevels", "aLanguageLevels", "aSkills", "aEmployeePositions", "aRoles"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
							this.oBusinessObjectsModel.loadData(Constants.DEPARTMENTS),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_LEVELS),
							this.oBusinessObjectsModel.loadData(Constants.LANGUAGE_LEVELS),
							this.oBusinessObjectsModel.loadData(Constants.SKILLS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_POSITIONS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_ROLES),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.aGenericStatuses = this.aGenericStatuses.filter((oItem) => {
							return oItem.Domain === Constants.EMPLOYEE_LOW_CASE;
						});
						var oJSONModel = {
							busy: false,
							data: this.aEmployeesData,
							dataLength: this.aEmployeesData.length,
							departments: this.aDepartments,
							statuses: this.aGenericStatuses,
							levels: this.aEmployeeLevels,
							languageLevels: this.aLanguageLevels,
							skills: this.aSkills,
							positions: this.aEmployeePositions,
							roles: this.aRoles,
						};
						this.oEmployeesViewModel = new JSONModel(oJSONModel);
						this.setModel(this.oEmployeesViewModel, "mainModel");
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
						LastName: null,
						StatusCode: null,
						DepartmentID: null,
						Location: null,
						LevelID: null,
						EnglishLevel: null,
					};
				},

				/**
				 * Get initial dialog model function
				 *
				 * @returns {Object} initial dialog model object
				 */
				getInitialDialogObject: function () {
					return {
						FirstName: null,
						LastName: null,
						BirthDate: null,
						Location: null,
						RecruitmentDate: new Date(),
						StatusCode: null,
						WorkExperience: null,
						Contacts: null,
						BossID: null,
						DepartmentID: null,
						PositionID: null,
						LevelID: null,
						Role: "Employee",
						EnglishLevel: null,
						GermanLevel: null,
					};
				},
			})
		);
	}
);
