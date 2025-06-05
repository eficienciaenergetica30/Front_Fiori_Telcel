sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("globalhitss.ee.sensor.controller.Object", {

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
            sap.ui.core.BusyIndicator.show();
			let that = this;
			let emtpyObject = {
                SensorZoneID: "",
                ZoneCollection: []
			};
            sap.ui.getCore().getConfiguration().setLanguage("es-MX");
			let oModelEmpty = new JSONModel(emtpyObject);
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
                oModelSensorInfo = new JSONModel(),
                sObjectId = oEvent.getParameter("arguments").objectId,
                sensorTypeName = null,
                sensorLocationName = null,
                siteID;
        
            sap.ui.core.BusyIndicator.show(0);
        
            that.getObjectSensors1(sObjectId).then(function(res) {
                var objectInfo = res[0];
                sensorTypeName = res[0].sensorType;
                sensorLocationName = res[0].location;
                siteID = objectInfo.siteID;
        
                if (objectInfo.parent === 'GATEWAY' || objectInfo.parent === 'SENSOR') {
                    that.getView().byId("sensorBlockLabel").setVisible(false);
                    that.getView().byId("block").setVisible(false);
                    that.getView().byId("modbusAddress").setRequired(true);
                    that.getView().byId("baudRate").setRequired(true);
                    that.getView().getModel().setProperty("/isSensorVisible", false);
                    that.getView().byId("sensorLocationComboBox").setRequired(false);
                    that.getView().byId("sensorParentComboBox").setRequired(false);
                } else {
                    that.getView().byId("sensorBlockLabel").setVisible(true);
                    that.getView().byId("block").setVisible(true);
                    that.getView().byId("modbusAddress").setRequired(false);
                    that.getView().byId("baudRate").setRequired(false);
                    let isVisible = (sensorTypeName === "Temperatura" || sensorTypeName === "Contacto");
                    that.getView().getModel().setProperty("/isSensorVisible", isVisible);
                    that.getView().byId("sensorLocationComboBox").setRequired(true);
                    that.getView().byId("sensorParentComboBox").setRequired(true);
                }
        
                oModelSensorInfo.setData(objectInfo);
                that.getView().setModel(oModelSensorInfo, 'SensorInfo');
        
                return that.getSensorType();
            }).then(function(sensorTypeRes) {
                that.getView().getModel().setProperty("/SensorTypeCollection", sensorTypeRes);
                that.getView().getModel().setProperty("/SensorTypeID", sensorTypeRes.find(v => v.name === sensorTypeName)?.ID || "");
        
                return that.getSensorLocation();
            }).then(function(sensorLocationRes) {
                that.getView().getModel().setProperty("/SensorLocationCollection", sensorLocationRes);
                that.getView().getModel().setProperty("/SensorLocationID", sensorLocationRes.find(v => v.name === sensorLocationName)?.ID || "");

                let sensorLocationComboBox = that.getView().byId("sensorLocationComboBox");
                let oBinding = sensorLocationComboBox.getBinding("items");
                let aFilters = [];

                if (sensorTypeName === "Contacto") {
                    aFilters.push(new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.EQ, "Conservación"),
                            new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.EQ, "Congelación")
                        ],
                        and: false 
                    }));
                }
                oBinding.filter(aFilters);
        
                return that.getSensorZone(siteID);
            }).then(function(zoneRes) {
                let zoneID = that.getView().byId("zoneIDInvisible").getText();
                let oZones = zoneRes;
                for (let i = 0; i < oZones.length; i++) {
                    if (oZones[i].ID === zoneID) {
                        that.getView().getModel().setProperty("/SensorZoneID", oZones[i].ID);
                        break;
                    }
                }
                that.getView().getModel().setProperty("/ZoneCollection", oZones);
            
                return that.getSensorParent(siteID);
            }).then(function(sensors) {
                let oModel = new sap.ui.model.json.JSONModel();
                let sensorParentsArray = [];

                if (sensors.length === 0) {
                    oModel.setData({ SensorParents: [] });
                    that.getView().byId("sensorParentComboBox").setModel(oModel, "SensorParent");
                    that.getView().getModel().setProperty("/SensorParentID", "0");
                } else {
                    sensors.unshift({
                        ID: "0",
                        name: "Selecciona el padre",
                        zone: {
                            ID: "",
                            name: "",
                            sensorType: "",
                            site: {
                                ID: "",
                                name: ""
                            }
                        }
                    });

                    sensorParentsArray = sensors;
                    that.getView().getModel().setProperty("/AllSensorParents", sensorParentsArray);
                    oModel.setData({ SensorParents: sensorParentsArray });

                    const filtered = that.filterSensorParentsByType(sensorParentsArray, sensorTypeName);
                    oModel.setData({ SensorParents: filtered });

                    that.getView().byId("sensorParentComboBox").setModel(oModel, "SensorParent");
                    const currentSensor = that.getView().getModel("SensorInfo").getProperty("/parent");
                    that.getView().getModel().setProperty("/SensorParentID", currentSensor || "0");
                }

                sap.ui.core.BusyIndicator.hide();
            }).catch(function(error) {
                console.error("Error en _onObjectMatched:", error);
        
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

        zoneChange: function(oEvent) {
            let oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
                oZoneModel = this.getModel().oData.ZoneCollection,
                that = this;

            oZoneModel.forEach(function callback(v) {
                if (v.ID == sSelectedKey) {
                    that.getView().byId("sensorSiteIDInvisible").setText(v.siteID);
                }
            });
        },

        typeChange: function(oEvent) {
            let that = this;
            let sensorLocationComboBox = that.byId("sensorLocationComboBox");
            let sensorParentComboBox = that.byId("sensorParentComboBox");
            let sensorLocation = that.byId("sensorLocationLabel");
            let sensorParent = that.byId("sensorParentLabel");
            let keyComboBoxType = oEvent.oSource.getSelectedItem().getText();
            let isVisible = keyComboBoxType === "Temperatura" || keyComboBoxType === "Contacto";
            let oBinding = sensorLocationComboBox.getBinding("items");

            if (oBinding && isVisible) {
                let aFilters = [];
                if (keyComboBoxType === "Contacto") {
                    aFilters.push(new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.EQ, "Conservación"),
                            new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.EQ, "Congelación")
                        ],
                        and: false 
                    }));
                }
                oBinding.filter(aFilters);

                let allSensorParents = that.getView().getModel().getProperty("/AllSensorParents") || [];
                let filtered = that.filterSensorParentsByType(allSensorParents, keyComboBoxType);

                let oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({ SensorParents: filtered });
                sensorParentComboBox.setModel(oModel, "SensorParent");
                const firstValidParent = filtered.find(item => item.ID !== "0");
                const selectedId = firstValidParent ? firstValidParent.ID : "0";

                sensorParentComboBox.setSelectedKey(selectedId);
                that.getView().getModel().setProperty("/SensorParentID", selectedId);
            }

            sensorLocation.setVisible(isVisible);
            sensorLocationComboBox.setVisible(isVisible);
            sensorParent.setVisible(isVisible);
            sensorParentComboBox.setVisible(isVisible);
        },

        geti18n: function (textToSearch) {
            return this.getView().getModel("i18n").getResourceBundle().getText(textToSearch);
        },

        editObject : function () {
            let that = this;
            that.getView().byId("sensorName").setEditable(true);
            that.getView().byId("sensorTypeComboBox").setEditable(true);
            that.getView().byId("modbusAddress").setEditable(true);
            that.getView().byId("baudRate").setEditable(true);
            that.getView().byId("serialNumber").setEditable(true);
            that.getView().byId("type").setEditable(true);
            that.getView().byId("sensorLocationComboBox").setEditable(true);
            that.getView().byId("sensorParentComboBox").setEditable(true);
            that.getView().byId("sensorZoneComboBox").setEditable(true);
            if (that.getView().byId("sensorParentInvisible").getText() !== 'GATEWAY' || that.getView().byId("sensorParentInvisible").getText() !== 'SENSOR') {
                that.getView().byId("block").setEditable(true);
            }
        },

        disableFields: function () {
            let that = this;
            that.getView().byId("sensorName").setEditable(false);
            that.getView().byId("sensorTypeComboBox").setEditable(false);
            that.getView().byId("modbusAddress").setEditable(false);
            that.getView().byId("baudRate").setEditable(false);
            that.getView().byId("serialNumber").setEditable(false);
            that.getView().byId("type").setEditable(false);
            that.getView().byId("sensorLocationComboBox").setEditable(false);
            that.getView().byId("sensorParentComboBox").setEditable(false);
            that.getView().byId("sensorZoneComboBox").setEditable(false);
            if (that.getView().byId("sensorParentInvisible").getText() !== 'GATEWAY' || that.getView().byId("sensorParentInvisible").getText() !== 'SENSOR') {
                that.getView().byId("block").setEditable(false);
            }
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
            let sensorID = that.getView().byId("siteID").getText(),
                deletionRequestSensor = {};

            if (deleteValue) {
                deletionRequestSensor.deletionRequest = 1;
            }
            else {
                deletionRequestSensor.deletionRequest = 0;
            }

            return new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type: "PATCH",
                    contentType: "application/json",
                    url: `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor/${sensorID}`,
                    dataType: "json",
                    data: JSON.stringify(deletionRequestSensor),
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        console.log(data);
                        let messageText = "El sensor " + data.name + " con ID " + data.ID + ((deleteValue) ? " se ha eliminado correctamente" : " se ha restaurado correctamente");
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
                            MessageBox.error("No se pudo eliminar el sensor. Contacta a la mesa de ayuda");
                        }
                        else {
                            MessageBox.error("No se pudo restaurar el sensor. Contacta a la mesa de ayuda");
                        }
                    }
                });
                fnResolve(aData);
            });

        },

        validateFields: function () {
            let that = this;
            let sensorID = that.getView().byId("siteID").getText(),
                sensorName = that.getView().byId("sensorName").getValue() || "",
                sensorTypeComboBox = that.getView().byId("sensorTypeComboBox").getValue() || "",
                modbusAddress = that.getView().byId("modbusAddress").getValue() || "",
                baudRate = that.getView().byId("baudRate").getValue() || "",
                serialNumber = that.getView().byId("serialNumber").getValue() || "",
                type = that.getView().byId("type").getValue() || "",
                sensorZoneComboBox = (that.getView().byId("sensorZoneComboBox").getSelectedItem() ? that.getView().byId("sensorZoneComboBox").getSelectedKey() : ""),
                sensorLocationComboBox = (that.getView().byId("sensorLocationComboBox").getSelectedItem() ? that.getView().byId("sensorLocationComboBox").getValue() : ""),
                isParentVisible = that.getView().byId("sensorParentComboBox").getVisible(),
                parent = isParentVisible ? (that.getView().byId("sensorParentComboBox").getSelectedKey() || "") : that.getView().byId("sensorParentInvisible").getText(),
                block = "",
                isParent = true;

            let sensor = {
                ID: sensorID, 
                sensorData: {
                    Name: sensorName,
                    SensorType: sensorTypeComboBox,
                    ModbusAddress: modbusAddress,
                    BaudRate: isNaN(parseInt(baudRate)) ? 0 : parseInt(baudRate), 
                    SerialNumber: serialNumber,
                    ZoneID: sensorZoneComboBox,
                    Location: sensorLocationComboBox,
                    Type: type,
                    Parent: parent
                }
            };

            if (parent != "GATEWAY" && parent != "SENSOR") {
                block = that.getView().byId("block").getValue();
                sensor.sensorData.block = block;
                isParent = false;
            }

            if (sensorName.length == 0) {
                MessageBox.warning(that.geti18n("nameWarning"));
                return;
            }

            if (sensorTypeComboBox.length == 0) {
                MessageBox.warning(that.geti18n("sensorServiceWarning"));
                return;
            }

            if (modbusAddress.length == 0 && isParent) {
                MessageBox.warning(that.geti18n("modbusWarning"));
                return;
            }

            if (baudRate.length == 0 && isParent) {
                MessageBox.warning(that.geti18n("baudrateWarning"));
                return;
            }

            if (serialNumber.length == 0) {
                MessageBox.warning(that.geti18n("serialnumberWarning"));
                return;
            }

            if (type.length == 0) {
                MessageBox.warning(that.geti18n("sensorTypeWarning"));
                return;
            }

            if (block.length == 0 && !isParent) {
                MessageBox.warning(that.geti18n("blockWarning"));
                return;
            }

            if (that.getView().byId("sensorLocationComboBox").getVisible()) {
                if (sensorLocationComboBox.length == 0) {
                    MessageBox.warning(that.geti18n("sensorLocationWarning"));
                    return;
                }
            }

            if (isParentVisible) {
                let selectedParentItem = that.getView().byId("sensorParentComboBox").getSelectedItem() || "";
                if (selectedParentItem) {
                    if (selectedParentItem.getKey() === "0") {
                        MessageBox.warning(that.geti18n("sensorParentWarning"));
                        return;
                    }
                }
            }

            if (sensorZoneComboBox.length == 0) {
                MessageBox.warning(that.geti18n("zoneWarning"));
                return;
            }

            return sensor;
        },

        saveEditedObject: function () {
            let that = this,
                sensor = that.validateFields();

            if (typeof sensor === 'object' && !Array.isArray(sensor) && sensor !== null) {
                
                return new Promise(function(fnResolve, fnReject) {
                    let aData = jQuery.ajax({
                        type : "PATCH",
                        contentType : "application/json",
                        url : `https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor/${sensor.ID}`,
                        dataType : "json",
                        data : JSON.stringify(sensor.sensorData),
                        async: false, 
                        success : function(data, textStatus, jqXHR) {
                            console.log(data);
                            let messageText = "El sensor " + data.name + " con ID " + data.ID + " se ha modificado correctamente";
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
                            MessageBox.error("No se pudo editar el sensor. Contacta a la mesa de ayuda");
                        }
                    });
                    fnResolve(aData);
                });
            }
        }
    });

});
