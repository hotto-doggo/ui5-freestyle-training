sap.ui.define(["sap/ui/model/json/JSONModel", "manage/company/utils/Constants"], function (JSONModel, Constants) {
	"use strict";

	return JSONModel.extend("BusinessObjectsModel", {
		/**
		 * Getter function to fetch entity data
		 *
		 * @param {string} sEntityName entity name
		 *
		 * @returns {Object[]} array with entity
		 */
		loadData: async function (sEntityName) {
			var sURL = Constants.BASE_API_URL + sEntityName;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function to fetch data by ID and relation
		 *
		 * @param {string} sEntityName entity name
		 * @param {string} sId entity ID
		 * @param {string} sRelation relation query
		 *
		 * @returns {Object[]} array with all data
		 */
		loadDataByIdAndRelation: async function (sEntityName, sId, sRelation) {
			var sURL = Constants.BASE_API_URL + sEntityName + "/" + sId + "/" + sRelation;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function to fetch entity data with including relations
		 *
		 * @param {string} sRelationName relation name
		 * @param {Object} oIncludesFilter object with includes filter
		 *
		 * @returns {Object[]} array with all data
		 */
		loadDataWithInnerRelatedEntities: async function (sRelationName, oIncludesFilter) {
			var sURL = Constants.BASE_API_URL + sRelationName + "?filter=" + JSON.stringify(oIncludesFilter);

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function to fetch ID of entity relation
		 *
		 * @param {string} sEntityName entity name
		 * @param {string} sFilterQuery filtering query string
		 *
		 * @returns {Object[]} array with relation ID
		 */
		getEntitiesRelationId: async function (sEntityName, sFilterQuery) {
			var sURL = Constants.BASE_API_URL + sEntityName + sFilterQuery;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function to fetch entity data with filter query
		 *
		 * @param {string} sEntityName entity name
		 * @param {string} sFilterQuery filtering query string
		 *
		 * @returns {Object[]} array with all data
		 */
		getFilteredEntityData: async function (sEntityName, sFilterQuery = "") {
			var sURL = Constants.BASE_API_URL + sEntityName + sFilterQuery;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function for entity data fetching
		 *
		 * @param {string} sEntityName entity name
		 * @param {string} sId id of entity
		 *
		 * @returns {Object[]} array with all entity data
		 */
		getEntityById: async function (sEntityName, sId) {
			var sURL = Constants.BASE_API_URL + sEntityName + "/" + sId;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				if (sEntityName === Constants.EMPLOYEES) {
					aRes.BirthDate = new Date(aRes.BirthDate);
				}

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function to fetch employee skills by id
		 *
		 * @param {string} sEntityName entity name
		 * @param {integer} iId employee id
		 *
		 * @returns {Object[]} array with all entity data
		 */
		getEmployeeSkillsByID: async function (iId) {
			var sURL = Constants.BASE_API_URL + Constants.EMPLOYEES + `/${iId}/` + Constants.REL_EMPLOYEE_SKILLS;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function to fetch entity feedbacks with filter query
		 *
		 * @param {string} sEntityName entity name
		 * @param {integer} iId entity id
		 *
		 * @returns {Object[]} array with all feedbacks
		 */
		getFilteredEntityFeedbacks: async function (sEntityName, iId) {
			var oQueryObject = {
				where: { EmployeeID: iId },
			};

			var sURL = Constants.BASE_API_URL + sEntityName + "?filter=" + JSON.stringify(oQueryObject);

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Getter function for coordinates fetching
		 *
		 * @param {string} sEntityName entity name
		 * @param {string} sLocation name of location
		 *
		 * @returns {Object[]} array with server response
		 */
		getCoordinates: async function (sLocation) {
			var sURL = `http://api.positionstack.com/v1/forward?access_key=507f342b9786404e41176605abfb0df7&%20query=${sLocation}`;

			try {
				var aRes = await fetch(sURL);
				aRes = await aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Delete function for entity
		 *
		 * @returns {Object[]} array with all entity data
		 *
		 * @param {string} sEntityName entity name
		 * @param {string} sId id of entity
		 */
		deleteEntityById: async function (sEntityName, sId) {
			var sURL = Constants.BASE_API_URL + sEntityName + "/" + sId;

			try {
				var aRes = await fetch(sURL, {
					method: "DELETE",
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				});

				var aRes = aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Post function for new entity creating
		 *
		 * @param {string} sEntityName entity name
		 * @param {Object} oBody body object with new entity information
		 *
		 * @returns {Object[]} array with server response
		 */
		addEntity: async function (sEntityName, oBody) {
			var sURL = Constants.BASE_API_URL + sEntityName;

			try {
				var aRes = await fetch(sURL, {
					method: "POST",
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify(oBody),
				});

				var aRes = aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Put function for entity edit
		 *
		 * @param {string} sEntityName entity name
		 * @param {Object} oBody body object with new entity information
		 * @param {integer} iId entity id
		 *
		 * @returns {Object[]} array with server response
		 */
		editEntityInfo: async function (sEntityName, oBody, iId) {
			var sURL = Constants.BASE_API_URL + sEntityName + `/${iId}`;

			try {
				var aRes = await fetch(sURL, {
					method: "PUT",
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify(oBody),
				});

				var aRes = aRes.json();

				return aRes;
			} catch (oError) {
				console.error(oError);
			}
		},

		/**
		 * Get full filtering query
		 *
		 * @param {Object} oFiltersModel
		 *
		 * @returns {string} additional filtering query string
		 */
		getFilteringQuery: function (oFiltersModel) {
			var sFilterQuery = "?filter=";
			var oQueryObject = {
				where: {
					and: [],
				},
			};

			for (var key in oFiltersModel) {
				if (!oFiltersModel[key] || oFiltersModel[key] === "ALL" || oFiltersModel[key] === "") {
					continue;
				} else if (key === Constants.INCLUDE) {
					oQueryObject.include = oFiltersModel.include;
				} else if (key === Constants.LAST_NAME) {
					oQueryObject.where.and.push({
						or: [
							{
								FirstName: {
									regexp: `/${oFiltersModel[key]}/i`,
								},
							},
							{
								LastName: {
									regexp: `/${oFiltersModel[key]}/i`,
								},
							},
						],
					});
				} else if ((key === Constants.LOCATION || key === Constants.NAME) && !Array.isArray(oFiltersModel[key])) {
					oQueryObject.where.and.push({
						[key]: {
							regexp: `/${oFiltersModel[key]}/i`,
						},
					});
				} else if (key === Constants.START_DATE) {
					oQueryObject.where.and.push({
						or: [
							{
								and: [
									{
										StartDate: {
											lte: new Date(oFiltersModel.StartDate),
										},
									},
									{
										EndDate: {
											gte: new Date(oFiltersModel.EndDate),
										},
									},
								],
							},
							{
								and: [
									{
										StartDate: {
											lt: new Date(oFiltersModel.EndDate),
										},
									},
									{
										StartDate: {
											gte: new Date(oFiltersModel.StartDate),
										},
									},
								],
							},
							{
								and: [
									{
										EndDate: {
											lte: new Date(oFiltersModel.EndDate),
										},
									},
									{
										EndDate: {
											gt: new Date(oFiltersModel.StartDate),
										},
									},
								],
							},
						],
					});
				} else if (key === Constants.END_DATE) {
					continue;
				} else {
					var oQueryPart = {
						or: [],
					};

					oFiltersModel[key].forEach((sKey, nIndex) => {
						if (sKey === Constants.EMPLOYEE_ON_PROJECT_WITHOUT_UNDERSCORE) {
							oQueryPart.or.push({
								[key]: Constants.EMPLOYEE_ON_PROJECT,
							});
						}
						oQueryPart.or.push({
							[key]: oFiltersModel[key][nIndex],
						});
					});

					oQueryObject.where.and.push(oQueryPart);
				}
			}

			sFilterQuery += JSON.stringify(oQueryObject);

			return !oQueryObject.where.and.length ? "" : sFilterQuery;
		},
	});
});
