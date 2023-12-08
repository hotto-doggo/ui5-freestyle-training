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
	],
	function (BaseController, ValidateHelper, BusinessObjectsModel, formatter, Constants, JSONModel, Fragment, MessageToast) {
		"use strict";

		return BaseController.extend(
			"manage.company.controller.OrganizationStructure",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Controller's "init" lifecycle method.
				 */
				onInit: function () {
					BaseController.prototype.onInit.apply(this, arguments);
					this.oBusinessObjectsModel = new BusinessObjectsModel();

					this.setInitialModels();

					this.getRouter().getRoute("OrganizationStructure").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * Formatter functions object
				 */
				formatter: formatter,

				/**
				 * Set initial view models method
				 */
				setInitialModels: function () {
					var oJSONModel = {
						EmployeeID: null,
						edit: false,
					};

					this.oOrganizationStructureViewModel = new JSONModel(oJSONModel);

					this.setModel(this.oOrganizationStructureViewModel, "organizationStructureModel");
				},

				/**
				 * Set API data function
				 */
				setApiData: async function () {
					try {
						var aVariableNames = ["aDepartments", "aTeams", "aEmployeesData"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.DEPARTMENTS),
							this.oBusinessObjectsModel.loadData(Constants.TEAMS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});
						this.oOrganizationStructureViewModel.setProperty("/allEmployees", this.aEmployeesData);
						this.oOrganizationStructureViewModel.setProperty("/teams", this.aTeams);
						this.oOrganizationStructureViewModel.setProperty("/allDepartments", this.aDepartments);

						this.collapseNodes();
					} catch (oError) {
						console.error(oError);

						MessageToast.show(this.i18n("SomethingWentWrong"));
					}
				},

				/**
				 * "Organization Structure" route pattern matched event handler
				 */
				onPatternMatched: async function () {
					this.setNavButton();

					await this.setApiData();
				},

				/**
				 * Collapse lower levels nodes method
				 */
				collapseNodes: function () {
					var oGraph = this.byId("graph");

					var aNodes = oGraph.getNodes();

					aNodes.forEach((oNode) => {
						var oCtx = oNode.getBindingContext("organizationStructureModel");
						var nId = oCtx.getObject("ID");
						var nBossId = oCtx.getObject("BossID");

						if (nId === nBossId) {
							oNode.setCollapsed(false);
						} else {
							oNode.setCollapsed(true);
						}
					});
				},

				/**
				 * Open Employee details on details button press event handler
				 */
				onSelectionChange: function () {
					var oGraph = this.byId("graph");

					var aNodes = oGraph.getNodes();

					aNodes.forEach((oNode) => {
						oNode.setCollapsed(false);
					});
				},

				/**
				 * Getter function for CustomData
				 *
				 * @param {sap.suite.ui.commons.networkgraph.Node} oNode node object
				 * @param {string} sName key of custom data item
				 */
				getCustomDataValue: function (oNode, sName) {
					var aItems = oNode.getCustomData().filter(function (oData) {
						return oData.getKey() === sName;
					});

					return aItems.length > 0 && aItems[0].getValue();
				},

				/**
				 * Count subordinates method
				 *
				 * @param {sap.suite.ui.commons.networkgraph.Node} oNode graph node
				 *
				 * @returns {number} count of subordinates
				 */
				countSubordinates: function (oNode) {
					var aChildNodes = oNode.getChildNodes();

					var nCount = aChildNodes.length;

					for (var i = 0; i < aChildNodes.length; i++) {
						if (this.getCustomDataValue(oNode, "id") === this.getCustomDataValue(aChildNodes[i], "id")) {
							continue;
						} else {
							return nCount + this.countSubordinates(aChildNodes[i]);
						}
					}

					return nCount;
				},

				/**
				 * Open Employee details on details button press event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onPersonDetailsButtonPress: async function (oEvent) {
					var oSource = oEvent.getSource();

					var oCtx = oSource.getBindingContext("organizationStructureModel");
					var nNodeId = oCtx.getObject("ID");

					var oGraph = this.byId("graph");

					var aNodes = oGraph.getNodes();

					var oNode = aNodes.find((oNode) => {
						var nId = oNode.getBindingContext("organizationStructureModel").getObject("ID");

						return nId === nNodeId;
					});

					var oQuickViewModel = new JSONModel({
						id: this.getCustomDataValue(oNode, "id"),
						fullName: this.getCustomDataValue(oNode, "fullName"),
						role: this.getCustomDataValue(oNode, "role"),
						location: this.getCustomDataValue(oNode, "location"),
						contacts: this.getCustomDataValue(oNode, "contacts"),
						department: this.formatter.formatEntityDataByProperty(this.getCustomDataValue(oNode, "department"), this.aDepartments, "Name"),
						teamId: this.getCustomDataValue(oNode, "teamId"),
						teamSize: oNode.getChildNodes().length,
						subordinatesCount: this.countSubordinates(oNode),
					});

					if (!this.oQuickView) {
						this.oQuickView = await Fragment.load({
							name: "manage.company.view.fragments.EmployeeCard",
							controller: this,
						});
					}

					var oI18nModel = this.getModel("i18n");
					this.oQuickView.setModel(oI18nModel, "i18n");

					this.oQuickView.setModel(oQuickViewModel, "quickViewModel");

					jQuery.sap.delayedCall(0, this, function () {
						this.oQuickView.openBy(oSource);
					});
				},
			})
		);
	}
);
