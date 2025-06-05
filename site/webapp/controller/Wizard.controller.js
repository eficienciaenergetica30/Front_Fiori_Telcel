sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
  ], function (BaseController, JSONModel, MessageBox, History) {
    "use strict";
  
    return BaseController.extend("globalhitss.ee.site.controller.Wizard", {
        onInit: function () {
            sap.ui.core.BusyIndicator.show();
			let that = this;
			let emtpyObject = {
                CompanyCollection: [],
                SiteTypeCollection: [],
                SiteFormatCollection: [],
                SiteBusinessUnitCollection: [],
                SiteDivisionCollection: [],
                SiteRegionCollection: [],
                SiteStatusCollection: [],
                SiteElectricSuppliersCollection: [],
                SiteGasSuppliersCollection: [],
                SiteWaterSuppliersCollection: [],
				CountryCollection: [],
				StateCollection: [],
				TownCollection: [],
				PostalCodeCollection: [],
				NeighborhoodCollection: [],
                SiteManagerCollection: [],
			};
            sap.ui.getCore().getConfiguration().setLanguage("es-MX");
			let oModelEmpty = new JSONModel(emtpyObject);
			that.getView().setModel(oModelEmpty);
            sap.ui.core.BusyIndicator.hide();
            this.getRouter().getRoute("wizard").attachPatternMatched(this.onObjectMatched, this);

			that._wizard = that.byId("CreateSiteWizard");
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

        onObjectMatched: function() {
            sap.ui.core.BusyIndicator.show();
            let that = this;
            //Ejecutar al entrar
            that.getCompanies().then(function(res) {
                let oCompanies = res;
                that.getView().getModel().setProperty("/CompanyCollection", oCompanies);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteTypes().then(function(res) {
                let oSiteTypes = res;
                that.getView().getModel().setProperty("/SiteTypeCollection", oSiteTypes);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteFormat().then(function(res) {
                let oSiteFormat = res;
                that.getView().getModel().setProperty("/SiteFormatCollection", oSiteFormat);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteBusinessUnit().then(function(res) {
                let oSiteBusinessUnit = res;
                that.getView().getModel().setProperty("/SiteBusinessUnitCollection", oSiteBusinessUnit);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteDivision().then(function(res) {
                let oSiteDivision = res;
                that.getView().getModel().setProperty("/SiteDivisionCollection", oSiteDivision);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteRegion().then(function(res) {
                let oSiteRegion = res;
                that.getView().getModel().setProperty("/SiteRegionCollection", oSiteRegion);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteStatus().then(function(res) {
                let oSiteStatus = res;
                that.getView().getModel().setProperty("/SiteStatusCollection", oSiteStatus);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteManager().then(function(res) {
                let oSiteManager = res;
                that.getView().getModel().setProperty("/SiteManagerCollection", oSiteManager);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteElectricSuppliers().then(function(res) {
                let oSiteElectricSuppliers = res;
                that.getView().getModel().setProperty("/SiteElectricSuppliersCollection", oSiteElectricSuppliers);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteGasSuppliers().then(function(res) {
                let oSiteGasSuppliers = res;
                that.getView().getModel().setProperty("/SiteGasSuppliersCollection", oSiteGasSuppliers);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getSiteWaterSuppliers().then(function(res) {
                let oSiteWaterSuppliers = res;
                that.getView().getModel().setProperty("/SiteWaterSuppliersCollection", oSiteWaterSuppliers);
                sap.ui.core.BusyIndicator.hide();
            });
            that.getCountries().then(function(res) {
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

        stepOneValidation: function() {
            let that = this,
                aCompany = that.getView().byId('companyComboBox').getValue(),
                comboCompany = that.getView().byId('companyComboBox');
            
            /*let sSelectedKey = comboCompany.getSelectedKey(),
                sValue = comboCompany.getValue();*/

            //field validation
			/*if (sSelectedKey.length > 0 && sValue.length > 0) {
                that.model.setProperty("/companyState","None");				
			} else {
                that.model.setProperty("/companyState","Error");				
			}

            if (sSelectedKey.length > 0 && sValue.length > 0) {
                this._wizard.validateStep(this.byId("CompanyStep"));				
			} else {
                this._wizard.invalidateStep(this.byId("CompanyStep"));
			}*/

            if(aCompany == "") {
                that.model.setProperty("/companyState","Error");
            } else {
                that.model.setProperty("/companyState","None");
            }

            if(aCompany == "") {
                this._wizard.invalidateStep(this.byId("CompanyStep"));
            } else {
                this._wizard.validateStep(this.byId("CompanyStep"));
            }

        },

        stepTwoValidation: function() {
            let that = this,
                aName = that.getView().byId('siteNameInput').getValue(),
                aSiteType = that.getView().byId('siteTypeComboBox').getValue(),
                aSiteBusinessUnit = that.getView().byId('siteBusinessUnitComboBox').getValue(),
                aSiteFormat = that.getView().byId('siteFormatComboBox').getValue(),
                aSiteRPU = that.getView().byId('siteRPUInput').getValue(),
                aSiteDivision = that.getView().byId('siteDivisionComboBox').getValue(),
                aSiteRegion = that.getView().byId('siteRegionComboBox').getValue(),
                aSiteStatus = that.getView().byId('siteStatusComboBox').getValue(),
                aSiteManager = that.getView().byId('siteManagerComboBox').getValue(),
                aSiteCostCenter = that.getView().byId('siteCostCenterInput').getValue(),
                aSiteCostCenterEg = that.getView().byId('siteCostCenterEgInput').getValue();

            if(aName.length < 4) {
                that.model.setProperty("/siteNameState","Error");
            } else {
                that.model.setProperty("/siteNameState","None");
            }

            if(aSiteType == "") {
                that.model.setProperty("/siteTypeState","Error");
            } else {
                that.model.setProperty("/siteTypeState","None");
            }

            if(aSiteBusinessUnit == "") {
                that.model.setProperty("/siteBusinessUnitState","Error");
            } else {
                that.model.setProperty("/siteBusinessUnitState","None");
            }

            if(aSiteFormat == "") {
                that.model.setProperty("/siteFormatState","Error");
            } else {
                that.model.setProperty("/siteFormatState","None");
            }

            if(aSiteRPU.length < 12) {
                that.model.setProperty("/siteRPUState","Error");
            } else {
                that.model.setProperty("/siteRPUState","None");
            }

            if(aSiteDivision == "") {
                that.model.setProperty("/siteDivisionState","Error");
            } else {
                that.model.setProperty("/siteDivisionState","None");
            }

            if(aSiteRegion == "") {
                that.model.setProperty("/siteRegionState","Error");
            } else {
                that.model.setProperty("/siteRegionState","None");
            }

            if(aSiteCostCenter.length < 4) {
                that.model.setProperty("/siteCostCenterState","Error");
            } else {
                that.model.setProperty("/siteCostCenterState","None");
            }

            if(aSiteCostCenterEg.length < 4) {
                that.model.setProperty("/siteCostCenterEgState","Error");
            } else {
                that.model.setProperty("/siteCostCenterEgState","None");
            }

            if(aSiteStatus == "") {
                that.model.setProperty("/siteStatusState","Error");
            } else {
                that.model.setProperty("/siteStatusState","None");
            }

            if(aSiteManager == "") {
                that.model.setProperty("/siteManagerState","Error");
            } else {
                that.model.setProperty("/siteManagerState","None");
            }

            if(aName.length < 4 || aSiteType == "" || aSiteBusinessUnit == "" || aSiteFormat == "" || aSiteRPU.length < 12 || aSiteDivision == "" || aSiteRegion == "" || aSiteCostCenter.length < 4 || aSiteCostCenterEg.length < 4 || aSiteStatus == "" || aSiteManager == "") {
                this._wizard.invalidateStep(this.byId("SiteInfoStep"));
            } else {
                this._wizard.validateStep(this.byId("SiteInfoStep"));
            }
        },
        
        stepThreeValidation: function() {
            let that = this,
                aCountry      = that.getView().byId('countryComboBox').getValue(),
                aState        = that.getView().byId('stateComboBox').getValue(),
                aTown         = that.getView().byId('townComboBox').getValue(),
                aPostalCode   = that.getView().byId('postalCodeComboBox').getValue(),
                aNeighborhood = that.getView().byId('neighborhoodComboBox').getValue(),
                aStreet       = that.getView().byId('streetInput').getValue(),
                aExtNumber    = that.getView().byId('numberInput').getValue();
                

            if(aCountry == "") {
                that.model.setProperty("/countryState","Error");
            } else {
                that.model.setProperty("/countryState","None");
            }

            if(aState == "") {
                that.model.setProperty("/stateState","Error");
                if(aCountry != ""){
                    return new Promise(function(fnResolve, fnReject) {
                        fnResolve(that.selectedCountry());
                    });
                }
            } else {
                that.model.setProperty("/stateState","None");
            }

            if(aTown == "") {
                that.model.setProperty("/townState","Error");
                if(aCountry != ""){
                    return new Promise(function(fnResolve, fnReject) {
                        fnResolve(that.selectedState());
                    });
                }
            } else {
                that.model.setProperty("/townState","None");
            }

            if(aPostalCode == "") {
                that.model.setProperty("/postalCodeState","Error");
                if(aTown != ""){
                    return new Promise(function(fnResolve, fnReject) {
                        fnResolve(that.selectedTown());
                    });
                }
            } else {
                that.model.setProperty("/postalCodeState","None");
            }

            if(aNeighborhood == "") {
                that.model.setProperty("/neighborhoodState","Error");
                if(aPostalCode != ""){
                    return new Promise(function(fnResolve, fnReject) {
                        fnResolve(that.selectedPostalCode());
                    });
                }
            } else {
                that.model.setProperty("/neighborhoodState","None");
            }

            if(aStreet.length < 4) {
                that.model.setProperty("/streetState","Error");
            } else {
                that.model.setProperty("/streetState","None");
            }

            if(aExtNumber.length < 1) {
                that.model.setProperty("/extNumberState","Error");
            } else {
                that.model.setProperty("/extNumberState","None");
            }

            if(aCountry == "" || aState == "" || aTown == "" || aPostalCode == "" || aNeighborhood == "" || aStreet.length < 4 || aExtNumber.length < 1) {
                this._wizard.invalidateStep(this.byId("AddressStep"));
            } else {
                this._wizard.validateStep(this.byId("AddressStep"));
            }

        },

        getSlectedElectricSupplier: function() {
            let that = this,
                aElectric = that.getView().byId('electricSupplierComboBox').getSelectedItem().mProperties.additionalText;
            console.log(aElectric);
        },

        stepFourValidation: function(oEvent) {
            let that = this,
                aElectricSupplier = that.getView().byId('electricSupplierComboBox'),
                aGasSupplier = that.getView().byId('gasSupplierComboBox'),
                aWaterSupplier = that.getView().byId('waterSupplierComboBox'),
                oElectricSupplier = aElectricSupplier.getSelectedItems(),
                oGasSupplier = aGasSupplier.getSelectedItems(),
                oWaterSupplier = aWaterSupplier.getSelectedItems();
                
                console.log('Electric: ', oElectricSupplier);
                console.log('Gas: ', oGasSupplier);
                console.log('Water: ', oWaterSupplier);

            if (oElectricSupplier.length == 0) {
                that.model.setProperty("/electricSupplierState","Error");
            } else {
                that.model.setProperty("/electricSupplierState","None");
            }

            if (oGasSupplier.length == 0) {
                that.model.setProperty("/gasSupplierState","Error");
            } else {
                that.model.setProperty("/gasSupplierState","None");
            }

            if (oWaterSupplier.length == 0) {
                that.model.setProperty("/waterSupplierState","Error");
            } else {
                that.model.setProperty("/waterSupplierState","None");
            }

            if (oGasSupplier.length == 0 || oGasSupplier.length == 0 || oWaterSupplier.length == 0) {
                that._wizard.invalidateStep(that.byId("SuppliersStep"));
            } else {
                that._wizard.validateStep(that.byId("SuppliersStep"));
            }
            
        },

        stepFiveValidation: function() {
            let that = this,
                aGatewayName = that.getView().byId('gatewayNameInput').getValue(),
                aGatewaySerialNumber = that.getView().byId('gatewaySNInput').getValue(),
                aGatewayPin = that.getView().byId('gatewayPINInput').getValue(),
                aSimIMSI = that.getView().byId('simIMSIInput').getValue(),
                aSimMSASDN = that.getView().byId('simMSASDNInput').getValue();

            if(aGatewayName.length < 5) {
                that.model.setProperty("/gatewayNameState","Error");
            } else {
                that.model.setProperty("/gatewayNameState","None");
            }

            if(aGatewaySerialNumber.length < 12) {
                that.model.setProperty("/gatewaySNState","Error");
            } else {
                that.model.setProperty("/gatewaySNState","None");
            }

            if(aGatewayPin.length < 6) {
                that.model.setProperty("/gatewayPINState","Error");
            } else {
                that.model.setProperty("/gatewayPINState","None");
            }

            if(aSimIMSI.length < 15) {
                that.model.setProperty("/simIMSIState","Error");
            } else {
                that.model.setProperty("/simIMSIState","None");
            }

            if(aSimMSASDN.length < 4) {
                that.model.setProperty("/simMSASDNState","Error");
            } else {
                that.model.setProperty("/simMSASDNState","None");
            }

            if(aGatewayName.length < 5 || aGatewaySerialNumber.length < 12 || aGatewayPin.length < 6 || aSimIMSI.length < 15 || aSimMSASDN.length < 4) {
                this._wizard.invalidateStep(this.byId("gatewatSIMStep"));
            } else {
                this._wizard.validateStep(this.byId("gatewatSIMStep"));
            }
        },

        stepSixValidation: function() {
            let that = this,
                aContactName = that.getView().byId('contactNameInput').getValue(),
                aContactPhone = that.getView().byId('contactPhoneInput').getValue(),
                aContactEmail = that.getView().byId('contactEmailInput').getValue();
            
            const validateEmail = (email) => {
                return String(email)
                    .toLowerCase()
                    .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    );
            };

            if(aContactName.length < 4) {
                that.model.setProperty("/contactNameState","Error");
            } else {
                that.model.setProperty("/contactNameState","None");
            }

            if(aContactPhone.length < 9) {
                that.model.setProperty("/contactPhoneState","Error");
            } else {
                that.model.setProperty("/contactPhoneState","None");
            }

            if(validateEmail(aContactEmail)) {
                that.model.setProperty("/contactEmailState","None");
            } else {
                that.model.setProperty("/contactEmailState","Error");
            }

            if(aContactName.length < 4 ) {
                this._wizard.invalidateStep(this.byId("contactStep"));
            } else {
                this._wizard.validateStep(this.byId("contactStep"));
            }
        },

        selectedCountry: function() {
            let that = this,
                aCountry = that.getView().byId('countryComboBox').getSelectedItem().mProperties.additionalText;
                that.getStatesV2(aCountry).then(function(res) {
                    let oStates = res;
                    that.getView().getModel().setProperty("/StateCollection", oStates);
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        selectedState: function() {
            let that = this,
                //aState = that.getView().byId('stateComboBox').getValue();
                aState = that.getView().byId('stateComboBox').getSelectedItem().mProperties.additionalText;
                that.getTowns(aState).then(function(res) {
                    let oTowns = res;
                    that.getView().getModel().setProperty("/TownCollection", oTowns);
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        selectedTown: function() {
            let that = this,
                //aState = that.getView().byId('stateComboBox').getValue();
                aState = that.getView().byId('townComboBox').getSelectedItem().mProperties.additionalText,
                aTown = that.getView().byId('townComboBox').getValue();
                that.getPostalCodes(aState, aTown).then(function(res) {
                    let oPostalCodes = res;
                    that.getView().getModel().setProperty("/PostalCodeCollection", oPostalCodes);
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        selectedPostalCode: function() {
            let that = this,
                aPostalCode = that.getView().byId('postalCodeComboBox').getValue();
                that.getNeighborhoods(aPostalCode).then(function(res) {
                    let oPostalCodes = res;
                    that.getView().getModel().setProperty("/NeighborhoodCollection", oPostalCodes);
                    sap.ui.core.BusyIndicator.hide();
                });
        },

    createCountryOdata: function() {
        let oModel = new JSONModel();
        let combo = this.byId("countryComboBox1");
        let aData = jQuery.ajax({
            url: 'https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/CountryCatalog',
            type: 'GET',
            dataType: 'jsonp',
            cors: true,
            crossDomain: true,
            contentType: 'application/json',
            secure: true,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success : function(data, status) {
                let response = JSON.parse(data);
                console.log(response);
                //oModel.setData({Countries: data.value}); 
                //combo.setModel(oModel, "Country");
                //console.log("Success to get");
                
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }

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

    editStepFive: function () {
        this._handleNavigationToStep(4);
    },

    editStepSix: function () {
        this._handleNavigationToStep(5);
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
        return new Promise(function(fnResolve, fnReject) {
            that.getDataWizard().then(function(res) {
                let data = res;
                
                if (!data){
                    fnReject(MessageBox.show("Revisa los datos que ingresaste"));                  
                } else {
                    fnResolve(
                        //set texts for review page
                        that.byId("companyNameChoosen").setText(data.CompanyID),
                        that.byId("siteNameChosen").setText(data.Name),
                        that.byId("siteTypeChosen").setText(data.SiteType),
                        that.byId("siteBusinessUnitChosen").setText(data.BusinessUnit),
                        that.byId("siteFormatChosen").setText(data.Format),
                        that.byId("siteRPUChosen").setText(data.RPU),
                        that.byId("siteDivisionChosen").setText(data.Division),
                        that.byId("siteFareChosen").setText(data.Fare),
                        that.byId("siteRegionChosen").setText(data.Region),
                        that.byId("siteCostCenterChosen").setText(data.CostCenter),
                        that.byId("siteCostCenterEgChosen").setText(data.CostCenterEg),
                        that.byId("timeZoneChosen").setText(data.TimeZone),
                        that.byId("openHourChosen").setText(data.OpenHour),
                        that.byId("closeHourChosen").setText(data.CloseHour),
                        that.byId("siteStatusChosen").setText(data.Status),
                        that.byId("siteManagerChosen").setText(data.Manager),
                        that.byId("constructedAreaChosen").setText(data.ConstructedArea),
                        that.byId("siteContractedDemandChosen").setText(data.ContractedDemand),
                        that.byId("siteCutoffDateChosen").setText(data.CutoffDate),
                        that.byId("siteMultiplierChosen").setText(data.Multiplier),
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
                        that.byId("electricSupplierChosen").setText(data.ElectricSupplier[0]),
                        that.byId("gasSupplierChosen").setText(data.GasSupplier[0]),
                        that.byId("waterSupplierChosen").setText(data.WaterSupplier[0]),
                        that.byId("gatewayNameChosen").setText(data.Gateway[0].Name),
                        that.byId("gatewaySNChosen").setText(data.Gateway[0].SerialNumber),
                        that.byId("gatewayPINChosen").setText(data.Gateway[0].Pin),
                        that.byId("simIMSIChosen").setText(data.Sim[0].IMSI),
                        that.byId("simMSASDNChosen").setText(data.Sim[0].MSASDN),
                        that.byId("contactNameChosen").setText(data.Contact),
                        that.byId("contactPhoneChosen").setText(data.ContactPhone),
                        that.byId("contactEmailChosen").setText(data.ContactEmail)
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
        return new Promise(function(fnResolve, fnReject) {
            that.getDataWizard().then(function(res) {
                let postData = res;

                let aData = jQuery.ajax({
                    type : "POST",
                    contentType : "application/json",
                    url : "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site",
                    dataType : "json",
                    data : JSON.stringify(postData),
                    async: false, 
                    success : function(data, textStatus, jqXHR) {
                        console.log(data);
                        MessageBox.success("El sitio " + data.name + " con ID " + data.ID + " se ha creado correctamente", {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction === MessageBox.Action.OK) {
                                    that.handleCancel();
                                }
                            }                          
                        });                     
                    },
                    error : function(XMLHttpRequest, textStatus, errorThrown) {
                        MessageBox.error("No se pudo crear el sitio. Contacta a la mesa de ayuda")
                    }
                });
               fnResolve(aData);
            });
        });

    },

    setCompanyTypeFromSegmented: function (evt) {
        var companyType = evt.getParameters().item.getText();
        this.model.setProperty("/companyType", companyType);
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