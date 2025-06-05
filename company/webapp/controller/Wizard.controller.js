sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
], function (BaseController, JSONModel, MessageBox, History) {
    "use strict";

    return BaseController.extend("globalhitss.ee.company.controller.Wizard", {
        onInit: function () {
            sap.ui.core.BusyIndicator.show();
            let that = this;
            let emtpyObject = {
                CountryCollection: [],
                StateCollection: [],
                TownCollection: [],
                PostalCodeCollection: [],
                NeighborhoodCollection: [],
            };
            let oModelEmpty = new JSONModel(emtpyObject);
            that.getView().setModel(oModelEmpty);
            sap.ui.core.BusyIndicator.hide();
            this.getRouter().getRoute("wizard").attachPatternMatched(this.onObjectMatched, this);

            that._wizard = that.byId("CreateCompanyWizard");
            that._oNavContainer = that.byId("wizardNavContainer");
            that._oWizardContentPage = that.byId("wizardContentPage");

            that.model = new JSONModel();
            this.model.setData({
                companyComboBox: "Error",
                siteNameState: "Error",
                RPUState: "Error",
                fareState: "Error"
            });
            this.getView().setModel(this.model);
            this.model.setProperty("/siteTypeChosen", "Tienda");

            //this.clearDataFields(this);

            //this.createCompanyOdata();
            //this.createCountryOdata();
        },

        onObjectMatched: function () {
            sap.ui.core.BusyIndicator.show();
            let that = this;
            //Ejecutar al entrar
            that.getCountries().then(function (res) {
                let oCountries = res;
                let oModel = that.getView().getModel();
                oModel.setSizeLimit(100000);
                oModel.setProperty("/CountryCollection", oCountries);
                sap.ui.core.BusyIndicator.hide();
            });
        },

        geti18n: function (textToSearch) {
            return this.getView().getModel("i18n").getResourceBundle().getText(textToSearch);
        },

        setValueStateAndText: function (combo, valueState, valueStateText) {
            combo.setValueState(valueState);
            combo.setValueStateText(valueStateText);
        },

        stepOneValidation: function () {
            let that = this,
                aBusinessName = that.getView().byId('businessNameInput').getValue(),
                aFriendlyName = that.getView().byId('friendlyNameInput').getValue();

            if (aBusinessName.length < 10) {
                that.model.setProperty("/businessNameState", "Error");
            } else {
                that.model.setProperty("/businessNameState", "None");
            }

            if (aFriendlyName.length < 4) {
                that.model.setProperty("/friendlyNameState", "Error");
            } else {
                that.model.setProperty("/friendlyNameState", "None");
            }

            if (aBusinessName.length < 10 || aFriendlyName.length < 4) {
                this._wizard.invalidateStep(this.byId("NameStep"));
            } else {
                this._wizard.validateStep(this.byId("NameStep"));
            }
        },

        stepTwoValidation: function () {
            let that = this,
                aCountry = that.getView().byId('countryComboBox').getValue(),
                aState = that.getView().byId('stateComboBox').getValue(),
                aTown = that.getView().byId('townComboBox').getValue(),
                aPostalCode = that.getView().byId('postalCodeComboBox').getValue(),
                aNeighborhood = that.getView().byId('neighborhoodComboBox').getValue(),
                aStreet = that.getView().byId('streetInput').getValue(),
                aExtNumber = that.getView().byId('numberInput').getValue();


            if (aCountry == "") {
                that.model.setProperty("/countryState", "Error");
            } else {
                that.model.setProperty("/countryState", "None");
            }

            if (aState == "") {
                that.model.setProperty("/stateState", "Error");
                if (aCountry != "") {
                    return new Promise(function (fnResolve, fnReject) {
                        fnResolve(that.selectedCountry());
                    });
                }
            } else {
                that.model.setProperty("/stateState", "None");
            }

            if (aTown == "") {
                that.model.setProperty("/townState", "Error");
                if (aCountry != "") {
                    return new Promise(function (fnResolve, fnReject) {
                        fnResolve(that.selectedState());
                    });
                }
            } else {
                that.model.setProperty("/townState", "None");
            }

            if (aPostalCode == "") {
                that.model.setProperty("/postalCodeState", "Error");
                if (aTown != "") {
                    return new Promise(function (fnResolve, fnReject) {
                        fnResolve(that.selectedTown());
                    });
                }
            } else {
                that.model.setProperty("/postalCodeState", "None");
            }

            if (aNeighborhood == "") {
                that.model.setProperty("/neighborhoodState", "Error");
                if (aPostalCode != "") {
                    return new Promise(function (fnResolve, fnReject) {
                        fnResolve(that.selectedPostalCode());
                    });
                }
            } else {
                that.model.setProperty("/neighborhoodState", "None");
            }

            if (aStreet.length < 4) {
                that.model.setProperty("/streetState", "Error");
            } else {
                that.model.setProperty("/streetState", "None");
            }

            if (aExtNumber.length < 1) {
                that.model.setProperty("/extNumberState", "Error");
            } else {
                that.model.setProperty("/extNumberState", "None");
            }

            if (aCountry == "" || aState == "" || aTown == "" || aPostalCode == "" || aNeighborhood == "" || aStreet.length < 6 || aExtNumber.length < 1) {
                this._wizard.invalidateStep(this.byId("AddressStep"));
            } else {
                this._wizard.validateStep(this.byId("AddressStep"));
            }

        },

        selectedCountry: function () {
            let that = this,
                aCountry = that.getView().byId('countryComboBox').getSelectedItem().mProperties.additionalText;
            console.log(aCountry);
            that.getStates(aCountry).then(function (res) {
                let oStates = res;
                that.getView().getModel().setProperty("/StateCollection", oStates);
                sap.ui.core.BusyIndicator.hide();
            });
        },

        selectedState: function () {
            let that = this,
                //aState = that.getView().byId('stateComboBox').getValue();
                aState = that.getView().byId('stateComboBox').getSelectedItem().mProperties.additionalText;
            console.log(aState);
            that.getTowns(aState).then(function (res) {
                let oTowns = res;
                that.getView().getModel().setProperty("/TownCollection", oTowns);
                sap.ui.core.BusyIndicator.hide();
            });
        },

        selectedTown: function () {
            let that = this,
                //aState = that.getView().byId('stateComboBox').getValue();
                aState = that.getView().byId('townComboBox').getSelectedItem().mProperties.additionalText,
                aTown = that.getView().byId('townComboBox').getValue();
            that.getPostalCodes(aState, aTown).then(function (res) {
                let oPostalCodes = res;
                that.getView().getModel().setProperty("/PostalCodeCollection", oPostalCodes);
                sap.ui.core.BusyIndicator.hide();
            });
        },

        selectedPostalCode: function () {
            let that = this,
                aPostalCode = that.getView().byId('postalCodeComboBox').getValue();
            that.getNeighborhoods(aPostalCode).then(function (res) {
                let oPostalCodes = res;
                that.getView().getModel().setProperty("/NeighborhoodCollection", oPostalCodes);
                sap.ui.core.BusyIndicator.hide();
            });
        },

        wizardCompletedHandler: function () {
            this.settersWizardReviewPage();
            this._oNavContainer.to(this.byId("wizardReviewPage"));
        },

        backToWizardContent: function () {
            this._oNavContainer.backToPage(this._oWizardContentPage.getId());
        },

        handleWizardCancel: function () {
            this._handleMessageBoxOpen("¿Estás seguro de cancelar?", "warning");
        },

        editStepOne: function () {
            this._handleNavigationToStep(0);
        },

        editStepTwo: function () {
            this._handleNavigationToStep(1);
        },

        editStepThree: function () {
            this._handleNavigationToStep(2);
        },

        editStepFour: function () {
            this._handleNavigationToStep(3);
        },

        _handleNavigationToStep: function (iStepNumber) {
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
                this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
            this.backToWizardContent();
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._handleNavigationToStep(0);
                        this._wizard.discardProgress(this._wizard.getSteps()[0]);
                    }
                }.bind(this)
            });
        },

        handleCancel: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                this._handleNavigationToStep(0);
                this._wizard.discardProgress(this._wizard.getSteps()[0]);
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._handleNavigationToStep(0);
                this._wizard.discardProgress(this._wizard.getSteps()[0]);
                oRouter.navTo("worklist", true);
            }
        },

        settersWizardReviewPage: function () {
            let that = this;
            return new Promise(function (fnResolve, fnReject) {
                that.getDataWizard().then(function (res) {
                    let data = res;

                    if (!data) {
                        fnReject(MessageBox.show("Revisa los datos que ingresaste"));
                    } else {
                        fnResolve(
                            //set texts for review page
                            that.byId("businessNameChoosen").setText(data.BusinessName),
                            that.byId("friendlyNameChoosen").setText(data.FriendlyName),
                            that.byId("countryChosen").setText(data.Address.Country),
                            that.byId("stateChosen").setText(data.Address.State),
                            that.byId("townChosen").setText(data.Address.Town),
                            that.byId("postalCodeChosen").setText(data.Address.PostalCode),
                            that.byId("neighborhoodChosen").setText(data.Address.Neighborhood),
                            that.byId("streetChosen").setText(data.Address.Street),
                            that.byId("numberChosen").setText(data.Address.ExtNumber),
                            that.byId("intNumberChosen").setText(data.Address.IntNumber),
                            that.byId("latitudeChosen").setText(data.Address.Latitude),
                            that.byId("longitudeChosen").setText(data.Address.Longitude),
                            that.byId("builtAreaChosen").setText(data.Address.BuiltArea),
                            that.byId("businessActivityChoosen").setText(data.BusinessActivity),
                            that.byId("currencyChoosen").setText(data.Currency)
                        );
                    }
                });
            });
        },

        handleWizardSubmit: function () {
            this.onSave();
        },

        onSave: function () {
            let that = this;
            return new Promise(function (fnResolve, fnReject) {
                that.getDataWizard().then(function (res) {
                    let postData = res;
                    postData.deletionRequest = 0;
                    let aData = jQuery.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Company",
                        dataType: "json",
                        data: JSON.stringify(postData),
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            console.log(data);
                            MessageBox.success("La compañía " + data.friendlyName + " con ID " + data.ID + " se ha creado", {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    if (sAction === MessageBox.Action.OK) {
                                        that.handleCancel();
                                    }
                                }
                            });
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            //fnReject( MessageBox.error("No se pudo crear la compañía"));
                            MessageBox.error("No se pudo crear la compañía. Contacta a la mesa de ayuda")
                        }
                    });
                    fnResolve(aData);
                });
            });

        },

        setCompanyTypeFromSegmented: function (evt) {
            var companyType = evt.getParameters().item.getText();
            this.model.setProperty("/companyType", companyType);
            //this._wizard.validateStep(this.byId("ProductTypeStep"));
        },

        discardProgress: function () {
            this._wizard.discardProgress(this.byId("nameStep"));

            var clearContent = function (content) {
                for (var i = 0; i < content.length; i++) {
                    if (content[i].setValue) {
                        content[i].setValue("");
                    }

                    if (content[i].getContent) {
                        clearContent(content[i].getContent());
                    }
                }
            };

            this.model.setProperty("/companyComboBox", "Error");
            this.model.setProperty("/siteNameState", "Error");
            this.model.setProperty("/RPUState", "Error");
            this.model.setProperty("/fareState", "Error");
            clearContent(this._wizard.getSteps());
        },

    });

});