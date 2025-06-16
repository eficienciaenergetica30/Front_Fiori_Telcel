sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library"
], function (Controller, UIComponent, mobileLibrary) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("globalhitss.ee.site.controller.BaseController", {

        getSites: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    //url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site",
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$expand=Address",
                    //url:"https://eficiencia-energetica-dev-ee-tables-srv.cfapps.us10.hana.ondemand.com/site/Site?$expand=Address",
                    //url:"https://global-hitss-app-backend-prd10-srv.cfapps.us10.hana.ondemand.com/site/Site?$expand=Address",

                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status + ". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });

        },

        getObjectSites: function(id) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$expand=Company,Address,Gateway,Sim,Zone&$filter=ID eq ${id}`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteById: function(id) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$filter=ID eq ${id}`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        deleteSite: function(id) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.remove({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site/${id}`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getCompanies: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Company?$expand=Address",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });

        },

        getSiteTypes: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SiteTypeCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });

        },

        getSiteFormat: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SiteFormatCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteBusinessUnit: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/BusinessActivityCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteDivision: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/DivisionCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteRegion: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SiteRegionCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteStatus: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SiteStatusCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteManager: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SiteManagerCatalog",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteElectricSuppliers: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/ElectricSuppliers",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteGasSuppliers: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/GasSuppliers",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getSiteWaterSuppliers: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/WaterSuppliers",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getZoneSite: function(id) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$filter=SiteID eq '${id}'`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status + ". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });

        },

        
        getSensorZone: function(id) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor?$filter=ZoneID eq '${id}'`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status + ". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });

        },

        getCountries: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/CountryCatalog?$orderby=Name asc",
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getStatesV2: function(country) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/StateCatalog?$filter=CountryCode eq '${country}'&$orderby=Name asc`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getTowns: function(state) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/TownCatalog?$filter=StateCode eq '${state}'&$orderby=Town asc`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getPostalCodes: function(state, town) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/PostalCatalog?$filter=StateCode eq '${state}' and Town eq '${town}'`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getNeighborhoods: function(cp) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/NeighborhoodCatalog?$filter=PostalCode eq '${cp}'`,
                    success: function(data) {
						fnResolve(data.value);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						var msg = error.responseJSON.error.message + ". Error: " + error.status +
							". Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
            });
        },

        getDataWizard: function() {
            let that = this;
            sap.ui.core.BusyIndicator.show();
            let electricValues = that.byId("electricSupplierComboBox").getSelectedItems(),
                gasValues      = that.byId("gasSupplierComboBox").getSelectedItems(),
                waterValues    = that.byId("waterSupplierComboBox").getSelectedItems();
            let electricData = [],
                gasData      = [],
                waterData    = [];
            electricValues.forEach(element => electricData.push(element.mProperties.text));
            gasValues.forEach(element => gasData.push(element.mProperties.text));
            waterValues.forEach(element => waterData.push(element.mProperties.text));
            
            return new Promise(function(fnResolve, fnReject) {
                let data = {
                    CompanyID: that.byId("companyComboBox").getSelectedKey(),
                    Name: that.byId("siteNameInput").getValue(),
                    SiteType: that.byId("siteTypeComboBox").getValue(),  
                    Meter: that.byId("meterInput").getValue(),
                    Account: that.byId("accountInput").getValue(),
                    CompanyDivision: that.byId("companyDivisionInput").getValue(),
                    BusinessUnit: that.byId("siteBusinessUnitComboBox").getValue(),
                    Format: that.byId("siteFormatComboBox").getValue(),
                    RPU: that.byId("siteRPUInput").getValue(),
                    Division: that.byId("siteDivisionComboBox").getValue(),
                    Corporation: that.byId("corporationInput").getValue(),
                    Fare: that.byId("siteFareInput").getValue(),
                    Region: that.byId("siteRegionComboBox").getValue(),
                    ExternalId: that.byId("externalIdComboBox").getValue(),
                    CostCenter: that.byId("siteCostCenterInput").getValue(),
                    CostCenterEg: that.byId("siteCostCenterEgInput").getValue(),
                    SapAccount: that.byId("sapAccountInput").getValue(),
                    Supplier: that.byId("supplierInput").getValue(),
                    Folio1: that.byId("folio1Input").getValue(),
                    Folio2: that.byId("folio2Input").getValue(),
                    TimeZone: (that.byId("timeZoneComboBox").getSelectedItem() === null) ? null: that.byId("timeZoneComboBox").getSelectedItem().getText(),
                    OpenHour: (that.byId("openHourComboBox").getSelectedItem() === null) ? null : that.byId("openHourComboBox").getSelectedItem().getText(),
                    CloseHour: (that.byId("closeHourComboBox").getSelectedItem() === null) ? null : that.byId("closeHourComboBox").getSelectedItem().getText(),
                    Status: that.byId("siteStatusComboBox").getValue(),
                    ContractedDemand: parseInt(that.byId("siteContractedDemandInput").getValue()) || null,
                    CutoffDate: that.byId("siteCutoffDateInput").getValue() || null,
                    Multiplier: parseInt(that.byId("siteMultiplierInput").getValue()) || null,
                    Manager: that.byId("siteManagerComboBox").getValue(),
                    ConstructedArea: parseFloat(that.byId("constructedAreaInput").getValue()) || null,
                    Contact: that.byId("contactNameInput").getValue(),
                    ContactPhone: that.byId("contactPhoneInput").getValue() || null,
                    ContactEmail: that.byId("contactEmailInput").getValue() || null,
                    DeletionRequest: 0,
                    Address: {
                        AddressType: "site",
                        Country: that.byId("countryComboBox").getSelectedItem().getText(),
                        State: that.byId("stateComboBox").getSelectedItem().getText(),
                        Town: that.byId("townComboBox").getSelectedItem().getText(),
                        PostalCode: that.byId("postalCodeComboBox").getSelectedItem().getText(),
                        Neighborhood: that.byId("neighborhoodComboBox").getSelectedItem().getText(),
                        Street: that.byId("streetInput").getValue(),
                        ExtNumber: that.byId("numberInput").getValue(),
                        IntNumber: that.byId("intNumberInput").getValue(),
                        Latitude: parseFloat(that.byId("latitudeInput").getValue()) || null,
                        Longitude: parseFloat(that.byId("longitudeInput").getValue()) || null
                    },
                    AddressCFE: {
                        AddressType: "cfe",
                        Country: that.byId("countryComboBoxCFE").getSelectedItem().getText(),
                        State: that.byId("stateComboBoxCFE").getSelectedItem().getText(),
                        Town: that.byId("townComboBoxCFE").getSelectedItem().getText(),
                        PostalCode: that.byId("postalCodeComboBoxCFE").getSelectedItem().getText(),
                        Neighborhood: that.byId("neighborhoodComboBoxCFE").getSelectedItem().getText(),
                        Street: that.byId("streetInputCFE").getValue(),
                        ExtNumber: that.byId("numberInputCFE").getValue(),
                        IntNumber: that.byId("intNumberInputCFE").getValue()
                    },
                    ElectricSupplier: [electricData.join()],
                    GasSupplier: [gasData.join()],
                    WaterSupplier: [waterData.join()],
                    Gateway: [
                        {
                            Name: that.byId("gatewayNameInput").getValue(),
                            SerialNumber: that.byId("gatewaySNInput").getValue(),
                            Pin: that.byId("gatewayPINInput").getValue()
                        }
                    ],
                    Sim: [
                        {
                            MSASDN: that.byId("simMSASDNInput").getValue(),
                            IMSI: that.byId("simIMSIInput").getValue()
                        }
                    ]
                }
                sap.ui.core.BusyIndicator.hide();
                fnResolve(data);
            });
        },

        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter : function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel : function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress : function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        }
    });

});