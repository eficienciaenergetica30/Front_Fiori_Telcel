sap.ui.define([
    "./BaseController",
    'sap/ui/core/library',
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, coreLibrary, MessageBox, JSONModel, History, formatter) {
    "use strict";

    var ValueState = coreLibrary.ValueState;

    return BaseController.extend("globalhitss.ee.site.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectView");

            let emtpyObject = {
                CompanyCollection: [],
                SiteStatusCollection: [],
                StatusID: "",
			};
            sap.ui.getCore().getConfiguration().setLanguage("es-MX");
			let oModelEmpty = new JSONModel(emtpyObject);
			this.getView().setModel(oModelEmpty);

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
        onNavBack: function () {
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
        _onObjectMatched: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            var that = this,
                oModelSiteInfo = new sap.ui.model.json.JSONModel(),
                sObjectId = oEvent.getParameter("arguments").objectId;
        
            that.getObjectSites(sObjectId)
                .then(function (res) {
                    var objectInfo = res[0];
                    oModelSiteInfo.setData(objectInfo);
                    that.getView().setModel(oModelSiteInfo, 'SiteInfo');
        
                    return Promise.all([that.getCompanies(), that.getSiteStatus()]);
                })
                .then(function ([companies, siteStatus]) {
                    let oCompanies = companies;
                    let companyId = that.getView().getModel('SiteInfo').getData().companyID;
                    let status = that.getView().getModel('SiteInfo').getData().status;
                    let oComboBox = that.getView().byId("friendlyName");
        
                    that.getView().getModel().setProperty("/CompanyCollection", oCompanies);
                    let oSelectedItem = oComboBox.getItems().find(function (oItem) {
                        return oItem.getKey() === companyId;
                    });
        
                    let oSiteStatus = siteStatus;
                    that.getView().getModel().setProperty("/SiteStatusCollection", oSiteStatus);
                    for (let i = 0; i < oSiteStatus.length; i++) {
                        if (oSiteStatus[i].name === status) {
                            that.getView().getModel().setProperty("/StatusID", oSiteStatus[i].ID);
                            break;
                        }
                    }
        
                    if (oSelectedItem) {
                        oComboBox.setSelectedItem(oSelectedItem);
                    }
        
                    sap.ui.core.BusyIndicator.hide();
                })
                .catch(function (error) {
                    console.error("Error:", error);
                    sap.ui.core.BusyIndicator.hide();
                });
        },        

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView: function (sObjectPath) {
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

        _onBindingChange: function () {
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
                sObjectId = oObject.name,
                sObjectName = oObject.Site;

            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        friendlyNameChange: function (oEvent) {
            let oComboBox = oEvent.getSource();
            let oSelectedItem = oComboBox.getSelectedItem();

            if (oSelectedItem) {
                let sAdditionalText = oSelectedItem.getAdditionalText();
                oComboBox.setValueState(ValueState.None)
                this.getView().byId("businessName").setValue(sAdditionalText);
            } else {
                console.error("No hay elemento seleccionado.");
            } 
        },

        geti18n: function (textToSearch) {
            return this.getView().getModel("i18n").getResourceBundle().getText(textToSearch);
        },

        editObject: function () {
            let that = this;
            that.getView().byId("InputSiteName").setEditable(true);
            that.getView().byId("friendlyName").setEditable(true);
            that.getView().byId("meter").setEditable(true);
            that.getView().byId("account").setEditable(true);
            that.getView().byId("companyDivision").setEditable(true);
            that.getView().byId("corporation").setEditable(true);
            that.getView().byId("businessUnit").setEditable(true);
            that.getView().byId("format").setEditable(true);
            that.getView().byId("rpu").setEditable(true);
            that.getView().byId("division").setEditable(true);
            that.getView().byId("fare").setEditable(true);
            that.getView().byId("region").setEditable(true);
            that.getView().byId("externalId").setEditable(true);
            that.getView().byId("costCenter").setEditable(true);
            that.getView().byId("costCenterEg").setEditable(true);
            that.getView().byId("sapAccount").setEditable(true);
            that.getView().byId("supplier").setEditable(true);
            that.getView().byId("folio1").setEditable(true);
            that.getView().byId("folio2").setEditable(true);
            that.getView().byId("siteType").setEditable(true);
            that.getView().byId("timeZone").setEditable(true);
            that.getView().byId("openHour").setEditable(true);
            that.getView().byId("closeHour").setEditable(true);
            that.getView().byId("siteStatusComboBox").setEditable(true);
            that.getView().byId("contractedDemand").setEditable(true);
            that.getView().byId("cutoffDate").setEditable(true);
            that.getView().byId("multiplier").setEditable(true);
            that.getView().byId("manager").setEditable(true);
            that.getView().byId("country").setEditable(true);
            that.getView().byId("state").setEditable(true);
            that.getView().byId("town").setEditable(true);
            that.getView().byId("postalCode").setEditable(true);
            that.getView().byId("neighborhood").setEditable(true);
            that.getView().byId("street").setEditable(true);
            that.getView().byId("extNumber").setEditable(true);
            that.getView().byId("intNumber").setEditable(true);
            that.getView().byId("latitude").setEditable(true);
            that.getView().byId("longitude").setEditable(true);
            that.getView().byId("countryCFE").setEditable(true);
            that.getView().byId("stateCFE").setEditable(true);
            that.getView().byId("townCFE").setEditable(true);
            that.getView().byId("postalCodeCFE").setEditable(true);
            that.getView().byId("neighborhoodCFE").setEditable(true);
            that.getView().byId("streetCFE").setEditable(true);
            that.getView().byId("extNumberCFE").setEditable(true);
            that.getView().byId("intNumberCFE").setEditable(true);
            that.getView().byId("constructedArea").setEditable(true);
            that.getView().byId("contact").setEditable(true);
            that.getView().byId("contactPhone").setEditable(true);
            that.getView().byId("contactEmail").setEditable(true);
            that.getView().byId("electricSupplier").setEditable(true);
            that.getView().byId("waterSupplier").setEditable(true);
            that.getView().byId("gasSupplier").setEditable(true);
            that.getView().byId("gatewayName").setEditable(true);
            that.getView().byId("gatewaySN").setEditable(true);
            that.getView().byId("gatewayPIN").setEditable(true);
            that.getView().byId("simIMSI").setEditable(true);
            that.getView().byId("simMSASDN").setEditable(true);
        },

        saveEditedObject: function () {
            let that = this,
                addressID,
                companyID,
                gatewayID,
                simID,
                statusText,
                id = that.getView().byId("siteID").getText(),
                comboboxFriendly = that.getView().byId("friendlyName"),
                siteStatusComboBox = that.getView().byId("siteStatusComboBox");

            companyID = comboboxFriendly.getSelectedKey();
            statusText = siteStatusComboBox.getSelectedItem()?.getText() ?? "";
            if (companyID.length == 0) {
                comboboxFriendly.setValueState(ValueState.Error);
				comboboxFriendly.setValueStateText(that.geti18n("companyStateText"));
                MessageBox.warning(that.geti18n("companyWarning"));
                comboboxFriendly.focus();
                return;
            }
            else comboboxFriendly.setValueState(ValueState.None);
            
            that.getSiteById(id).then(function (res) {
                addressID = res[0].AddressID;
                addressCFE = res[0].AddressCFE;
                gatewayID = res[0].GatewayID;
                simID = res[0].SimID;
                let data = {
                    ID: id,
                    Name: that.getView().byId("InputSiteName").getValue(),
                    BusinessUnit: that.getView().byId("businessUnit").getValue(),
                    Format: that.getView().byId("format").getValue(),
                    RPU: that.getView().byId("rpu").getValue(),
                    Division: that.getView().byId("division").getValue(),
                    Fare: that.getView().byId("fare").getValue(),
                    Region: that.getView().byId("region").getValue(),
                    Meter: that.getView().byId("meter").getValue(),
                    Account: that.getView().byId("account").getValue(),
                    CompanyDivision: that.getView().byId("companyDivision").getValue(),
                    Corporation: that.getView().byId("corporation").getValue(),
                    SapAccount: that.getView().byId("sapAccount").getValue(),
                    Supplier: that.getView().byId("supplier").getValue(),
                    Folio1: that.getView().byId("folio1").getValue(),
                    Folio2: that.getView().byId("folio2").getValue(),
                    CostCenter: that.getView().byId("costCenter").getValue(),
                    SiteType: that.getView().byId("siteType").getValue(),
                    TimeZone: that.getView().byId("timeZone").getValue(),
                    OpenHour: that.getView().byId("openHour").getValue(),
                    CloseHour: that.getView().byId("closeHour").getValue(),
                    Status: statusText,
                    ContractedDemand: parseInt(that.getView().byId("contractedDemand").getValue()),
                    CutoffDate: that.getView().byId("cutoffDate").getValue() || null,
                    CostCenterEg: that.getView().byId("costCenterEg").getValue(),
                    Multiplier: parseInt(that.getView().byId("multiplier").getValue()),
                    Manager: that.getView().byId("manager").getValue(),
                    ConstructedArea: parseFloat(that.getView().byId("constructedArea").getValue()),
                    Contact: that.getView().byId("contact").getValue(),
                    ContactPhone: that.getView().byId("contactPhone").getValue(),
                    ContactEmail: that.getView().byId("contactEmail").getValue(),
                    ElectricSupplier: [that.getView().byId("electricSupplier").getValue()],
                    GasSupplier: [that.getView().byId("gasSupplier").getValue()],
                    WaterSupplier: [that.getView().byId("waterSupplier").getValue()],
                    AddressID: addressID,
                    addressCFE: AddressCFE,
                    CompanyID: companyID,
                    GatewayID: gatewayID,
                    SimID: simID,
                    Address: {
                        ID: addressID,
                        AddressType: "site",
                        Country: that.getView().byId("country").getValue(),
                        State: that.getView().byId("state").getValue(),
                        Town: that.getView().byId("town").getValue(),
                        PostalCode: that.getView().byId("postalCode").getValue(),
                        Neighborhood: that.getView().byId("neighborhood").getValue(),
                        Street: that.getView().byId("street").getValue(),
                        ExtNumber: that.getView().byId("extNumber").getValue(),
                        IntNumber: that.getView().byId("intNumber").getValue(),
                        Latitude: parseFloat(that.getView().byId("latitude").getValue()),
                        Longitude: parseFloat(that.getView().byId("longitude").getValue()),
                    },
                    AddressCFE: {
                        ID: addressCFE,
                        AddressType: "cfe",
                        Country: that.getView().byId("countryCFE").getValue(),
                        State: that.getView().byId("stateCFE").getValue(),
                        Town: that.getView().byId("townCFE").getValue(),
                        PostalCode: that.getView().byId("postalCodeCFE").getValue(),
                        Neighborhood: that.getView().byId("neighborhoodCFE").getValue(),
                        Street: that.getView().byId("streetCFE").getValue(),
                        ExtNumber: that.getView().byId("extNumberCFE").getValue(),
                        IntNumber: that.getView().byId("intNumberCFE").getValue(),
                    },
                    Gateway: [
                        {
                            ID: gatewayID,
                            Name: that.getView().byId("gatewayName").getValue(),
                            SerialNumber: that.getView().byId("gatewaySN").getValue(),
                            Pin: that.getView().byId("gatewayPIN").getValue(),
                        }
                    ],
                    Sim: [
                        {
                            ID: simID,
                            MSASDN: that.getView().byId("simMSASDN").getValue(),
                            IMSI: that.getView().byId("simIMSI").getValue()
                        }
                    ]
                };
                return new Promise(function (fnResolve, fnReject) {
                    let aData = jQuery.ajax({
                        type: "PATCH",
                        contentType: "application/json",
                        url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site/${id}`,
                        dataType: "json",
                        data: JSON.stringify(data),
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            console.log(data);
                            let messageText = "El sitio " + data.Name + " con ID " + data.ID + " se ha modificado correctamente";
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
                            MessageBox.error("No se pudo editar el sitio. Contacta a la mesa de ayuda");
                        }
                    });
                    fnResolve(aData);
                });
            }
            );
        },

        handleCancel: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            let that = this;
            that.getView().byId("InputSiteName").setEditable(false);
            that.getView().byId("friendlyName").setEditable(false);
            that.getView().byId("meter").setEditable(false);
            that.getView().byId("account").setEditable(false);
            that.getView().byId("companyDivision").setEditable(false);
            that.getView().byId("corporation").setEditable(false);
            that.getView().byId("businessUnit").setEditable(false);
            that.getView().byId("format").setEditable(false);
            that.getView().byId("rpu").setEditable(false);
            that.getView().byId("division").setEditable(false);
            that.getView().byId("fare").setEditable(false);
            that.getView().byId("region").setEditable(false);
            that.getView().byId("externalId").setEditable(false);
            that.getView().byId("costCenter").setEditable(false);
            that.getView().byId("costCenterEg").setEditable(false);
            that.getView().byId("sapAccount").setEditable(false);
            that.getView().byId("supplier").setEditable(false);
            that.getView().byId("folio1").setEditable(false);
            that.getView().byId("folio2").setEditable(false);
            that.getView().byId("siteType").setEditable(false);
            that.getView().byId("timeZone").setEditable(false);
            that.getView().byId("openHour").setEditable(false);
            that.getView().byId("closeHour").setEditable(false);
            that.getView().byId("siteStatusComboBox").setEditable(false);
            that.getView().byId("contractedDemand").setEditable(false);
            that.getView().byId("cutoffDate").setEditable(false);
            that.getView().byId("multiplier").setEditable(false);
            that.getView().byId("manager").setEditable(false);
            that.getView().byId("country").setEditable(false);
            that.getView().byId("state").setEditable(false);
            that.getView().byId("town").setEditable(false);
            that.getView().byId("postalCode").setEditable(false);
            that.getView().byId("neighborhood").setEditable(false);
            that.getView().byId("street").setEditable(false);
            that.getView().byId("extNumber").setEditable(false);
            that.getView().byId("intNumber").setEditable(false);
            that.getView().byId("latitude").setEditable(false);
            that.getView().byId("longitude").setEditable(false);
            that.getView().byId("countryCFE").setEditable(false);
            that.getView().byId("stateCFE").setEditable(false);
            that.getView().byId("townCFE").setEditable(false);
            that.getView().byId("postalCodeCFE").setEditable(false);
            that.getView().byId("neighborhoodCFE").setEditable(false);
            that.getView().byId("streetCFE").setEditable(false);
            that.getView().byId("extNumberCFE").setEditable(false);
            that.getView().byId("intNumberCFE").setEditable(false);
            that.getView().byId("constructedArea").setEditable(false);
            that.getView().byId("contact").setEditable(false);
            that.getView().byId("contactPhone").setEditable(false);
            that.getView().byId("contactEmail").setEditable(false);
            that.getView().byId("electricSupplier").setEditable(false);
            that.getView().byId("waterSupplier").setEditable(false);
            that.getView().byId("gasSupplier").setEditable(false);
            that.getView().byId("gatewayName").setEditable(false);
            that.getView().byId("gatewaySN").setEditable(false);
            that.getView().byId("gatewayPIN").setEditable(false);
            that.getView().byId("simIMSI").setEditable(false);
            that.getView().byId("simMSASDN").setEditable(false);
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
            let siteID = that.getView().byId("siteID").getText(),
                promiseArray = [],
                deletionRequestSite = {},
                deletionRequestZone = {},
                deletionRequestSensor = {};

            if (deleteValue) {
                deletionRequestSite.deletionRequest = 1;
                deletionRequestZone.deletionRequest = 2;
                deletionRequestSensor.deletionRequest = 2;
            }
            else {
                deletionRequestSite.deletionRequest = 0;
                deletionRequestZone.deletionRequest = 0;
                deletionRequestSensor.deletionRequest = 0;
            }

            promiseArray.push(new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type: "PATCH",
                    contentType: "application/json",
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site/${siteID}`,
                    dataType: "json",
                    data: JSON.stringify(deletionRequestSite),
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        console.log(data);
                        let messageText = "El sitio " + data.Name + " con ID " + data.ID + ((deleteValue) ? " se ha eliminado correctamente" : " se ha restaurado correctamente");
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
                            MessageBox.error("No se pudo eliminar el sitio. Contacta a la mesa de ayuda");
                        }
                        else {
                            MessageBox.error("No se pudo restaurar el sitio. Contacta a la mesa de ayuda");
                        }
                    }
                });
                fnResolve(aData);
            }));

            that.getZoneSite(siteID).then(function (res) {
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

                Promise.all(promiseArray).then(values => {
                    console.log(values);
                }).catch(reason => {
                    console.log(reason)
                });
            });

        },

        deleteObject: function () {
            let that = this,
                id = that.getView().byId("siteID").getText();
            //that.deleteSite(id).then(function(res) {
            return new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type: "DELETE",
                    contentType: "application/json",
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site/${id}`,
                    dataType: "json",
                    //data : JSON.stringify(data),
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        MessageBox.success("El sitio ha sido borrado correctamente", {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction === MessageBox.Action.OK) {
                                    that.handleDelete();
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
            //}
            //);
        },

        handleDelete: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("worklist", true);
        }

    });

});
