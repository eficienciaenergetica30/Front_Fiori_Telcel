sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library"
], function (Controller, UIComponent, mobileLibrary) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("globalhitss.ee.zone.controller.BaseController", {
        getZones: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    //url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$expand=Site&$filter=Site/DeletionRequest eq 0",
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$orderby=Site/Name,Name&$expand=Site&$filter=Site/DeletionRequest eq 0",
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

        getSites: function() {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$orderby=Name&$filter=DeletionRequest eq 0",
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

        getObjectZones: function(id) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$expand=Site&$filter=ID eq ${id}`,
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
                    url:"https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/CountryCatalog",
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

        getStates: function(country) {
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(fnResolve, fnReject) {
                jQuery.get({
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/StateCatalog?$filter=CountryCode eq '${country}'`,
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
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/StateCatalog?$filter=CountryCode eq '${country}'`,
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
                    url:`https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/TownCatalog?$filter=StateCode eq '${state}'`,
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
            return new Promise(function(fnResolve, fnReject) {
                let data = {
                    businessName: that.byId("businessNameInput").getValue(),
                    friendlyName: that.byId("friendlyNameInput").getValue(),
                    businessActivity: that.byId("businessActivityComboBox").getSelectedItem().getText(),
                    currency: that.byId("currencyComboBox").getSelectedItem().getText(),
                    address: {
                        addressType: "company",
                        country: that.byId("countryComboBox").getSelectedItem().getText(),
                        state: that.byId("stateComboBox").getSelectedItem().getText(),
                        town: that.byId("townComboBox").getSelectedItem().getText(),
                        postalCode: that.byId("postalCodeComboBox").getSelectedItem().getText(),
                        neighborhood: that.byId("neighborhoodComboBox").getSelectedItem().getText(),
                        street: that.byId("streetInput").getValue(),
                        extNumber: that.byId("numberInput").getValue(),
                        intNumber: that.byId("intNumberInput").getValue(),
                        latitude: parseFloat(that.byId("latitudeInput").getValue()) || null,
                        longitude: parseFloat(that.byId("longitudeInput").getValue()) || null,
                        builtArea: parseFloat(that.byId("builtAreaInput").getValue()) || null
                    }
                }
                sap.ui.core.BusyIndicator.hide();
                fnResolve(data);
            });
        },

        onCreate: function (postData) {
            sap.ui.core.BusyIndicator.show();
            let toPost = JSON.stringify(postData);
            return new Promise(function(fnResolve, fnReject) {
                
                $.ajax({
                    type: "POST",
                    url: "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Company",
                    async: true,
                    crossDomain: true,
                    dataType: "jsonp",
                    beforeSend: function(xhr) {
						xhr.setRequestHeader('Accept', 'application/json');
						xhr.setRequestHeader('Access-Control-Allow-Origin', "*");
                        xhr.setRequestHeader('Access-Control-Allow-Method', "POST");
                        xhr.setRequestHeader('Access-Control-Allow-Credemtials', true);
					},
                    contentType: 'application/json',
                    data: toPost,
                    success: function(response) {
                        sap.ui.core.BusyIndicator.hide();
						fnResolve(response.value);
					},
					error: function(error) {
                        sap.ui.core.BusyIndicator.hide();
						//let msg = error.responseJSON.error.message + ". Error: " + error.status +
						//	". Contacta a la mesa de ayuda";
                        let msg = "Error: Contacta a la mesa de ayuda";
						sap.ui.core.BusyIndicator.hide();
						fnReject(error);
						sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Service Error");
					}
                });
                
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