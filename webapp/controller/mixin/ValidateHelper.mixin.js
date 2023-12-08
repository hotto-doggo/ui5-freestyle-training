sap.ui.define(
	["sap/ui/core/ValueState", "manage/company/utils/Constants"],
	function (ValueState, Constants) {
		"use strict";

		return {
			/**
			 * Validate form function.
			 *
			 * @param sFormId id of the validating form
			 *
			 * @returns {boolean} boolean value of isValid variable
			 */
			validateForm: function (sFormId) {
				this.isValid = true;

				var aValidateInputs = this.getView()
					.byId(sFormId)
					.getControlsByFieldGroupId("validateEmployeeDialogGroupID");

				aValidateInputs.forEach((oControl) => {
					if (
						Constants.INPUTS_CLASS_NAMES.includes(
							oControl.getMetadata().getName()
						)
					) {
						this.validateControl(oControl);
					}
				});

				return this.isValid;
			},

			/**
			 * Validate control function.
			 *
			 * @param {sap.ui.core.Control} oControl sap ui Control object
			 */
			validateControl: function (oControl) {
				var sControlClassName = oControl.getMetadata().getElementName();

				if (sControlClassName === Constants.INPUT_CLASS_NAME) {
					this.validateInput(oControl);
				} else if (
					sControlClassName === Constants.DATE_PICKER_CLASS_NAME
				) {
					this.validateDatePicker(oControl);
				} else if (sControlClassName === Constants.SELECT_CLASS_NAME || sControlClassName === Constants.COMBO_BOX_CLASS_NAME) {
					this.validateSelect(oControl);
				}
			},

			/**
			 * Validate control with type equals Input function.
			 *
			 * @param {sap.ui.core.Control} oInput sap ui Control object with type equals Input
			 */
			validateInput: function (oInput) {
				var sInputValue = oInput.getValue();
				var sInputType = oInput.getType();

				var sFieldIsRequired = this.getModel("i18n")
					.getResourceBundle()
					.getText("FieldIsRequired");
				var sFieldIsRequired = this.getModel("i18n")
					.getResourceBundle()
					.getText("FieldIsRequired");

				if (sInputType === Constants.TEXT && !sInputValue) {
					oInput.setValueState(ValueState.Error);
					oInput.setValueStateText(sFieldIsRequired);
					this.isValid = false;
				} else if (
					sInputType === Constants.NUMBER &&
					(sInputValue < 0 || sInputValue === "")
				) {
					this.isValid = false;
					oInput.setValueState(ValueState.Error);
					oInput.setValueStateText(sFieldIsRequired);
				} else {
					oInput.setValueState(ValueState.None);
				}
			},

			/**
			 * Validate control with type equals DatePicker function.
			 *
			 * @param {sap.ui.core.Control} oInput sap ui Control object with type equals DatePicker
			 */
			validateDatePicker: function (oInput) {
				var sInputValue = oInput.getDateValue();

				var sFieldIsRequired = this.getModel("i18n")
					.getResourceBundle()
					.getText("FieldIsRequired");

				if (!sInputValue) {
					oInput.setValueState(ValueState.Error);
					oInput.setValueStateText(sFieldIsRequired);
					this.isValid = false;
				} else {
					oInput.setValueState(ValueState.None);
				}
			},

			/**
			 * Validate control with type equals Select function.
			 *
			 * @param {sap.ui.core.Control} oInput sap ui Control object with type equals Select
			 */
			validateSelect: function (oInput) {
				var sInputValue = oInput.getSelectedItem();

				var sFieldIsRequired = this.getModel("i18n")
					.getResourceBundle()
					.getText("FieldIsRequired");

				if (!sInputValue) {
					oInput.setValueState(ValueState.Error);
					oInput.setValueStateText(sFieldIsRequired);
					this.isValid = false;
				} else {
					oInput.setValueState(ValueState.None);
				}
			},

			/**
			 * Clear validation states of Selects function.
			 */
			clearValidationStates: function (sFormId) {
				var aValidateInputs = this.getView()
					.byId(sFormId)
					.getControlsByFieldGroupId("validateEmployeeDialogGroupID");

				aValidateInputs.forEach((oControl) => {
					if (
						Constants.INPUTS_CLASS_NAMES.includes(
							oControl.getMetadata().getElementName()
						)
					)
						oControl.setValueState(ValueState.None);
				});
			},
		};
	}
);
