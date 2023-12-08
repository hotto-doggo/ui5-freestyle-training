sap.ui.define(
	[
		"manage/company/reuse/BOOverview",
		"manage/company/controller/mixin/ValidateHelper.mixin",
		"manage/company/model/BusinessObjectsModel",
		"manage/company/utils/formatter",
		"manage/company/utils/Constants",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
	],
	function (BOOverview, ValidateHelper, BusinessObjectsModel, formatter, Constants, JSONModel, Fragment, MessageToast, MessageBox) {
		"use strict";

		return BOOverview.extend(
			"manage.company.controller.BusinessTrips",
			jQuery.extend({}, ValidateHelper, {
				/**
				 * Formatter functions object
				 */
				formatter: formatter,

				/**
				 * Configurations
				 */
				config: {
					entityName: Constants.BUSINESS_TRIPS,
					mainModelName: "mainModel",
					dialogFragmentName: "manage.company.view.fragments.BusinessTripsDialog",
					dialogId: Constants.BUSINESS_TRIP_DIALOG_ID,
					addingFunctionName: "addEntity",
					filteringFunctionName: "getFilteredEntityData",
					tableId: Constants.ENTITIES_TABLE_ID,
					deleteText: "DeleteBusinessTrip",
					deleteEntityFunctionName: "deleteEntityById",
				},

				/**
				 * View config
				 */
				getBusinessObjectViewConfig: function () {
					return {
						controllerName: "manage.company.controller.BusinessTrips",
						columns: [
							{
								minScreenWidth: "Large",
								text: this.i18n("Employee"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Project"),
							},
							{
								minScreenWidth: "Large",
								text: this.i18n("Timeline"),
							},
							{
								minScreenWidth: "890px",
								text: this.i18n("FromTo"),
							},
							{
								minScreenWidth: "1070px",
								text: this.i18n("Aim"),
							},
							{
								minScreenWidth: "1070px",
								text: "",
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

					this.getRouter().getRoute("BusinessTrips").attachPatternMatched(this.onPatternMatched, this);
				},

				/**
				 * "Business Trips" route pattern matched event handler
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

					var oJSONModel = {
						busy: true,
					};

					this.oProjectsViewModel = new JSONModel(oJSONModel);
					this.setModel(this.oProjectsViewModel, "mainModel");

					this.oBusinessObjectsModel = new BusinessObjectsModel();

					try {
						var aVariableNames = ["aBusinessTrips", "aProjectsData", "aBusinessPartners", "aEmployeesData"];

						var aResponses = await Promise.all([
							this.oBusinessObjectsModel.loadData(Constants.BUSINESS_TRIPS),
							this.oBusinessObjectsModel.loadData(Constants.PROJECTS),
							this.oBusinessObjectsModel.loadData(Constants.BUSINESS_PARTNERS),
							this.oBusinessObjectsModel.loadData(Constants.EMPLOYEES),
						]);

						aResponses.forEach((aResponse, nIndex) => {
							this[aVariableNames[nIndex]] = aResponse;
						});

						this.aLocations = this.getLocationsDistinct(this.aBusinessTrips);

						this.aCoordinates = [
							{ Location: "United States of America", lat: undefined, lon: undefined },
							{ Location: "Cote d'Ivoire", lat: 7.568978, lon: -5.495164 },
							{ Location: "Thailand", lat: 15.512883, lon: 101.301707 },
							{ Location: "Norway", lat: 61.356908, lon: 9.680372 },
							{ Location: "Myanmar", lat: undefined, lon: undefined },
							{ Location: "Martinique", lat: undefined, lon: undefined },
							{ Location: "Montserrat", lat: 16.73717, lon: -62.188252 },
							{ Location: "Falkland Islands (Malvinas)", lat: -51.651514, lon: -58.738304 },
							{ Location: "Qatar", lat: 25.208492, lon: 51.155983 },
							{ Location: "Saint Barthelemy", lat: 17.900616, lon: -62.825749 },
							{ Location: "Bosnia and Herzegovina", lat: 44.091039, lon: 18.06843 },
							{ Location: "Burundi", lat: undefined, lon: undefined },
							{ Location: "Gabon", lat: -0.586328, lon: 11.547829 },
							{ Location: "Tanzania", lat: -5.869032, lon: 34.800732 },
							{ Location: "Sweden", lat: undefined, lon: undefined },
							{ Location: "Christmas Island", lat: -10.489789, lon: 105.642556 },
							{ Location: "Cameroon", lat: 4.585076, lon: 12.473672 },
							{ Location: "Hungary", lat: 47.086857, lon: 19.447899 },
							{ Location: "Isle of Man", lat: 54.255204, lon: -4.49708 },
							{ Location: "Bouvet Island (Bouvetoya)", lat: undefined, lon: undefined },
							{ Location: "Kazakhstan", lat: 48.51667, lon: 66.76667 },
							{ Location: "Liechtenstein", lat: 47.111405, lon: 9.559439 },
							{ Location: "Turks and Caicos Islands", lat: 21.81663, lon: -71.752704 },
							{ Location: "Holy See (Vatican City State)", lat: 41.903542, lon: 12.453083 },
							{ Location: "Slovenia", lat: 46.068735, lon: 14.932759 },
							{ Location: "Lebanon", lat: undefined, lon: undefined },
							{ Location: "Bolivia", lat: undefined, lon: undefined },
							{ Location: "Svalbard & Jan Mayen Islands", lat: undefined, lon: undefined },
							{ Location: "Egypt", lat: 26.42231, lon: 29.227089 },
							{ Location: "Benin", lat: 9.30769, lon: 2.31583 },
							{ Location: "United Kingdom", lat: 52.418788, lon: -1.247349 },
							{ Location: "Guinea-Bissau", lat: undefined, lon: undefined },
							{ Location: "Guinea", lat: 10.625075, lon: -9.951975 },
							{ Location: "Georgia", lat: 41.870087, lon: 43.735725 },
							{ Location: "Namibia", lat: -20.586347, lon: 17.119649 },
							{ Location: "Democratic People's Republic of Korea", lat: 40.248916, lon: 126.699424 },
							{ Location: "Australia", lat: undefined, lon: undefined },
							{ Location: "Slovakia (Slovak Republic)", lat: 48.752408, lon: 19.201811 },
							{ Location: "Saint Vincent and the Grenadines", lat: 13.23357, lon: -61.199573 },
							{ Location: "Greece", lat: 39.78331, lon: 21.708535 },
							{ Location: "Lithuania", lat: 55.103703, lon: 24.089932 },
							{ Location: "Mexico", lat: undefined, lon: undefined },
							{ Location: "Belize", lat: 17.206637, lon: -88.714488 },
							{ Location: "Vietnam", lat: 21.732568, lon: 105.396672 },
							{ Location: "Tonga", lat: -21.230852, lon: -175.14127 },
							{ Location: "Uruguay", lat: -32.48333, lon: -53.51667 },
							{ Location: "Wallis and Futuna", lat: -14.289278, lon: -178.140953 },
							{ Location: "Angola", lat: -12.180859, lon: 17.996347 },
							{ Location: "Lao People's Democratic Republic", lat: 19.43535, lon: 102.560667 },
							{ Location: "New Caledonia", lat: -21.097317, lon: 165.127202 },
							{ Location: "Micronesia", lat: 6.881557, lon: 158.221135 },
							{ Location: "Jordan", lat: 30.802264, lon: 36.391527 },
							{ Location: "Antarctica (the territory South of 60 deg S)", lat: -79.843222, lon: 35.885456 },
							{ Location: "India", lat: 22.364293, lon: 79.029432 },
							{ Location: "Ghana", lat: 7.85125, lon: -0.982714 },
							{ Location: "Marshall Islands", lat: undefined, lon: undefined },
							{ Location: "Bhutan", lat: 27.454772, lon: 89.92561 },
							{ Location: "Saint Pierre and Miquelon", lat: 47.042405, lon: -56.34943 },
							{ Location: "Bermuda", lat: 32.296698, lon: -64.764346 },
							{ Location: "Virgin Islands, U.S.", lat: 17.73951, lon: -64.783592 },
							{ Location: "Burkina Faso", lat: 12.655182, lon: -1.473625 },
							{ Location: "Haiti", lat: undefined, lon: undefined },
							{ Location: "Ecuador", lat: -1.241567, lon: -78.322784 },
							{ Location: "Netherlands Antilles", lat: 52.554205, lon: 5.501896 },
							{ Location: "Tunisia", lat: 33.687264, lon: 9.007775 },
							{ Location: "Cuba", lat: undefined, lon: undefined },
							{ Location: "Nicaragua", lat: 12.793313, lon: -85.039545 },
							{ Location: "Saint Lucia", lat: undefined, lon: undefined },
							{ Location: "Guernsey", lat: 49.454813, lon: -2.566659 },
							{ Location: "Zimbabwe", lat: -20.26667, lon: 30.91667 },
							{ Location: "Czech Republic", lat: 49.88233, lon: 15.377705 },
							{ Location: "Panama", lat: 8.72491, lon: -80.338454 },
							{ Location: "Mongolia", lat: 45.99339, lon: 104.159557 },
							{ Location: "Malta", lat: 35.888972, lon: 14.431432 },
							{ Location: "Yemen", lat: 15.328226, lon: 45.874382 },
							{ Location: "France", lat: 46.698481, lon: 2.549047 },
							{ Location: "French Polynesia", lat: -17.642803, lon: -149.443883 },
							{ Location: "Denmark", lat: undefined, lon: undefined },
							{ Location: "Argentina", lat: undefined, lon: undefined },
							{ Location: "Sierra Leone", lat: 8.616007, lon: -11.756202 },
							{ Location: "Dominican Republic", lat: 19.105937, lon: -70.804224 },
							{ Location: "Latvia", lat: 57.06689, lon: 25.458464 },
							{ Location: "Finland", lat: 63.252357, lon: 27.276469 },
							{ Location: "Mali", lat: 18.683211, lon: -2.015109 },
							{ Location: "Mauritania", lat: 19.599264, lon: -9.737341 },
							{ Location: "Israel", lat: 30.895128, lon: 34.874702 },
							{ Location: "Chile", lat: -38.165295, lon: -72.288079 },
							{ Location: "Bahamas", lat: 24.669637, lon: -78.018505 },
							{ Location: "Libyan Arab Jamahiriya", lat: 26.666955, lon: 18.030248 },
							{ Location: "Somalia", lat: undefined, lon: undefined },
							{ Location: "Syrian Arab Republic", lat: 35.00845, lon: 38.288461 },
							{ Location: "Oman", lat: 22.113181, lon: 57.34568 },
							{ Location: "Paraguay", lat: -21.686079, lon: -60.13994 },
							{ Location: "Cayman Islands", lat: 19.319996, lon: -81.230744 },
							{ Location: "Croatia", lat: undefined, lon: undefined },
							{ Location: "Iran", lat: 31.931398, lon: 55.245317 },
							{ Location: "Papua New Guinea", lat: -5.695438, lon: 143.910495 },
							{ Location: "Indonesia", lat: -1.003189, lon: 101.972332 },
							{ Location: "Montenegro", lat: 42.782845, lon: 19.157424 },
							{ Location: "Anguilla", lat: 18.232135, lon: -63.042295 },
							{ Location: "Peru", lat: undefined, lon: undefined },
							{ Location: "Uzbekistan", lat: 37.23583, lon: 67.31111 },
							{ Location: "Rwanda", lat: -1.89815, lon: 30.095066 },
							{ Location: "Seychelles", lat: -4.681046, lon: 55.482794 },
							{ Location: "Mauritius", lat: -20.321973, lon: 57.534935 },
							{ Location: "Cocos (Keeling) Islands", lat: -12.002, lon: 96.8785 },
							{ Location: "Mozambique", lat: -15.03417, lon: 40.73583 },
							{ Location: "Belarus", lat: 53.832259, lon: 28.43651 },
							{ Location: "Western Sahara", lat: 23.966331, lon: -12.630321 },
							{ Location: "Bahrain", lat: 26.0845, lon: 50.550672 },
							{ Location: "Nauru", lat: -0.520261, lon: 166.932644 },
							{ Location: "Ethiopia", lat: 7.996115, lon: 38.896778 },
							{ Location: "Jamaica", lat: 18.137123, lon: -77.318767 },
							{ Location: "Vanuatu", lat: -15.388977, lon: 166.885687 },
							{ Location: "Pakistan", lat: 29.329836, lon: 68.560265 },
							{ Location: "Reunion", lat: undefined, lon: undefined },
							{ Location: "New Zealand", lat: -45.175323, lon: 169.232531 },
							{ Location: "Afghanistan", lat: 34.159326, lon: 66.51551 },
							{ Location: "Andorra", lat: 42.547076, lon: 1.576286 },
							{ Location: "Equatorial Guinea", lat: 1.586111, lon: 10.464682 },
							{ Location: "Zambia", lat: -14.936526, lon: 25.940824 },
							{ Location: "Faroe Islands", lat: 62.185604, lon: -7.058429 },
							{ Location: "American Samoa", lat: undefined, lon: undefined },
							{ Location: "Venezuela", lat: 7.18646, lon: -64.568705 },
							{ Location: "Romania", lat: undefined, lon: undefined },
							{ Location: "Niue", lat: -19.051266, lon: -169.860489 },
							{ Location: "Brazil", lat: -11.928923, lon: -49.542449 },
							{ Location: "Central African Republic", lat: 6.986429, lon: 21.668827 },
							{ Location: "El Salvador", lat: 13.66845, lon: -89.27004 },
							{ Location: "Austria", lat: 47.522617, lon: 14.143702 },
							{ Location: "Samoa", lat: -13.63914, lon: -172.438241 },
							{ Location: "Moldova", lat: 47.435, lon: 28.487904 },
							{ Location: "Gambia", lat: 13.505929, lon: -15.362493 },
							{ Location: "Algeria", lat: 27.89689, lon: 3.379277 },
							{ Location: "Singapore", lat: undefined, lon: undefined },
							{ Location: "Republic of Korea", lat: undefined, lon: undefined },
							{ Location: "Hong Kong", lat: 22.381131, lon: 114.135572 },
							{ Location: "Iraq", lat: 33.115715, lon: 43.285188 },
							{ Location: "Puerto Rico", lat: 18.234668, lon: -66.481065 },
							{ Location: "Costa Rica", lat: 10.068183, lon: -84.028584 },
							{ Location: "Botswana", lat: -22.108313, lon: 24.191388 },
							{ Location: "Sri Lanka", lat: 7.622919, lon: 80.68822 },
							{ Location: "Suriname", lat: undefined, lon: undefined },
							{ Location: "Eritrea", lat: 15.817362, lon: 38.267404 },
							{ Location: "Sudan", lat: undefined, lon: undefined },
							{ Location: "Pitcairn Islands", lat: -24.364576, lon: -128.317536 },
							{ Location: "Turkmenistan", lat: 40.46971, lon: 62.21379 },
							{ Location: "Nigeria", lat: undefined, lon: undefined },
							{ Location: "Guadeloupe", lat: 16.24988, lon: -61.58365 },
							{ Location: "Guam", lat: undefined, lon: undefined },
							{ Location: "Russian Federation", lat: 63.314401, lon: 93.884016 },
							{ Location: "United States Minor Outlying Islands", lat: 19.285663, lon: 166.644535 },
							{ Location: "Brunei Darussalam", lat: undefined, lon: undefined },
							{ Location: "Portugal", lat: undefined, lon: undefined },
							{ Location: "Albania", lat: 40.647186, lon: 20.127352 },
							{ Location: "Monaco", lat: 43.733783, lon: 7.418464 },
							{ Location: "Cyprus", lat: 34.881852, lon: 33.011051 },
							{ Location: "China", lat: 32.529718, lon: 106.802874 },
							{ Location: "Turkey", lat: undefined, lon: undefined },
							{ Location: "Saint Kitts and Nevis", lat: 17.340311, lon: -62.767596 },
							{ Location: "Jersey", lat: 49.224297, lon: -2.130418 },
							{ Location: "Palestinian Territory", lat: 32.132392, lon: 35.262925 },
							{ Location: "Chad", lat: 15.21002, lon: 18.76924 },
							{ Location: "Timor-Leste", lat: -8.801828, lon: 125.866054 },
							{ Location: "Nepal", lat: 27.15, lon: 85.9 },
							{ Location: "Belgium", lat: undefined, lon: undefined },
							{ Location: "Barbados", lat: undefined, lon: undefined },
							{ Location: "Djibouti", lat: 11.58901, lon: 43.14503 },
							{ Location: "Saint Martin", lat: undefined, lon: undefined },
							{ Location: "Macedonia", lat: 41.569245, lon: 21.547313 },
							{ Location: "Netherlands", lat: 52.554205, lon: 5.501896 },
							{ Location: "Mayotte", lat: undefined, lon: undefined },
							{ Location: "Lesotho", lat: undefined, lon: undefined },
							{ Location: "Italy", lat: 45.003229, lon: 11.083693 },
							{ Location: "Greenland", lat: 74.319379, lon: -39.335081 },
							{ Location: "Northern Mariana Islands", lat: 15.193315, lon: 145.748209 },
							{ Location: "Bulgaria", lat: undefined, lon: undefined },
							{ Location: "Colombia", lat: undefined, lon: undefined },
							{ Location: "Tajikistan", lat: 38.185311, lon: 72.571946 },
							{ Location: "Saudi Arabia", lat: undefined, lon: undefined },
							{ Location: "Poland", lat: 51.99605, lon: 19.488789 },
							{ Location: "Azerbaijan", lat: 40.402387, lon: 47.210994 },
							{ Location: "Kuwait", lat: 29.422226, lon: 47.330015 },
							{ Location: "Gibraltar", lat: undefined, lon: undefined },
							{ Location: "Senegal", lat: undefined, lon: undefined },
							{ Location: "Kiribati", lat: 1.828988, lon: -157.373327 },
							{ Location: "French Guiana", lat: 3.999143, lon: -53.068214 },
							{ Location: "Aruba", lat: 12.517399, lon: -69.972795 },
							{ Location: "Uganda", lat: 0.90406, lon: 32.443764 },
							{ Location: "Sao Tome and Principe", lat: 0.252119, lon: 6.600203 },
							{ Location: "Solomon Islands", lat: -8.078523, lon: 159.243596 },
							{ Location: "Saint Helena", lat: -15.961264, lon: -5.708248 },
							{ Location: "Serbia", lat: 44.251791, lon: 20.589197 },
							{ Location: "South Georgia and the South Sandwich Islands", lat: -56, lon: -33 },
							{ Location: "Switzerland", lat: 46.730219, lon: 7.509687 },
							{ Location: "Cook Islands", lat: undefined, lon: undefined },
							{ Location: "Madagascar", lat: undefined, lon: undefined },
							{ Location: "South Africa", lat: -31.3096, lon: 18.357 },
							{ Location: "Estonia", lat: 58.722853, lon: 25.867131 },
							{ Location: "Maldives", lat: -0.614771, lon: 73.093739 },
							{ Location: "Japan", lat: undefined, lon: undefined },
							{ Location: "French Southern Territories", lat: -49.303721, lon: 69.122136 },
							{ Location: "Spain", lat: 40.09095, lon: -3.464618 },
							{ Location: "lol", lat: 33.81847, lon: 73.5977 },
							{ Location: "kek", lat: 30.39188, lon: -97.14749 },
						];

						var oJSONModel = {
							busy: false,
							data: this.aBusinessTrips,
							partners: this.aBusinessPartners,
							projects: this.aProjectsData,
							employees: this.aEmployeesData,
							locations: this.aLocations,
							coordinates: this.aCoordinates,
							currentRoute: this.aBusinessTrips[0],
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
				 * Distinct all available locations method
				 *
				 * @param {Object[]} aBusinessTrips
				 */
				getLocationsDistinct: function (aBusinessTrips) {
					var aLocations = [];

					aBusinessTrips.map((oItem) => {
						aLocations.indexOf(oItem.FromLocation) === -1 ? aLocations.push(oItem.FromLocation) : null;

						aLocations.indexOf(oItem.ToLocation) === -1 ? aLocations.push(oItem.ToLocation) : null;
					});
					aLocations.forEach((sLocation, nIndex) => {
						aLocations[nIndex] = { Location: sLocation };
					});

					return aLocations;
				},

				/**
				 * Get initial form model function
				 *
				 * @returns {Object} initial form model object
				 */
				getInitialFormObject: function () {
					return {
						EmployeeID: null,
						ProjectID: null,
						StartDate: null,
						EndDate: null,
						FromLocation: null,
						ToLocation: null,
					};
				},

				/**
				 * Get initial dialog model function
				 *
				 * @returns {Object} initial dialog model object
				 */
				getInitialDialogObject: function () {
					return {
						EmployeeID: null,
						ProjectID: null,
						FromLocation: null,
						ToLocation: null,
						StartDate: null,
						EndDate: null,
						Aim: null,
						StatusCode: Constants.BUSINESSTRIP_PLANNED,
					};
				},

				/**
				 * "Open map" button press event handler
				 */
				onOpenMapPress: async function () {
					var oView = this.getView();

					if (!this.oMapDialog) {
						this.oMapDialog = await Fragment.load({
							id: oView.getId(),
							name: "manage.company.view.fragments.TripsMap",
							controller: this,
						});

						oView.addDependent(this.oMapDialog);
					}

					this.oMapDialog.open();
				},

				/**
				 * "Close map" button press event handler (in the dialog)
				 */
				onMapDialogClosePress: function () {
					this.oMapDialog.close();
				},

				/**
				 * Set "currentRoute" property of main model method
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				setCurrentRouteProperty: function (oEvent) {
					var oSource = oEvent.getSource();
					var oCtx = oSource.getBindingContext(this.config.mainModelName);

					var sFromLocation = oCtx.getObject("FromLocation");
					var sToLocation = oCtx.getObject("ToLocation");

					var oFromCoordinates = this.aCoordinates.find((oItem) => {
						return oItem.Location === sFromLocation;
					});

					var oToCoordinates = this.aCoordinates.find((oItem) => {
						return oItem.Location === sToLocation;
					});

					var oCurrentRoute = {
						FromLocation: sFromLocation,
						FromCoordinates: oFromCoordinates,
						ToLocation: sToLocation,
						ToCoordinates: oToCoordinates,
					};

					this.getModel(this.config.mainModelName).setProperty("/currentRoute", oCurrentRoute);
				},

				/**
				 * "Open flight map" button press event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onOpenFlightMapPress: async function (oEvent) {
					this.setCurrentRouteProperty(oEvent);

					var oView = this.getView();

					if (!this.oFlightMapDialog) {
						this.oFlightMapDialog = await Fragment.load({
							id: oView.getId(),
							name: "manage.company.view.fragments.FlightRouteMap",
							controller: this,
						});

						oView.addDependent(this.oFlightMapDialog);
					}

					this.oFlightMapDialog.open();
				},

				/**
				 * "Close flight map" button press event handler (in the dialog)
				 */
				onFlightMapDialogClosePress: function () {
					this.oFlightMapDialog.close();
				},

				/**
				 * "Delete entry" button drop event handler
				 *
				 * @param {sap.ui.base.Event} oEvent event object
				 */
				onDropDelete: function (oEvent) {
					var oSource = oEvent.getParameter("draggedControl");
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
