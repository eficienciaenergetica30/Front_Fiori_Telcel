sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("globalhitss.ee.company.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            sap.ui.getCore().getConfiguration().setLanguage("es-MX");
            var oViewModel = new JSONModel({
                    busy : false,
                    delay : 0
                });
            this.setModel(oViewModel, "objectView");
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            
        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        /*_onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/Company" + sObjectId);
            //this._bindView("/Company" + "(" + sObjectId + ")");
        },*/

        _onObjectMatched : function (oEvent) {
            var that = this,
                oModelCompanyInfo = new sap.ui.model.json.JSONModel(),
                sObjectId =  oEvent.getParameter("arguments").objectId;
                that.getObjectCompanies(sObjectId).then(function(res) {
                    var objectInfo = res[0];
                    oModelCompanyInfo.setData(objectInfo);
                    var businessItems = that.getView().byId("businessActivityComboBox").getItems();
                    var currencyItems = that.getView().byId("currencyComboBox").getItems();
                    businessItems.forEach(function callback(v) {
                        if (v.mProperties.text == objectInfo.businessActivity) {
			                that.getView().byId("businessActivityComboBox").setSelectedKey(v.mProperties.key);
                        }
                    }); 
                    currencyItems.forEach(function callback(v) {
                        if (v.mProperties.text == objectInfo.currency) {
			                that.getView().byId("currencyComboBox").setSelectedKey(v.mProperties.key);
                        }
                    });
                    that.getView().setModel(oModelCompanyInfo, 'CompanyInfo');
                });
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                
                sObjectId = oObject.friendlyName,
                sObjectName = oObject.Company;

                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
              
        },

        geti18n: function (textToSearch) {
            return this.getView().getModel("i18n").getResourceBundle().getText(textToSearch);
        },

        editObject : function () {
            let that = this;

            that.getView().byId("businessName").setEditable(true);
            that.getView().byId("friendlyName").setEditable(true);
            that.getView().byId("country").setEditable(true);
            that.getView().byId("state").setEditable(true);
            that.getView().byId("town").setEditable(true);
            that.getView().byId("postalCode").setEditable(true);
            that.getView().byId("neighborhood").setEditable(true);
            that.getView().byId("street").setEditable(true);
            that.getView().byId("number").setEditable(true);
            that.getView().byId("intNumber").setEditable(true);
            that.getView().byId("latitude").setEditable(true);
            that.getView().byId("longitude").setEditable(true);
            that.getView().byId("builtArea").setEditable(true);
            that.getView().byId("businessActivityComboBox").setEditable(true);
            that.getView().byId("currencyComboBox").setEditable(true);
        },

        disableFields: function () {
            let that = this;
            that.getView().byId("businessName").setEditable(false);
            that.getView().byId("friendlyName").setEditable(false);
            that.getView().byId("country").setEditable(false);
            that.getView().byId("state").setEditable(false);
            that.getView().byId("town").setEditable(false);
            that.getView().byId("postalCode").setEditable(false);
            that.getView().byId("neighborhood").setEditable(false);
            that.getView().byId("street").setEditable(false);
            that.getView().byId("number").setEditable(false);
            that.getView().byId("intNumber").setEditable(false);
            that.getView().byId("latitude").setEditable(false);
            that.getView().byId("longitude").setEditable(false);
            that.getView().byId("builtArea").setEditable(false);
            that.getView().byId("businessActivityComboBox").setEditable(false);
            that.getView().byId("currencyComboBox").setEditable(false);
        },

        handleCancel: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.disableFields();
            oRouter.navTo("worklist", true);
        },

        softDeleteObject: function () {
            this.updateDeletionRequest(true);
        },

        restoreObject: function () {
            this.updateDeletionRequest(false);
        },

        updateDeletionRequest: function (deleteValue) {
            let that = this;
            let companyID = that.getView().byId("companyID").getText(),
                promiseArray = [],
                deletionRequestCompany = {},
                deletionRequestSite = {},
                deletionRequestZone = {},
                deletionRequestSensor = {};

            if (deleteValue) {
                deletionRequestCompany.deletionRequest = 1;
                deletionRequestSite.deletionRequest = 2;
                deletionRequestZone.deletionRequest = 2;
                deletionRequestSensor.deletionRequest = 2;
            }
            else {
                deletionRequestCompany.deletionRequest = 0;
                deletionRequestSite.deletionRequest = 0;
                deletionRequestZone.deletionRequest = 0;
                deletionRequestSensor.deletionRequest = 0;
            }

            sap.ui.core.BusyIndicator.show();

            promiseArray.push(new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type: "PATCH",
                    contentType: "application/json",
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Company/${companyID}`,
                    dataType: "json",
                    data: JSON.stringify(deletionRequestCompany),
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        console.log(data);
                        let messageText = "La compañía " + data.FriendlyName + " con ID " + data.ID + ((deleteValue) ? " se ha eliminado correctamente" : " se ha restaurado correctamente");
                        MessageBox.success(messageText, {
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
                        if (deleteValue) {
                            MessageBox.error("No se pudo eliminar la compañía. Contacta a la mesa de ayuda");
                        }
                        else {
                            MessageBox.error("No se pudo restaurar la compañía. Contacta a la mesa de ayuda");
                        }
                    }
                });
                fnResolve(aData);
            }));

            that.getSiteCompany(companyID).then(function (res) {
                res.forEach(element => {
                    if (element.deletionRequest == 0 || element.deletionRequest == 2) {
                        promiseArray.push(new Promise(function (fnResolve, fnReject) {
                            let aData = jQuery.ajax({
                                type: "PATCH",
                                contentType: "application/json",
                                url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site/${element.ID}`,
                                dataType: "json",
                                data: JSON.stringify(deletionRequestSite),
                                async: false,
                                success: function (data, textStatus, jqXHR) {
                                    console.log(data);
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    console.log(textStatus);
                                }
                            });
                            fnResolve(aData);
                        }));

                        that.getZoneSite(element.ID).then(function (res) {
                            res.forEach(element => {
                                if (element.deletionRequest == 0 || element.deletionRequest == 2) {
                                    promiseArray.push(new Promise(function (fnResolve, fnReject) {
                                        let aData = jQuery.ajax({
                                            type: "PATCH",
                                            contentType: "application/json",
                                            url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone/${element.ID}`,
                                            dataType: "json",
                                            data: JSON.stringify(deletionRequestZone),
                                            async: false,
                                            success: function (data, textStatus, jqXHR) {
                                                console.log(data);
                                            },
                                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                                console.log(textStatus);
                                            }
                                        });
                                        fnResolve(aData);
                                    }));

                                    that.getSensorZone(element.ID).then(function (res) {
                                        res.forEach(element => {
                                            if (element.deletionRequest == 0 || element.deletionRequest == 2) {
                                                promiseArray.push(new Promise(function (fnResolve, fnReject) {
                                                    let aData = jQuery.ajax({
                                                        type: "PATCH",
                                                        contentType: "application/json",
                                                        url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor/${element.ID}`,
                                                        dataType: "json",
                                                        data: JSON.stringify(deletionRequestSensor),
                                                        async: false,
                                                        success: function (data, textStatus, jqXHR) {
                                                            console.log(data);
                                                        },
                                                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                                                            console.log(textStatus);
                                                        }
                                                    });
                                                    fnResolve(aData);
                                                }));
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                });

                Promise.all(promiseArray).then(values => {
                    console.log(values);
                    sap.ui.core.BusyIndicator.hide();
                }).catch(reason => {
                    console.log(reason);
                    sap.ui.core.BusyIndicator.hide();
                });
            });
            sap.ui.core.BusyIndicator.hide();

        },

        validateFields: function () {
            let that = this;
            let companyID = that.getView().byId("companyID").getText(),
                businessName = that.getView().byId("businessName").getValue() || "",
                friendlyName = that.getView().byId("friendlyName").getValue() || "",
                businessActivity = that.getView().byId("businessActivityComboBox").getValue() || "",
                currency = that.getView().byId("currencyComboBox").getValue() || "",
                country = that.getView().byId("country").getValue() || "",
                state = that.getView().byId("state").getValue() || "",
                town = that.getView().byId("town").getValue() || "",
                postalCode = that.getView().byId("postalCode").getValue() || "",
                neighborhood = that.getView().byId("neighborhood").getValue() || "",
                street = that.getView().byId("street").getValue() || "",
                extNumber = that.getView().byId("number").getValue() || "";

            let company = {
                ID: companyID, 
                companyData: {
                    BusinessName: businessName,
                    FriendlyName: friendlyName,
                    BusinessActivity: (businessActivity.length > 0) ? that.getView().byId("businessActivityComboBox").getSelectedItem().getText() : "",
                    Currency: (currency.length > 0) ? that.getView().byId("currencyComboBox").getSelectedItem().getText() : "",
                    AddressID: that.getView().byId("addressIDInvisible").getText() || "",
                    Address: {
                        AddressType: "company",
                        Country: country,
                        State: state,
                        Town: town,
                        PostalCode: postalCode,
                        Neighborhood: neighborhood,
                        Street: street,
                        ExtNumber: extNumber,
                        IntNumber: that.getView().byId("intNumber").getValue(),
                        Latitude: parseFloat(that.getView().byId("latitude").getValue()) || null,
                        Longitude: parseFloat(that.getView().byId("longitude").getValue()) || null,
                        BuiltArea: parseFloat(that.getView().byId("builtArea").getValue()) || null
                    }
                }
            };

            if (businessName.length == 0) {
                MessageBox.warning(that.geti18n("businessNameWarning"));
                return;
            }

            if (friendlyName.length == 0) {
                MessageBox.warning(that.geti18n("friendlyNameWarning"));
                return;
            }
            
            if (country.length == 0) {
                MessageBox.warning(that.geti18n("countryWarning"));
                return;
            }

            if (state.length == 0) {
                MessageBox.warning(that.geti18n("stateWarning"));
                return;
            }

            if (town.length == 0) {
                MessageBox.warning(that.geti18n("townWarning"));
                return;
            }

            if (postalCode.length == 0) {
                MessageBox.warning(that.geti18n("postalCodeWarning"));
                return;
            }

            if (neighborhood.length == 0) {
                MessageBox.warning(that.geti18n("neighborhoodWarning"));
                return;
            }

            if (street.length == 0) {
                MessageBox.warning(that.geti18n("streetWarning"));
                return;
            }

            if (extNumber.length == 0) {
                MessageBox.warning(that.geti18n("numberWarning"));
                return;
            }

            if (businessActivity.length == 0) {
                MessageBox.warning(that.geti18n("businessActivityWarning"));
                return;
            }   
            
            if (currency.length == 0) {
                MessageBox.warning(that.geti18n("currencyWarning"));
                return;
            } 

            return company;
        },

        saveEditedObject: function () {
            let that = this,
                company = that.validateFields(); 

            if (typeof company === 'object' && !Array.isArray(company) && company !== null) {
                
                return new Promise(function(fnResolve, fnReject) {
                    let aData = jQuery.ajax({
                        type : "PATCH",
                        contentType : "application/json",
                        url : `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Company/${company.ID}`,
                        dataType : "json",
                        data : JSON.stringify(company.companyData),
                        async: false, 
                        success : function(data, textStatus, jqXHR) {
                            console.log(data);
                            let messageText = "La compañía " + data.FriendlyName + " con ID " + data.ID + " se ha modificado correctamente";
                            MessageBox.success(messageText, {
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
                            MessageBox.error("No se pudo editar la compañía. Contacta a la mesa de ayuda");
                        }
                    });
                    fnResolve(aData);
                });
            }
        }
        
    });

});
