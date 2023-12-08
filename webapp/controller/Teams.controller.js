sap.ui.define(
	[
		"manage/company/controller/BaseController",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/model/BusinessObjectsModel",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
	],
	function (BaseController, ValidateHelper, BusinessObjectsModel, formatter, Constants, JSONModel, Fragment, MessageToast, MessageBox) {
		"use strict";

		return BaseController.extend(
			"manage.company.controller.Teams",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Formatter functions object
				 */
				formatter: formatter,

				/**
				 * Controller's "init" lifecycle method
				 */
				onInit: function () {
					this.getRouter().getRoute("Teams").attachPatternMatched(this.onPatternMatched, this);
					BaseController.prototype.onInit.apply(this, arguments);
				},

				/**
				 * "Teams" route pattern matched event handler
				 */
				onPatternMatched: async function () {
					await this.setInitialModels();
					this.setNavButton();
				},

				/**
				 * Set initial view models method
				 */
				setInitialModels: async function () {
					this.oBusinessObjectsModel = new BusinessObjectsModel();

					var oJSONModel = {
						edit: false,
						tableBusy: true,
						addMemberButtonEnabled: false,
						deleteTeamButtonEnabled: false,
						deleteMemberButtonEnabled: false,
					};

					this.oTeamsViewModel = new JSONModel(oJSONModel);

					this.setModel(this.oTeamsViewModel, "teamsModel");

					try {
						var aVariableNames = ["aDepartments", "aEmployeePositions", "aEmployeesData", "aTeams", "aGenericStatuses"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.DEPARTMENTS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEE_POSITIONS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
							this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.TEAMS, {
								include: ["rel_Employees"],
							}),
							this.oBusinessObjectsModel.loadData(Constants.GENERIC_STATUSES),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.aFlatTeamsStructure = this.createFlatTeamsArray(this.aTeams);

						this.oTeamsViewModel.setProperty("/positions", this.aEmployeePositions);
						this.oTeamsViewModel.setProperty("/departments", this.aDepartments);
						this.oTeamsViewModel.setProperty("/employees", this.aEmployeesData);
						this.oTeamsViewModel.setProperty("/addMemberEmployees", this.aEmployeesData);
						this.oTeamsViewModel.setProperty("/rel_Employees", this.aTeams);
						this.oTeamsViewModel.setProperty("/flatTeamsStructure", this.aFlatTeamsStructure);

						this.oTeamsViewModel.setProperty("/statuses", this.aGenericStatuses);

						this.oTeamsViewModel.setProperty("/tableBusy", false);

						this.setModel(new JSONModel(this.getInitialCreateTeamModel()), "createTeamModel");
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * Create flat teams and related employees array method
				 *
				 * @param {Object[]} aTeams array of teams
				 */
				createFlatTeamsArray: function (aTeams) {
					var aResult = [];
					aTeams.forEach((oItem) => {
						aResult.push(oItem);
						if (oItem.rel_Employees) {
							oItem.rel_Employees.map((oRelation) => {
								oRelation.TeamID = oItem.ID;
								aResult.push(oRelation);
							});
						}
					});

					return aResult;
				},

				/**
				 * Get initial create team form model function
				 *
				 * @returns {Object} initial create team form model object
				 */
				getInitialCreateTeamModel: function () {
					return {
						Name: null,
						LeadID: null,
					};
				},

				/**
				 * Edit button press event handler
				 */
				onEditButtonPress: function () {
					this.oTeamsViewModel.setProperty("/edit", true);
				},

				/**
				 * Cancel edit button press event handler
				 */
				onEditCancelButtonPress: function () {
					this.oTeamsViewModel.setProperty("/edit", false);
				},

				/**
				 * "Open dialog" create team button press event handler.
				 */
				onCreateTeamPress: async function () {
					var oView = this.getView();

					if (!this.oCreateTeamDialog) {
						this.oCreateTeamDialog = await Fragment.load({
							id: oView.getId(),
							name: "manage.company.view.fragments.CreateTeamDialog",
							controller: this,
						});

						oView.addDependent(this.oCreateTeamDialog);
					}

					this.oCreateTeamDialog.open();
				},

				/**
				 * "Cancel" create team button press event handler (in the dialog)
				 */
				onTeamCancelPress: function () {
					MessageBox.confirm(this.i18n("UnsavedData"), {
						onClose: (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								this.oCreateTeamDialog.close();
							}
						},
					});
				},

				/**
				 * "Continue" create team button press event handler (in the dialog)
				 */
				onTeamContinuePress: async function () {
					if (!this.validateForm(Constants.CREATE_TEAM_DIALOG_ID)) {
						return;
					}

					var oDialogModel = this.getModel("createTeamModel").getData();

					this.getModel("teamsModel").setProperty("/tableBusy", true);

					try {
						await this.oBusinessObjectsModel.addEntity(Constants.TEAMS, oDialogModel);

						this.aTeams = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.TEAMS, {
							include: ["rel_Employees"],
						});
						this.oTeamsViewModel.setProperty("/rel_Employees", this.aTeams);
						this.aFlatTeamsStructure = this.createFlatTeamsArray(this.aTeams);
						this.oTeamsViewModel.setProperty("/flatTeamsStructure", this.aFlatTeamsStructure);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					MessageToast.show(this.i18n("SuccessfullyCreated"));

					this.oCreateTeamDialog.close();

					this.getModel("teamsModel").setProperty("/tableBusy", false);
				},

				/**
				 * After dialog close event handler
				 */
				onAfterClose: function () {
					this.clearValidationStates(Constants.CREATE_TEAM_DIALOG_ID);

					this.getModel("createTeamModel").setData(this.getInitialCreateTeamModel());
				},

				/**
				 * Disabling changing buttons method
				 */
				disableChangingButtons: function () {
					this.getModel("teamsModel").setProperty("/addMemberButtonEnabled", false);
					this.getModel("teamsModel").setProperty("/deleteTeamButtonEnabled", false);
					this.getModel("teamsModel").setProperty("/deleteMemberButtonEnabled", false);
				},

				/**
				 * TreeTable row selection event handler
				 */
				onTableCellClick: function () {
					this.disableChangingButtons();

					var oTreeTable = this.byId("TreeTableId");

					var aSelectedItems = oTreeTable.getSelectedIndices();

					for (var i = 0; i < aSelectedItems.length; i++) {
						var nId = aSelectedItems[i];
						var oSelectedRow = this.aFlatTeamsStructure[nId];
						if (oSelectedRow.LeadID) {
							this.getModel("teamsModel").setProperty("/addMemberButtonEnabled", true);
							this.getModel("teamsModel").setProperty("/deleteTeamButtonEnabled", true);
						} else {
							this.getModel("teamsModel").setProperty("/deleteMemberButtonEnabled", true);
						}
					}
				},

				/**
				 * Open "Add member" dialog method
				 */
				openAddMemberDialog: async function () {
					var oView = this.getView();

					if (!this.oAddMemberDialog) {
						this.oAddMemberDialog = await Fragment.load({
							id: oView.getId(),
							name: "manage.company.view.fragments.AddTeamMember",
							controller: this,
						});

						oView.addDependent(this.oAddMemberDialog);
					}

					this.oAddMemberDialog.open();
				},

				/**
				 * "Add member" button press event handler
				 */
				onAddMemberPress: function () {
					var oTreeTable = this.byId("TreeTableId");
					var aSelectedItems = oTreeTable.getSelectedIndices();

					var aRows = [];
					aSelectedItems.forEach((nIndex) => {
						aRows.push(this.aFlatTeamsStructure[nIndex]);
					});

					var aSelectedTeams = aRows.filter((oItem) => {
						return oItem.LeadID !== undefined;
					});

					if (aSelectedTeams.length > 1) {
						MessageToast.show(this.i18n("PleaseSelectOneTeam"));
						return;
					} else {
						this.openAddMemberDialog();
					}
				},

				/**
				 * "Add member" dialog search event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onAddMemberSearch: async function (oEvent) {
					var sInputValue = oEvent.getSource().getValue();
					var oQueryFilter = {
						where: {
							or: [
								{
									FirstName: {
										regexp: `/${sInputValue}/i`,
									},
								},
								{
									LastName: {
										regexp: `/${sInputValue}/i`,
									},
								},
								{
									Location: {
										regexp: `/${sInputValue}/i`,
									},
								},
								{
									Role: {
										regexp: `/${sInputValue}/i`,
									},
								},
							],
						},
					};

					try {
						this.aAddMemberEmployees = await this.oBusinessObjectsModel.getFilteredEntityData(Constants.EMPLOYEES, "?filter=" + JSON.stringify(oQueryFilter));
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					var oTable = this.byId(Constants.ADD_NEW_MEMBER_TABLE_ID);

					oTable.removeSelections(true);

					this.getModel("teamsModel").setProperty("/addMemberEmployees", this.aAddMemberEmployees);
				},

				/**
				 * "Cancel" button press event handler (in the add member dialog)
				 */
				onAddTeamMemberCancelPress: function () {
					MessageBox.confirm(this.i18n("UnsavedData"), {
						onClose: (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								this.oAddMemberDialog.close();
							}
						},
					});
				},

				/**
				 * After add member dialog close event handler
				 */
				onAfterAddTeamDialogClose: function () {
					var oTable = this.byId(Constants.ADD_NEW_MEMBER_TABLE_ID);

					oTable.removeSelections(true);
				},

				/**
				 * Add new member submit button press event handler
				 */
				onAddTeamMemberSubmitPress: async function () {
					var oTreeTable = this.byId("TreeTableId");
					var aSelectedItems = oTreeTable.getSelectedIndices();

					var aRows = [];
					aSelectedItems.forEach((nIndex) => {
						aRows.push(this.aFlatTeamsStructure[nIndex]);
					});

					var oSelectedTeam = aRows.find((oItem) => {
						return oItem.LeadID !== undefined;
					});

					var nTeamId = oSelectedTeam.ID;

					var oTable = this.byId(Constants.ADD_NEW_MEMBER_TABLE_ID);

					try {
						oTable.getSelectedItems().forEach(async (oItem) => {
							var sEmployeeID = oItem.getBindingContext("teamsModel").getObject("ID");

							await this.oBusinessObjectsModel.addEntity(Constants.TEAM_EMPLOYEES, {
								TeamID: nTeamId,
								EmployeeID: sEmployeeID,
							});
						});

						MessageToast.show(this.i18n("EmployeesSuccessfullyAddedIntoTheTeam"));

						this.aTeams = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.TEAMS, {
							include: ["rel_Employees"],
						});
						this.oTeamsViewModel.setProperty("/rel_Employees", this.aTeams);
						this.aFlatTeamsStructure = this.createFlatTeamsArray(this.aTeams);
						this.oTeamsViewModel.setProperty("/flatTeamsStructure", this.aFlatTeamsStructure);
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}

					this.oAddMemberDialog.close();
				},

				/**
				 * "Delete team" button press event handler
				 */
				onDeleteTeamPress: async function () {
					var oTreeTable = this.byId("TreeTableId");
					var aSelectedItems = oTreeTable.getSelectedIndices();

					var aRows = [];
					aSelectedItems.forEach((nIndex) => {
						aRows.push(this.aFlatTeamsStructure[nIndex]);
					});

					var aSelectedTeams = aRows.filter((oItem) => {
						return oItem.LeadID !== undefined;
					});

					if (aSelectedTeams.length > 1) {
						MessageToast.show(this.i18n("PleaseSelectOneTeam"));
						return;
					}

					var oSelectedTeam = aRows.find((oItem) => {
						return oItem.LeadID !== undefined;
					});

					var nTeamId = oSelectedTeam.ID;

					MessageBox.confirm(this.i18n("DeleteTeam"), {
						onClose: async (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								try {
									this.oBusinessObjectsModel.deleteEntityById(Constants.TEAMS, nTeamId);

									MessageToast.show(this.i18n("TeamWasSuccessfullyDeleted"));

									this.aTeams = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.TEAMS, {
										include: ["rel_Employees"],
									});
									this.oTeamsViewModel.setProperty("/rel_Employees", this.aTeams);
									this.aFlatTeamsStructure = this.createFlatTeamsArray(this.aTeams);
									this.oTeamsViewModel.setProperty("/flatTeamsStructure", this.aFlatTeamsStructure);
								} catch (oError) {
									console.error(oError);

									MessageToast.show(this.i18n("SomethingWentWrong"));
								}
							}
						},
					});
				},

				/**
				 * "Delete member" button press event handler
				 */
				onDeleteMemberPress: async function () {
					var oTreeTable = this.byId("TreeTableId");
					var aSelectedItems = oTreeTable.getSelectedIndices();

					var aRows = [];
					aSelectedItems.forEach((nIndex) => {
						aRows.push(this.aFlatTeamsStructure[nIndex]);
					});

					var aSelectedMembers = aRows.filter((oItem) => {
						return oItem.TeamID !== undefined;
					});

					if (aSelectedMembers.length > 1) {
						MessageToast.show(this.i18n("PleaseSelectOneMember"));
						return;
					}

					var oSelectedMember = aRows.find((oItem) => {
						return oItem.TeamID !== undefined;
					});

					var nMemberId = oSelectedMember.ID;
					var nTeamId = oSelectedMember.TeamID;

					var oQueryFilter = {
						where: {
							and: [{ TeamID: nTeamId }, { EmployeeID: nMemberId }],
						},
					};

					var sFilterQuery = "?filter=" + JSON.stringify(oQueryFilter);

					MessageBox.confirm(this.i18n("DeleteMember"), {
						onClose: async (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								try {
									var oTeamEmployeeRelation = await this.oBusinessObjectsModel.getEntitiesRelationId(Constants.TEAM_EMPLOYEES, sFilterQuery);

									for (var i = 0; i < oTeamEmployeeRelation.length; i++) {
										await this.oBusinessObjectsModel.deleteEntityById(Constants.TEAM_EMPLOYEES, oTeamEmployeeRelation[i].ID);
									}

									MessageToast.show(this.i18n("EmployeeWasSuccessfullyDeletedFromTeam"));

									this.aTeams = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.TEAMS, {
										include: ["rel_Employees"],
									});
									this.oTeamsViewModel.setProperty("/rel_Employees", this.aTeams);
									this.aFlatTeamsStructure = this.createFlatTeamsArray(this.aTeams);
									this.oTeamsViewModel.setProperty("/flatTeamsStructure", this.aFlatTeamsStructure);
								} catch (oError) {
									console.error(oError);

									MessageToast.show(this.i18n("SomethingWentWrong"));
								}
							}
						},
					});
				},

				/**
				 * Transfer employee on drag and drop TreeTable event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object.
				 */
				onTableItemDrop: async function (oEvent) {
					var oDraggedItem = oEvent.getParameter("draggedControl");
					var oDroppedItem = oEvent.getParameter("droppedControl");

					var nDraggedItemTeamId = oDraggedItem.getBindingContext("teamsModel").getObject("TeamID");
					var nDraggedItemEmployeeId = oDraggedItem.getBindingContext("teamsModel").getObject("ID");

					if (!oDroppedItem.getBindingContext("teamsModel")) {
						return;
					}

					var nDroppedItemTeamId = oDroppedItem.getBindingContext("teamsModel").getObject("TeamID") || oDroppedItem.getBindingContext("teamsModel").getObject("ID");

					if (nDraggedItemTeamId === nDroppedItemTeamId) {
						return;
					}

					var oQueryFilter = {
						where: {
							and: [{ TeamID: nDraggedItemTeamId }, { EmployeeID: nDraggedItemEmployeeId }],
						},
					};

					var sFilterQuery = "?filter=" + JSON.stringify(oQueryFilter);

					MessageBox.confirm(this.i18n("TransferMemberInTheOtherTeam"), {
						onClose: async (sButton) => {
							if (sButton === MessageBox.Action.OK) {
								try {
									var oTeamEmployeeRelation = await this.oBusinessObjectsModel.getEntitiesRelationId(Constants.TEAM_EMPLOYEES, sFilterQuery);

									console.log(oTeamEmployeeRelation);

									await this.oBusinessObjectsModel.deleteEntityById(Constants.TEAM_EMPLOYEES, oTeamEmployeeRelation[0].ID);

									await this.oBusinessObjectsModel.addEntity(Constants.TEAM_EMPLOYEES, {
										TeamID: nDroppedItemTeamId,
										EmployeeID: nDraggedItemEmployeeId,
									});

									MessageToast.show(this.i18n("EmployeeWasSuccessfullyDeletedFromTeam"));

									this.aTeams = await this.oBusinessObjectsModel.loadDataWithInnerRelatedEntities(Constants.TEAMS, {
										include: ["rel_Employees"],
									});
									this.oTeamsViewModel.setProperty("/rel_Employees", this.aTeams);
									this.aFlatTeamsStructure = this.createFlatTeamsArray(this.aTeams);
									this.oTeamsViewModel.setProperty("/flatTeamsStructure", this.aFlatTeamsStructure);
								} catch (oError) {
									console.error(oError);

									MessageToast.show(this.i18n("SomethingWentWrong"));
								}
							}
						},
					});
				},
			})
		);
	}
);
