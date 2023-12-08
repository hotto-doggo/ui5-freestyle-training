sap.ui.define([], function () {
	"use strict";

	return {
		controllerName: "manage.company.controller.Employees",
		columns: [
			{
				minScreenWidth: "Large",
				text: "{i18n>FullName}",
			},
			{
				minScreenWidth: "Large",
				text: "{i18n>Department}",
			},
			{
				minScreenWidth: "Large",
				text: "{i18n>Position}",
			},
			{
				minScreenWidth: "890px",
				text: "{i18n>Level}",
			},
			{
				minScreenWidth: "1070px",
				text: "{i18n>Role}",
			},
			{
				minScreenWidth: "1270px",
				text: "{i18n>Location}",
			},
			{
				minScreenWidth: "1500px",
				text: "{i18n>EnglishLevel}",
			},
			{
				minScreenWidth: "1500px",
				text: "{i18n>Status}",
			},
		],
	};
});
