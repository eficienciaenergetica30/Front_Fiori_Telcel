sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("globalhitss.ee.zone.controller.Object", {

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
            let that = this;
			let emtpyObject = {
                SiteCollection: []
			};
            sap.ui.getCore().getConfiguration().setLanguage("es-MX");
			let oModelEmpty = new JSONModel(emtpyObject);
            oModelEmpty.setSizeLimit(10000);
			that.getView().setModel(oModelEmpty);

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
        _onObjectMatched : function (oEvent) {
            var that = this,
                oModelZoneInfo = new sap.ui.model.json.JSONModel(),
                sObjectId =  oEvent.getParameter("arguments").objectId;
                that.getObjectZones(sObjectId).then(function(res) {
                    var objectInfo = res[0];
                    oModelZoneInfo.setData(objectInfo);
                    that.getView().setModel(oModelZoneInfo, 'ZoneInfo');
                });
            that.getSites().then(function(res) {
                let oSites = res;
                that.getView().getModel().setProperty("/SiteCollection", oSites);
                sap.ui.core.BusyIndicator.hide();
            });
            that.disableFields();
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
            that.getView().byId("zoneName").setEditable(true);
        },

        disableFields: function () {
            let that = this;
            that.getView().byId("zoneName").setEditable(false);
        },

        handleCancel: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.disableFields();
            oRouter.navTo("worklist", {}, true);
        },

        softDeleteObject: function () {
            this.updateDeletionRequest(true);
        },

        restoreObject: function () {
            this.updateDeletionRequest(false);
        },

        updateDeletionRequest: function (deleteValue) {
            let that = this;
            let zoneID = that.getView().byId("zoneID").getText(),
                promiseArray = [],
                deletionRequestZone = {},
                deletionRequestSensor = {};

            if (deleteValue) {
                deletionRequestZone.DeletionRequest = 1;
                deletionRequestSensor.DeletionRequest = 2;
            }
            else {
                deletionRequestZone.DeletionRequest = 0;
                deletionRequestSensor.DeletionRequest = 0;
            }

            promiseArray.push(new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type: "PATCH",
                    contentType: "application/json",
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone/${zoneID}`,
                    dataType: "json",
                    data: JSON.stringify(deletionRequestZone),
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        console.log(data);
                        let messageText = "La zona " + data.Name + " con ID " + data.ID + ((deleteValue) ? " se ha eliminado correctamente" : " se ha restaurado correctamente");
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
                            MessageBox.error("No se pudo eliminar la zona. Contacta a la mesa de ayuda");
                        }
                        else {
                            MessageBox.error("No se pudo restaurar la zona. Contacta a la mesa de ayuda");
                        }
                    }
                });
                fnResolve(aData);
            }));

            that.getSensorZone(zoneID).then(function(res) {
                res.forEach(element => {
                    if (element.DeletionRequest == 0 || element.DeletionRequest == 2) {
                        promiseArray.push(new Promise(function(fnResolve, fnReject) {
                            let aData = jQuery.ajax({
                                type : "PATCH",
                                contentType : "application/json",
                                url : `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor/${element.ID}`,
                                dataType : "json",
                                data : JSON.stringify(deletionRequestSensor),
                                async: false, 
                                success : function(data, textStatus, jqXHR) {
                                    console.log(data);                   
                                },
                                error : function(XMLHttpRequest, textStatus, errorThrown) {
                                    console.log(textStatus);
                                }
                            });
                            fnResolve(aData);
                    }));
                    }
                });

                Promise.all(promiseArray).then(values => {
                    console.log(values);
                }).catch(reason => {
                    console.log(reason)
                });
            });

        },

        validateFields: function () {
            let that = this;
            let zoneID = that.getView().byId("zoneID").getText(),
                zoneName = that.getView().byId("zoneName").getValue() || "";

            let zone = {
                ID: zoneID, 
                zoneData: {
                    Name: zoneName
                }
            };

            if (zoneName.length == 0) {
                MessageBox.warning(that.geti18n("nameWarning"));
                return;
            }

            return zone;
        },

        saveEditedObject: function () {
            let that = this,
                zone = that.validateFields();

            if (typeof zone === 'object' && !Array.isArray(zone) && zone !== null) {
                
                return new Promise(function(fnResolve, fnReject) {
                    let aData = jQuery.ajax({
                        type : "PATCH",
                        contentType : "application/json",
                        url : `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone/${zone.ID}`,
                        dataType : "json",
                        data : JSON.stringify(zone.zoneData),
                        async: false, 
                        success : function(data, textStatus, jqXHR) {
                            let messageText = "La zona " + data.Name + " con ID " + data.ID + " se ha modificado correctamente";
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
                            MessageBox.error("No se pudo editar la zona. Contacta a la mesa de ayuda");
                        }
                    });
                    fnResolve(aData);
                });
            }
        }
    });

});
