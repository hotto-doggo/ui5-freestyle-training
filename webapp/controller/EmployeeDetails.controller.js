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
			"manage.company.controller.EmployeeDetails",
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
					relatedEntityName: Constants.REL_PROJECTS,
					mainModelName: "mainModel",
					entityId: "/EmployeeID",
					entityDataProperty: "/employeeData",
					overviewName: "Employees",
					detailsRouteName: "ProjectDetails",
					detailsRouteId: "ProjectID",
					deleteText: "DeleteEmployee",
					pageId: Constants.DETAILS_PAGE_ID,
					editGlobalProperty: "/employeeEdit",
					editFunctionName: "editEntityInfo",
					getDataFunctionName: "getEntityById",
					deleteEntityFunctionName: "deleteEntityById",
					dataPropertyName: "/employeeData",
					assignDialogId: Constants.ASSIGN_PROJECT_DIALOG_ID,
					tableBusyProperty: "/projectsBusy",
					mainDataVariableName: "aProjects",
					mainRelationPropertyName: "/projects",
					assignProjectDialogName: "manage.company.view.fragments.AssignProjectDialog",
					tableId: Constants.ENTITIES_TABLE_ID,
					projectsDataPath: ">/projects",
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.EmployeeDetails",
						columns: [
							{
								minScreenWidth: "Large",
								text: this.i18n("ProjectName"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Type"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Location"),
							},
							{
								minScreenWidth: "890px",
								text: this.i18n("Status"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("StartDate"),
							},
							{
								minScreenWidth: "1270px",
								text: this.i18n("EndDate"),
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

					this.getRouter().getRoute("EmployeeDetails").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * Set initial view models method
				 */
				setInitialModels: async function () {
					this.setModel(new JSONModel(this.getBusinessObjectViewConfig()), "viewConfig");

					var oJSONModel = {
						EmployeeID: null,
						edit: false,
						titleBusy: true,
						headerBusy: true,
						generalInfoBusy: true,
						projectsBusy: true,
						skillsBusy: true,
						feedbacksBusy: true,
						attachmentsBusy: true,
					};

					this.oEmployeeDetailsViewModel = new JSONModel(oJSONModel);

					this.setModel(this.oEmployeeDetailsViewModel, "mainModel");
				},

				/**
				 * Update initial view models with server data method
				 */
				updateInitialModelData: async function () {
					var sEmployeeID = this.getModel("mainModel").getProperty("/EmployeeID");

					try {
						var aVariableNames = ["aEmployeeData", "aProjects", "aSkills", "aFeedbacks", "aAttachments"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.getEntityById(this.config.entityName, sEmployeeID),
							this.oBusinessObjectsModel.loadDataByIdAndRelation(Constants.EMPLOYEES, sEmployeeID, Constants.REL_PROJECTS),
							this.oBusinessObjectsModel.getEmployeeSkillsByID(sEmployeeID),
							this.oBusinessObjectsModel.getFilteredEntityFeedbacks(Constants.EMPLOYEE_FEEDBACKS, sEmployeeID),
							this.oBusinessObjectsModel.loadDataByIdAndRelation(Constants.EMPLOYEES, sEmployeeID, Constants.REL_EMPLOYEE_ATTACHMENTS),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						if (this.aEmployeeData.hasOwnProperty("error")) {
							if (this.aEmployeeData.error.status === 404) {
								window.history.go(-1);
								return;
							}
						}
						this.oEmployeeDetailsViewModel.setProperty("/employeeData", this.aEmployeeData);
						this.oEmployeeDetailsViewModel.setProperty("/titleBusy", false);
						this.oEmployeeDetailsViewModel.setProperty("/headerBusy", false);
						this.oEmployeeDetailsViewModel.setProperty("/generalInfoBusy", false);
						this.oEmployeeDetailsViewModel.setProperty("/projects", this.aProjects);
						this.oEmployeeDetailsViewModel.setProperty("/projectsBusy", false);
						this.oEmployeeDetailsViewModel.setProperty("/skills", this.aSkills);
						this.oEmployeeDetailsViewModel.setProperty("/skillsBusy", false);
						this.oEmployeeDetailsViewModel.setProperty("/feedbacks", this.aFeedbacks);
						this.oEmployeeDetailsViewModel.setProperty("/feedbacksBusy", false);
						var nAverageRating = 0;
						this.aFeedbacks.forEach((oItem) => {
							nAverageRating += oItem.Rating;
						});
						nAverageRating = nAverageRating / this.aFeedbacks.length / 2;
						this.oEmployeeDetailsViewModel.setProperty("/averageRating", nAverageRating);
						this.oEmployeeDetailsViewModel.setProperty("/attachments", this.aAttachments);
						this.oEmployeeDetailsViewModel.setProperty("/attachmentsCount", this.aAttachments.length);
						this.oEmployeeDetailsViewModel.setProperty("/attachmentsBusy", false);
						this.oFeedbackModel = new JSONModel(this.getInitialFeedbackObject());
						this.setModel(this.oFeedbackModel, "feedbackModel");
						this.oDialogModel = new JSONModel(this.getInitialDialogObject());
						this.setModel(this.oDialogModel, "dialogModel");
						this.oEditModel = new JSONModel(this.getInitialEditObject(this.aEmployeeData));
						this.setModel(this.oEditModel, "editModel");
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * Get initial edit model function
				 *
				 * @returns {Object} initial edit model object
				 */
				getInitialEditObject: function (aEmployeeData) {
					return {
						PositionID: aEmployeeData.PositionID,
						Contacts: aEmployeeData.Contacts,
						StatusCode: aEmployeeData.StatusCode,
						WorkExperience: aEmployeeData.WorkExperience,
						Location: aEmployeeData.Location,
						BossID: aEmployeeData.BossID,
						Role: aEmployeeData.Role,
						DepartmentID: aEmployeeData.DepartmentID,
						BirthDate: aEmployeeData.BirthDate,
						EnglishLevel: aEmployeeData.EnglishLevel,
						GermanLevel: aEmployeeData.GermanLevel,
						email: aEmployeeData.email,
						FirstName: aEmployeeData.FirstName,
						LastName: aEmployeeData.LastName,
						RecruitmentDate: aEmployeeData.RecruitmentDate,
						LevelID: aEmployeeData.LevelID,
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
							"aLanguageLevels",
							"aAllSkills",
							"aRoles",
							"aEmployeesData",
							"aSkillsLevels",
							"aAllAttachments",
							"aAllProjects",
						];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.DEPARTMENTS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_POSITIONS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_LEVELS),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
							this.oBusinessObjectsModel.loadData(Constants.LANGUAGE_LEVELS),
							this.oBusinessObjectsModel.loadData(Constants.SKILLS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_ROLES),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
							this.oBusinessObjectsModel.loadData(Constants.SKILLS_LEVELS),
							this.oBusinessObjectsModel.loadData(Constants.ATTACHMENTS),
							this.oBusinessObjectsModel.loadData(Constants.PROJECTS),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.aGenericStatusesProject = this.aGenericStatusesProject.filter((oItem) => {
							return oItem.Domain === Constants.PROJECT_LOW_CASE;
						});
						this.aGenericStatusesEmployee = this.aGenericStatusesEmployee.filter((oItem) => {
							return oItem.Domain === Constants.EMPLOYEE_LOW_CASE;
						});
						this.aAllProjects = this.deleteAssignedProjects(this.aAllProjects);

						this.oEmployeeDetailsViewModel.setProperty("/allPositions", this.aEmployeePositions);

						this.oEmployeeDetailsViewModel.setProperty("/allEmployees", this.aEmployeesData);
						this.oEmployeeDetailsViewModel.setProperty("/allDepartments", this.aDepartments);
						this.oEmployeeDetailsViewModel.setProperty("/allSkills", this.aAllSkills);
						this.oEmployeeDetailsViewModel.setProperty("/skillsLevels", this.aSkillsLevels);
						this.oEmployeeDetailsViewModel.setProperty("/allAttachments", this.aAllAttachments);
						this.oEmployeeDetailsViewModel.setProperty("/allProjects", this.aAllProjects);
						this.oEmployeeDetailsViewModel.setProperty("/allRoles", this.aRoles);
						this.oEmployeeDetailsViewModel.setProperty("/languageLevels", this.aLanguageLevels);
						this.oEmployeeDetailsViewModel.setProperty("/allStatuses", this.aGenericStatusesEmployee);
						this.oEmployeeDetailsViewModel.setProperty("/allStatusesProject", this.aGenericStatusesProject);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * Delete assigned projects function
				 *
				 * @param {Object[]} aAllProjects array of all existing projects
				 */
				deleteAssignedProjects: function (aAllProjects) {
					this.aProjects.forEach((oEmployeeProjectItem) => {
						aAllProjects = aAllProjects.filter((oAllProjectsItem) => {
							return oAllProjectsItem.ID !== oEmployeeProjectItem.ID;
						});
					});
					return aAllProjects;
				},

				/**
				 * "Employee Details" route pattern matched event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onPatternMatched: async function (oEvent) {
					this.setInitialModels();
					this.setNavButton();

					var mRouteArguments = oEvent.getParameter("arguments");

					var sEmployeeID = mRouteArguments.EmployeeID;

					this.oEmployeeDetailsViewModel.setProperty("/EmployeeID", sEmployeeID);

					await this.updateInitialModelData();
					await this.setApiData();
				},

				/**
				 * Get initial feedback form model function
				 *
				 * @returns {Object} initial form model object
				 */
				getInitialFeedbackObject: function () {
					var sEmployeeID = this.getModel("mainModel").getProperty("/EmployeeID");

					return {
						Text: null,
						Date: new Date(),
						Rating: null,
						AuthorID: 1,
						EmployeeID: sEmployeeID,
					};
				},

				/**
				 * Get initial dialog model function
				 *
				 * @returns {Object} initial form model object
				 */
				getInitialDialogObject: function () {
					var sEmployeeID = this.getModel("mainModel").getProperty("/EmployeeID");
					return {
						EmployeeID: sEmployeeID,
						ProjectID: null,
						Utilization: null,
					};
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

				/**
				 * On feedback post add function
				 *
				 * @returns {Object} server response
				 */
				onFeedbackPost: async function () {
					this.getModel("mainModel").setProperty("/feedbacksBusy", true);

					var sEmployeeID = this.getModel("mainModel").getProperty("/EmployeeID");

					var oFeedbackModel = this.getModel("feedbackModel");

					var oBody = oFeedbackModel.getData();

					oBody.Rating *= 2;

					try {
						await this.oBusinessObjectsModel.addEntity(Constants.EMPLOYEE_FEEDBACKS, oBody);
						this.aFeedbacks = await this.oBusinessObjectsModel.getFilteredEntityFeedbacks(Constants.EMPLOYEE_FEEDBACKS, sEmployeeID);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					this.oEmployeeDetailsViewModel.setProperty("/feedbacks", this.aFeedbacks);

					this.getModel("mainModel").setProperty("/feedbacksBusy", false);

					this.clearFeedbackInput(oFeedbackModel);
				},

				/**
				 * Clear feedback inputs function
				 *
				 * @param {sap.ui.model.JSONModel} oFeedbackModel object of model
				 */
				clearFeedbackInput: function (oFeedbackModel) {
					oFeedbackModel.setData(this.getInitialFeedbackObject());
				},

				/**
				 * Set related data method
				 */
				setAllRelatedData: function () {
					this.aAllProjects = this.deleteAssignedProjects(this.aAllProjects);
					this.oEmployeeDetailsViewModel.setProperty("/allProjects", this.aAllProjects);
				},
			})
		);
	}
);
