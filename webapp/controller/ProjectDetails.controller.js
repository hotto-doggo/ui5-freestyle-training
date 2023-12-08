sap.ui.define(
	[
		"manage/company/model/BusinessObjectsModel",
		"manage/company/reuse/BODetails",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast",
		"sap/m/MessageBox",

	],
	function (BusinessObjectsModel, BODetails, ValidateHelper, formatter, Constants, JSONModel, Fragment, MessageToast, MessageBox) {
		"use strict";

		return BODetails.extend(
			"manage.company.controller.ProjectDetails",
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
					relatedEntityName: Constants.REL_EMPLOYEES,
					mainModelName: "mainModel",
					entityId: "/ProjectID",
					entityDataProperty: "/projectData",
					overviewName: "Projects",
					detailsRouteName: "EmployeeDetails",
					detailsRouteId: "EmployeeID",
					deleteText: "DeleteProject",
					pageId: Constants.DETAILS_PAGE_ID,
					editGlobalProperty: "/employeeEdit",
					editFunctionName: "editEntityInfo",
					getDataFunctionName: "getEntityById",
					deleteEntityFunctionName: "deleteEntityById",
					dataPropertyName: "/projectData",
					assignDialogId: Constants.ASSIGN_EMPLOYEE_DIALOG_ID,
					tableBusyProperty: "/employeesBusy",
					mainDataVariableName: "aRelEmployees",
					mainRelationPropertyName: "/rel_Employees",
					assignProjectDialogName: "manage.company.view.fragments.AssignEmployeeDialog",
					tableId: Constants.ENTITIES_TABLE_ID,
					employeesDataPath: ">/rel_Employees",
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.ProjectDetails",
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
								minScreenWidth: "1070px",
								text: this.i18n("Role"),
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

					this.getRouter().getRoute("ProjectDetails").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * Set initial view models method
				 */
				setInitialModels: function () {
					this.setModel(new JSONModel(this.getBusinessObjectViewConfig()), "viewConfig");

					var oJSONModel = {
						ProjectID: null,
						edit: false,
						titleBusy: true,
						headerBusy: true,
						generalInfoBusy: true,
						employeesBusy: true,
						tripsBusy: true,
					};

					this.oProjectDetailsViewModel = new JSONModel(oJSONModel);

					this.setModel(this.oProjectDetailsViewModel, "mainModel");
				},

				/**
				 * Update initial view models with server data method
				 */
				updateInitialModelData: async function () {
					var sProjectID = this.getModel("mainModel").getProperty("/ProjectID");

					try {
						var aVariableNames = ["aProjectData", "aRelEmployees", "aRelTrips", "aProjects"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.getEntityById(this.config.entityName, sProjectID),
							this.oBusinessObjectsModel.loadDataByIdAndRelation(Constants.PROJECTS, sProjectID, Constants.REL_EMPLOYEES),
							this.oBusinessObjectsModel.loadDataByIdAndRelation(Constants.PROJECTS, sProjectID, Constants.REL_BUSINESS_TRIPS),
							this.oBusinessObjectsModel.loadData(Constants.PROJECTS),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						if (this.aProjectData.hasOwnProperty("error")) {
							if (this.aProjectData.error.status === 404) {
								window.history.go(-1);
								return;
							}
						}
						this.oProjectDetailsViewModel.setProperty("/projectData", this.aProjectData);
						this.oProjectDetailsViewModel.setProperty("/rel_Employees", this.aRelEmployees);
						this.oProjectDetailsViewModel.setProperty("/rel_Trips", this.aRelTrips);
						this.oProjectDetailsViewModel.setProperty("/titleBusy", false);
						this.oProjectDetailsViewModel.setProperty("/headerBusy", false);
						this.oProjectDetailsViewModel.setProperty("/generalInfoBusy", false);
						this.oProjectDetailsViewModel.setProperty("/projects", this.aProjects);
						this.oProjectDetailsViewModel.setProperty("/employeesBusy", false);
						this.oProjectDetailsViewModel.setProperty("/skillsBusy", false);
						this.oProjectDetailsViewModel.setProperty("/feedbacksBusy", false);
						this.oProjectDetailsViewModel.setProperty("/tripsBusy", false);
						this.oDialogModel = new JSONModel(this.getInitialDialogObject());
						this.setModel(this.oDialogModel, "dialogModel");
						this.oEditModel = new JSONModel(this.getInitialEditObject(this.aProjectData));
						this.setModel(this.oEditModel, "editModel");
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * Get initial edit model function
				 *
				 * @param {Object} aProjectData project data
				 *
				 * @returns {Object} initial edit model object
				 */
				getInitialEditObject: function (aProjectData) {
					return {
						Name: aProjectData.Name,
						Type: aProjectData.Type,
						Location: aProjectData.Location,
						StartDate: aProjectData.StartDate,
						EndDate: aProjectData.EndDate,
						LeadID: aProjectData.LeadID,
						CustomerID: aProjectData.CustomerID,
						StatusCode: aProjectData.StatusCode,
						password: "lolkek",
					};
				},

				/**
				 * Set API data function
				 */
				setApiData: async function () {
					try {
						var aVariableNames = [
							"aDepartments",
							"aEmployeePositions",
							"aEmployeeLevels",
							"aGenericStatusesEmployee",
							"aGenericStatusesProject",
							"aRoles",
							"aEmployeesData",
							"aBusinessPartners",
							"aAllProjects",
							"aProjectsTypes",
						];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.DEPARTMENTS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_POSITIONS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_LEVELS),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_ROLES),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
							this.oBusinessObjectsModel.loadData(Constants.BUSINESS_PARTNERS),
							this.oBusinessObjectsModel.loadData(Constants.PROJECTS),
							this.oBusinessObjectsModel.loadData(Constants.PROJECT_TYPES),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.aAvailableEmployees = this.deleteAssignedEmployees(this.aEmployeesData);
						this.aGenericStatusesEmployee = this.aGenericStatusesEmployee.filter((oItem) => {
							return oItem.Domain === Constants.PROJECT_LOW_CASE;
						});
						this.aGenericStatusesProject = this.aGenericStatusesProject.filter((oItem) => {
							return oItem.Domain === Constants.PROJECT_LOW_CASE;
						});

						this.oProjectDetailsViewModel.setProperty("/positions", this.aEmployeePositions);
						this.oProjectDetailsViewModel.setProperty("/employees", this.aEmployeesData);
						this.oProjectDetailsViewModel.setProperty("/partners", this.aBusinessPartners);
						this.oProjectDetailsViewModel.setProperty("/departments", this.aDepartments);
						this.oProjectDetailsViewModel.setProperty("/allAttachments", this.aAllAttachments);
						this.oProjectDetailsViewModel.setProperty("/allAvailableEmployees", this.aAvailableEmployees);
						this.oProjectDetailsViewModel.setProperty("/allRoles", this.aRoles);
						this.oProjectDetailsViewModel.setProperty("/allStatuses", this.aGenericStatusesEmployee);
						this.oProjectDetailsViewModel.setProperty("/allStatusesProject", this.aGenericStatusesProject);
						this.oProjectDetailsViewModel.setProperty("/types", this.aProjectsTypes);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * Delete assigned employees function
				 *
				 * @param {Object[]} aAllEmployees array of all existing employees
				 */
				deleteAssignedEmployees: function (aAllEmployees) {
					if (!this.aRelEmployees) {
						return;
					}
					this.aRelEmployees.forEach((oEmployeeItem) => {
						aAllEmployees = aAllEmployees.filter((oAllEmployeesItem) => {
							return oAllEmployeesItem.ID !== oEmployeeItem.ID;
						});
					});
					return aAllEmployees;
				},

				/**
				 * "Project Details" route pattern matched event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onPatternMatched: async function (oEvent) {
					this.setInitialModels();
					this.setNavButton();

					var mRouteArguments = oEvent.getParameter("arguments");

					var sProjectID = mRouteArguments.ProjectID;

					this.oProjectDetailsViewModel.setProperty("/ProjectID", sProjectID);

					await this.updateInitialModelData();
					await this.setApiData();
				},

				/**
				 * Get initial dialog model function
				 *
				 * @returns {Object} initial form model object
				 */
				getInitialDialogObject: function () {
					var sProjectID = this.getModel("mainModel").getProperty("/ProjectID");
					return {
						EmployeeID: null,
						ProjectID: sProjectID,
						Utilization: null,
					};
				},

				/**
				 * Set related data method
				 */
				setAllRelatedData: function () {
					this.aAvailableEmployees = this.deleteAssignedEmployees(this.aAvailableEmployees);
					this.oProjectDetailsViewModel.setProperty("/allAvailableEmployees", this.aAvailableEmployees);
				},

				/**
				 * "Open dialog" button press event handler
				 */
				onAssignProjectPress: async function () {
					var oView = this.getView();

					if (!this.oDialog) {
						this.oDialog = await Fragment.load({
							id: oView.getId(),
							name: this.config.assignProjectDialogName,
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
						onClose: (sButton) => {
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
					if (!this.validateForm(this.config.assignDialogId)) {
						return;
					}

					this.getModel(this.config.mainModelName).setProperty(this.config.tableBusyProperty, true);

					var sEntityID = this.getModel(this.config.mainModelName).getProperty(this.config.entityId);

					var oDialogModel = this.getModel("dialogModel").getData();

					try {
						await this.oBusinessObjectsModel.addEntity(Constants.EMPLOYEE_PROJECTS, oDialogModel);

						this[this.config.mainDataVariableName] = await this.oBusinessObjectsModel.loadDataByIdAndRelation(this.config.entityName, sEntityID, this.config.relatedEntityName);
						this.getModel(this.config.mainModelName).setProperty(this.config.mainRelationPropertyName, this[this.config.mainDataVariableName]);

						this.setAllRelatedData();

						MessageToast.show(this.i18n("SuccessfullyCreated"));
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					this.oDialog.close();

					this.getModel(this.config.mainModelName).setProperty(this.config.tableBusyProperty, false);
				},

				/**
				 * After dialog close event handler
				 */
				onAfterClose: function () {
					this.clearValidationStates(this.config.assignDialogId);

					this.oDialogModel = new JSONModel(this.getInitialDialogObject());
					this.setModel(this.oDialogModel, "dialogModel");
				},
			})
		);
	}
);
