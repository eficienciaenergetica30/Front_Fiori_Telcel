sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/ui/core/CustomData",
    "sap/ui/commons/form/SimpleForm",
    "sap/m/Label",
    "sap/m/Switch",
    "sap/m/Input",
    "sap/m/InputType",
    "sap/m/ComboBox",
    "sap/ui/core/Item",
    "sap/ui/core/ListItem",
    "sap/m/Button",
	"sap/m/ButtonType",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Dialog, CustomData, SimpleForm, Label, Switch, Input, InputType, ComboBox, Item, ListItem, Button, ButtonType, MessageBox) {
    "use strict";

    var odataUrlSensor = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor?$select=ID,Name,SensorType,SerialNumber,Location,Type,SiteID,DeletionRequest&$expand=Site($select=Name,CostCenter)&$filter=Site/DeletionRequest eq 0";
    var pageSize = 1000; // tamaño de página
    var skipToken = null; // token de salto
    var sensorArraySize = 0;
    var totalSensors = null; // total de registros
    var sensorArray = [];
    var sensorParentsArray = [];

    var odataUrlSite = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$select=ID,Name,CostCenter&$orderby=Name&$filter=DeletionRequest eq 0";
    var pageSizeSite = 1000; // tamaño de página
    var skipTokenSite = null; // token de salto
    var siteArraySize = 0;
    var totalSites = null; // total de registros
    var siteArray = [];

    var odataUrlZone = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$select=ID,Name,SiteID&$orderby=Name&$expand=Site($select=Name)&$filter=Site/DeletionRequest eq 0";
    var pageSizeZone = 1000; // tamaño de página
    var skipTokenZone = null; // token de salto
    var zoneArraySize = 0;
    var totalZones = null; // total de registros
    var zoneArray = [];

    return BaseController.extend("globalhitss.ee.sensor.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            var oViewModel;
            var that = this;

            // keeps the search state
            this._aTableSearchState = [];

            let emtpyObject = {
                SiteCollection: []
			};

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            sap.ui.getCore().getConfiguration().setLanguage("es-MX");
            this.setModel(oViewModel, "worklistView");
            let oModelEmpty = new JSONModel(emtpyObject);
            oModelEmpty.setSizeLimit(10000);
			that.getView().setModel(oModelEmpty);
            
            this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatchedV2, this);
        },

        _onObjectMatchedV2: function () {
            var that = this,
                oModelSensors = new sap.ui.model.json.JSONModel();

            that._oBusyDialog = new sap.m.BusyDialog({
                text: "Cargando datos...",
                title: "Espere un momento"
            });
            that._oBusyDialog.open();

            pageSize = 1000; // tamaño de página
            skipToken = null; // token de salto
            sensorArraySize = 0;
            totalSensors = null; // total de registros
            sensorArray = [];

            pageSizeSite = 1000; // tamaño de página
            skipTokenSite = null; // token de salto
            siteArraySize = 0;
            totalSites = null; // total de registros
            siteArray = [];

            pageSizeZone = 1000; // tamaño de página
            skipTokenZone = null; // token de salto
            zoneArraySize = 0;
            totalZones = null; // total de registros
            zoneArray = [];

            that.getSensorsV2().then(function (res) {
                var sensorList = res;
                oModelSensors.setSizeLimit(100000);
                oModelSensors.setData(sensorList);

                that.getView().setModel(oModelSensors, 'Sensors');
                that.onSearchInitial();
            });
            that.getSitesV2().then(function (res) {
                let oSites = res;
                that.getView().getModel().setProperty("/SiteCollection", []);
                that.getZonesV2().then(function (res) {
                    that._oBusyDialog.close();
                });
            });
        },

        getSensorsV2: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                var url = odataUrlSensor + "&$count=true";
                if (skipToken !== null) {
                    url += "&$skiptoken=" + skipToken;
                }

                $.ajax({
                    url: url,
                    method: "GET",
                    success: function (data, textStatus, xhr) {
                        var records = data.value;
                        var nextLink = data["@odata.nextLink"];
                        if (nextLink === undefined) nextLink = null;
                        var newSkipToken = null;
                        sensorArraySize += data.value.length;

                        // actualizar el total de registros si es la primera página
                        if (skipToken === null) {
                            totalSensors = data["@odata.count"];
                        }

                        sensorArray.push(...records);

                        // actualizar el token de salto si hay una siguiente página
                        if (nextLink !== null) {
                            newSkipToken = skipToken + pageSize;
                        }

                        // recuperar la siguiente página de registros
                        skipToken = newSkipToken;
                        
                        if (newSkipToken !== null) {
                            that.getSensorsV2().then(resolve).catch(reject);
                        } else {
                            resolve(sensorArray);//oscar
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error("Error al recuperar sensores: " + errorThrown);
                        reject(errorThrown);
                    }
                });
            });
        },

        getSitesV2: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                var url = odataUrlSite + "&$count=true";
                if (skipTokenSite !== null) {
                    url += "&$skiptoken=" + skipTokenSite;
                }

                $.ajax({
                    url: url,
                    method: "GET",
                    success: function (data, textStatus, xhr) {
                        var records = data.value;
                        var nextLink = data["@odata.nextLink"];
                        if (nextLink === undefined) nextLink = null;
                        var newSkipToken = null;
                        siteArraySize += data.value.length;

                        // actualizar el total de registros si es la primera página
                        if (skipTokenSite === null) {
                            totalSites = data["@odata.count"];
                        }
                    
                        siteArray.push(...records);

                        // actualizar el token de salto si hay una siguiente página
                        if (nextLink !== null) {
                            newSkipToken = skipTokenSite + pageSizeSite;
                        }

                        // recuperar la siguiente página de registros
                        skipTokenSite = newSkipToken;
                        
                        if (newSkipToken !== null) {
                            that.getSitesV2().then(resolve).catch(reject);
                        } else {
                            resolve(siteArray);
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error("Error al recuperar sitios: " + errorThrown);
                        reject(errorThrown);
                    }
                });
            });
        },

        getZonesV2: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                var url = odataUrlZone + "&$count=true";
                if (skipTokenZone !== null) {
                    url += "&$skiptoken=" + skipTokenZone;
                }

                $.ajax({
                    url: url,
                    method: "GET",
                    success: function (data, textStatus, xhr) {
                        var records = data.value;
                        var nextLink = data["@odata.nextLink"];
                        if (nextLink === undefined) nextLink = null;
                        var newSkipToken = null;
                        zoneArraySize += data.value.length;

                        // actualizar el total de registros si es la primera página
                        if (skipTokenZone === null) {
                            totalZones = data["@odata.count"];
                        }

                        zoneArray.push(...records);

                        // actualizar el token de salto si hay una siguiente página
                        if (nextLink !== null) {
                            newSkipToken = skipToken + pageSizeZone;
                        }

                        // recuperar la siguiente página de registros
                        skipTokenZone = newSkipToken;
                        
                        if (newSkipToken !== null) {
                            that.getZonesV2().then(resolve).catch(reject);
                        } else {
                            resolve(zoneArray);
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error("Error al recuperar zonas: " + errorThrown);
                        reject(errorThrown);
                    }
                });
            });
        },

        //Run when page is open and bind companies to worklist
        _onObjectMatched: function() {
            var that = this,
                oModelSensors = new sap.ui.model.json.JSONModel();
            
            that.getSensors().then(function(res) {
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                var sensorList = res;
                oModelSensors.setData(sensorList);
                
                //Set to model to use in View
                that.getView().setModel(oModelSensors, 'Sensors');
                that.onSearchInitial();
            });
            that.getSites().then(function(res) {
                let oSites = res;
                that.getView().getModel().setProperty("/SiteCollection", oSites);
                sap.ui.core.BusyIndicator.hide();
            });
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished : function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");      
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress : function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack : function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        onSearchInitial : function () {
            var aTableSearchState = [];
            var sQuery = 0;
            
            aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, sQuery)];
            
            this._applySearch(aTableSearchState);
        },

        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("name", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchCostCenter : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("site/costCenter", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }
        },

        onSearchType : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("type", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }
        },

        onSearchSerialNumber : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("serialNumber", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchSiteCombo : function (oEvent) {
            var that = this;
            var value = oEvent.getSource().getValue();

            if (value && value.length > 0) {
                that.filterValues(value, 2, oEvent.getSource().getSelectedKey());
            } else {
                that.searchSiteComboBox(value);
            }
        },

        onSelectionChange : function (oEvent) {
            var that = this;
            var value = oEvent.getSource().getValue();

            if (value && value.length > 0) {
                that.filterValues(value, 2, oEvent.getSource().getSelectedKey());
            } else {
                that.searchSiteComboBox(value);
            }
        },

        searchSiteComboBox : function (value) {
            var aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];

            if (value && value.length > 0) {
                aTableSearchState.unshift(new Filter("site/ID", FilterOperator.EQ, value));
            }
            this._applySearch(aTableSearchState, true);
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh : function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject : function (oItem) {
            let index = parseInt(oItem.getBindingContextPath().substring("/".length));
            this.getRouter().navTo("object", {
                //objectId: oItem.getBindingContext().getPath().substring("/Company".length)
                //objectId: oItem.getBindingContextPath()
                objectId: oItem.getModel('Sensors').oData[index].ID
                
            });
        },

        handleChangeSwitch: function() {
            var aTableSearchState = [];
            if (this.byId("deleteRecords").mProperties.state) {
                aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, 1)];
            }
            else aTableSearchState = [new Filter("deletionRequest", FilterOperator.EQ, 0)];
            
            this._applySearch(aTableSearchState);
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function(aTableSearchState, siteSearch=null) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },

        handlePopoverPress: function () {
            var keyComboBoxZone = "",
                keyComboBoxParent = "SENSOR",
                siteComboBoxZone = "",
                keyComboBoxType = "",
                that = this;
            
            if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
                    title: this.geti18n("createNewSensor"),
                    content: this.zoneForm = new SimpleForm("sensorForm", {
                        editable : true,
                        content : [
                            new Label({
                                text : this.geti18n("zoneSensor"),
                                required: true
                            }),
                            this.zoneComboBox = new ComboBox("zoneComboBox", { 
                                required: true,
                                showSecondaryValues: true,
                                items: {
                                    path: 'Zone>/Zones',
                                    parameters: {
                                        expand: "Zone" 
                                    },
                                    template: new ListItem({
                                        key: "{Zone>ID}",
                                        text: "{Zone>name}",
                                        additionalText: "{Zone>site/name}",
                                        customData: new CustomData({
                                            key: "siteID",
                                            value: "{Zone>siteID}"
                                        })
                                    })
                                },
                                placeholder: this.geti18n("zonePlaceholder"),
                                change : function(oEvent) {
                                    keyComboBoxZone = oEvent.oSource.getSelectedKey();
                                    siteComboBoxZone = (oEvent.oSource.getSelectedItem() ? oEvent.oSource.getSelectedItem().getCustomData()[0].getValue() : "");
                                    if (oEvent.getSource().getValue().length > 0 ) {
                                        that.filterValues(oEvent.getSource().getValue(), 1, oEvent.getSource().getSelectedKey());
                                    }
                                    var selectedItem = oEvent.getSource().getSelectedItem();
                                    if (selectedItem) {
                                        var customData = selectedItem.getCustomData();
                                        if (customData.length > 0) {
                                            var siteID = customData[0].getValue();
                                            var oModel = new sap.ui.model.json.JSONModel();
                                            
                                            that.getSensorParent(siteID).then(function(sensors) {
                                                if (sensors.length === 0) {                                                    
                                                    if (sensorParentsArray.length > 0) {
                                                        var oModelParent = that.sensorParentComboBox.getModel("SensorParent");
                                                        var filteredData = that.filterSensorParentsByType(sensorParentsArray, "");

                                                        oModelParent.setData({SensorParents: filteredData}); 
                                                        that.sensorParentComboBox.setModel(oModelParent, "SensorParent");

                                                        that.sensorParentComboBox.setSelectedKey("0");
                                                    }
                                                } 
                                                else {
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
                                                        },
                                                    });
                                                    sensorParentsArray = sensors;
                                                    oModel.setData({SensorParents: sensorParentsArray}); 
                                                    if (typeof that.sensorParentComboBox.getModel("SensorParent") === "undefined") {
                                                        var selectedType = that.sensorTypeComboBox.getSelectedItem();
                                                        if (selectedType) {
                                                            var type = selectedType.getText();
                                                            var filteredData = that.filterSensorParentsByType(sensorParentsArray, type);
                                                            oModel.setData({SensorParents: filteredData});
                                                        }
                                                        else {
                                                            oModel.setData({});
                                                        }
                                                        that.sensorParentComboBox.setModel(oModel, "SensorParent");
                                                    }
                                                    else {
                                                        var selectedType = that.sensorTypeComboBox.getSelectedItem();
                                                        var oModelParent = that.sensorParentComboBox.getModel("SensorParent");
                                                        if (selectedType) {
                                                            var type = selectedType.getText();
                                                            var filteredData = that.filterSensorParentsByType(sensorParentsArray, type);
                                                            oModelParent.setData({SensorParents: filteredData});
                                                        }
                                                        else {
                                                            var filteredData = that.filterSensorParentsByType(sensorParentsArray, "");
                                                            oModelParent.setData({SensorParents: filteredData});
                                                        }
                                                        that.sensorParentComboBox.setModel(oModelParent, "SensorParent");
                                                    }
                                                    that.sensorParentComboBox.setSelectedKey("0");
                                                }
                                            }).catch(function(error) {
                                                console.log("Error al obtener el padre: " + error);
                                            });
                                        }
                                    }
                                }
                            }),
                            new Label({
                                text : this.geti18n("sensorService"),
                                required: true
                            }),
                            this.sensorTypeComboBox = new ComboBox("sensorTypeComboBox", { 
                                required: true,
                                items: {
                                    path: 'SensorType>/SensorTypes',
                                    parameters: {
                                        expand: "SensorType" 
                                    },
                                    template: new Item({
                                        key: "{SensorType>ID}",
                                        text: "{SensorType>name}"
                                    })
                                },
                                placeholder: this.geti18n("sensorServicePlaceholder"),
                                change: function(oEvent) {
                                    keyComboBoxType = oEvent.oSource.getSelectedItem().getText();
                                    
                                    let selectedItem = oEvent.getSource().getSelectedItem();
                                    let stateGateway = that.switchGateway.getState();

                                    if (!stateGateway) {
                                        let isVisible = keyComboBoxType === "Temperatura" || keyComboBoxType === "Contacto";              
                                        let oBinding = that.sensorLocationComboBox.getBinding("items");

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
                                        }

                                        that.sensorLocation.setVisible(isVisible);
                                        that.sensorLocationComboBox.setVisible(isVisible);
                                    }

                                    if (selectedItem) {
                                        let type = selectedItem.getText();
                                        let oModelParent = that.sensorParentComboBox.getModel("SensorParent");
                                        if (typeof oModelParent !== "undefined") {
                                            let filteredData = that.filterSensorParentsByType(sensorParentsArray, type);
                                            oModelParent.setData({});

                                            that.sensorParentComboBox.removeAllItems();
            
                                            let oModelFiltered = new sap.ui.model.json.JSONModel({SensorParents: filteredData});
                                            that.sensorParentComboBox.setModel(oModelFiltered, "SensorParent");
                                            that.sensorParentComboBox.setSelectedKey("0");
                                        }                                              
                                    }
                                }
                            }),
                            this.sensorName = new Label("sensorName", {
                                text : this.geti18n("sensorName"),
                                required: true
                            }),
                            this.nameInput = new Input("nameInput", {
                                id : this.getView().createId("nameInput"), 
                                type : InputType.Text,
                                placeholder: this.geti18n("namePlaceholder")
                            }),
                            this.switchGatewayLabel = new Label("switchGatewayLabel", {
                                text : this.geti18n("switchGatewayLabel")
                            }),
                            this.switchGateway = new Switch("switchGateway", {
                                tooltip : "¿Es gateway?",
                                type : "AcceptReject",
                                state : false,
                                change: function(oEvent) {
                                    var bSwitchState = oEvent.getParameter("state");
                                    if (!bSwitchState) {
                                        keyComboBoxParent = "SENSOR";
                                        that.sensorParent.setVisible(true);
                                        that.sensorParentComboBox.setVisible(true);
                                        let oBinding = that.sensorLocationComboBox.getBinding("items");
                                        
                                        if (oBinding) {
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
                                        }
                                        if (keyComboBoxType.length > 0) {
                                            that.sensorLocation.setVisible(true);
                                            that.sensorLocationComboBox.setVisible(true);
                                        }
                                    }
                                    else {
                                        keyComboBoxParent = "GATEWAY";
                                        that.sensorParent.setVisible(false);
                                        that.sensorParentComboBox.setVisible(false);
                                        that.sensorLocation.setVisible(false);
                                        that.sensorLocationComboBox.setVisible(false);
                                    }
                                }
                            }),
                            this.sensorParent = new Label({
                                text : that.geti18n("sensorParent"),
                                visible : true
                            }),
                            this.sensorParentComboBox = new ComboBox("sensorParentComboBox", { 
                                visible : true,
                                showSecondaryValues: true,
                                items: {
                                    path: 'SensorParent>/SensorParents',
                                    parameters: {
                                        expand: "SensorParent" 
                                    },
                                    template: new ListItem({
                                        key: "{SensorParent>ID}",
                                        text: "{SensorParent>name}",
                                        additionalText: {
                                            parts: ["SensorParent>zone/name", "SensorParent>zone/site/name"],
                                            formatter: function(zoneName, siteName) {
                                                if (zoneName.length == 0 && siteName.length == 0)
                                                    return;
                                                return zoneName + " / " + siteName;
                                            }
                                        }
                                    })
                                },
                                placeholder: this.geti18n("sensorParentPlaceholder"),
                                change: function(oEvent) {
                                    var selectedItem = oEvent.getSource().getSelectedItem();
                                    if (selectedItem) {
                                        if (selectedItem.getKey() != "0") {
                                            keyComboBoxParent = selectedItem.getKey();
                                            that.sensorModbusAddress.setRequired(false);
                                            that.sensorBaudRate.setRequired(false);
                                            that.sensorBlockLabel.setVisible(true);
                                            that.blockInput.setVisible(true);
                                        }
                                        else {
                                            keyComboBoxParent = "SENSOR";
                                            that.sensorModbusAddress.setRequired(true);
                                            that.sensorBaudRate.setRequired(true);
                                            that.sensorBlockLabel.setVisible(false);
                                            that.blockInput.setVisible(false);
                                        }                                        
                                    }
                                }
                            }),
                            this.sensorModbusAddress = new Label("sensorModbusAddress", {
                                text : this.geti18n("modbusAddress"),
                                required: true
                            }),
                            this.modbusAddressInput = new Input("modbusAddressInput", {
                                id : this.getView().createId("modbusAddressInput"), 
                                type : InputType.Text,
                                placeholder: this.geti18n("modbusAddressPlaceholder")
                            }),
                            this.sensorBaudRate = new Label("sensorBaudRate", {
                                text : this.geti18n("baudRate"),
                                required: true
                            }),
                            this.baudrateInput = new Input("baudrateInput", {
                                id : this.getView().createId("baudrateInput"), 
                                type : InputType.Number,
                                liveChange: this.onChange,
                                placeholder: this.geti18n("baudratePlaceholder")
                            }),
                            new Label("sensorSerialNumber", {
                                text : this.geti18n("serialNumber"),
                                required: true
                            }),
                            this.serialnumberInput = new Input("serialnumberInput", {
                                id : this.getView().createId("serialnumberInput"), 
                                type : InputType.Text,
                                placeholder: this.geti18n("serialnumberPlaceholder")
                            }),
                            new Label("sensorTypeLabel", {
                                text : this.geti18n("sensorType"),
                                required: true
                            }),
                            this.typeInput = new Input("typeInput", {
                                id : this.getView().createId("typeInput"), 
                                type : InputType.Text,
                                placeholder: this.geti18n("sensorTypePlaceholder")
                            }),
                            this.sensorBlockLabel = new Label("sensorBlockLabel", {
                                text : this.geti18n("sensorBlock"),
                                required: true,
                                visible: false
                            }),
                            this.blockInput = new Input("blockInput", {
                                id : this.getView().createId("blockInput"), 
                                type : InputType.Text,
                                visible: false,
                                placeholder: this.geti18n("sensorBlockPlaceholder")
                            }),
                            this.sensorLocation = new Label("sensorLocation", {
                                text : this.geti18n("sensorLocation"),
                                visible: false,
                                required: true
                            }),
                            this.sensorLocationComboBox = new ComboBox("sensorLocationComboBox", { 
                                required: true,
                                visible: false,
                                items: {
                                    path: 'SensorLocation>/SensorLocations',
                                    parameters: {
                                        expand: "SensorLocation" 
                                    },
                                    template: new Item({
                                        key: "{SensorLocation>ID}",
                                        text: "{SensorLocation>name}"
                                    })
                                },
                                placeholder: this.geti18n("sensorLocationPlaceholder"),
                                change: function(oEvent) { }
                            }),
                        ]
                    }),
					beginButton: new Button({
						type: ButtonType.Accept,
						text: this.geti18n("saveButton"),
						press: function () {
                            that.onSaveSensor(keyComboBoxZone, siteComboBoxZone, keyComboBoxType, keyComboBoxParent).then(function (successSave) {
                                if (successSave) {
                                    that.oDefaultDialog.close();
                                    that.oDefaultDialog.getBeginButton().setEnabled(true);
                                    sensorParentsArray = [];
                                    keyComboBoxZone = siteComboBoxZone = keyComboBoxType = "";
                                    keyComboBoxParent = "SENSOR";
                                    that.zoneComboBox.setSelectedKey("");
                                    that.zoneComboBox.removeAllItems();
                                    that.sensorParentComboBox.removeAllItems();
                                    that.sensorParentComboBox.setSelectedKey("");
                                    that.nameInput.setValue("");
                                    that.modbusAddressInput.setValue("");
                                    that.baudrateInput.setValue("");
                                    that.serialnumberInput.setValue("");
                                    that.blockInput.setValue("");
                                    that.switchGateway.setState(false);
                                    that.typeInput.setValue("");
                                    that.oDefaultDialog.destroy();
                                    that.oDefaultDialog = null;
                                    that.refreshModel();
                                    that.onRefresh();
                                }
                            });
                        }.bind(this)
					}),
					endButton: new Button({
						text: that.geti18n("closeButton"),
						press: function () {
                            that.zoneComboBox.removeAllItems();
                            that.zoneComboBox.setSelectedKey("");
                            that.nameInput.setValue("");
                            that.modbusAddressInput.setValue("");
                            that.baudrateInput.setValue("");
                            that.serialnumberInput.setValue("");
                            that.typeInput.setValue("");
                            that.sensorParentComboBox.removeAllItems();
                            that.sensorParentComboBox.setSelectedKey("");
                            that.sensorModbusAddress.setRequired(true);
                            that.sensorBaudRate.setRequired(true);
                            that.sensorBlockLabel.setVisible(false);
                            that.blockInput.setVisible(false);
                            that.switchGateway.setState(false);
                            that.sensorParent.setVisible(true);
                            that.sensorParentComboBox.setVisible(true);
                            that.sensorModbusAddress.setVisible(true);
                            that.modbusAddressInput.setVisible(true);
                            that.sensorBaudRate.setVisible(true);
                            that.baudrateInput.setVisible(true);
                            sensorParentsArray = [];
							this.oDefaultDialog.close();
                            this.oDefaultDialog.destroy();
                            this.oDefaultDialog = null;
						}.bind(this)
					})
				});

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

            //populate zoneComboBox, sensorTypeComboBox and sensorLocationComboBox
            this.crearOdataSensorType(this.sensorTypeComboBox);
            this.crearOdataSensorLocation(this.sensorLocationComboBox);
            this.crearOdataZone(this.zoneComboBox);

			this.oDefaultDialog.open();
            
		},

        filterValues: function (stringToSearch, searchComboBox, key) {
            let that = this;
            let comboBox = (searchComboBox == 1) ? that.zoneComboBox : that.byId("searchSiteComboBox");

            if (searchComboBox == 1 && key.length > 0) {
                return;
            }
            if (searchComboBox == 2 && key.length > 0) {
                that.searchSiteComboBox(key)
                return;
            }

            comboBox.removeAllItems()
            let expresion = new RegExp(`${stringToSearch}.*`, "i");
            let filteredArray = (searchComboBox == 1) ? zoneArray.filter(element => expresion.test(element.name)) : siteArray.filter(element => expresion.test(element.name));

            if (filteredArray.length > 0) {
                let items = comboBox.getItems();
                let newItem;
                filteredArray.forEach((element) => {
                    newItem = (searchComboBox == 1) ? new sap.ui.core.ListItem({ text: element.name, 
                        key: element.ID, 
                        additionalText: element.site.name,
                        customData: new CustomData({
                            key: "siteID",
                            value: element.siteID
                        }) }) : new sap.ui.core.ListItem({ text: element.name, key: element.ID, additionalText: element.costCenter });

                    if (!items.find((item) => item.getKey() === newItem.getKey())) {
                        comboBox.addItem(newItem);
                    }
                });
                
                let index = comboBox.getItems().find((item) => item.getKey() === filteredArray[0].ID);
                if (index !== -1) {
                    comboBox.setSelectedItem(index);
                    if (searchComboBox == 2) {
                        that.searchSiteComboBox(index.getKey());
                    }
                }
            } else {
                if (searchComboBox == 2) {
                    that.searchSiteComboBox(stringToSearch);
                }
            }
        },

        onSaveSensor: function (keyComboBoxZone, siteComboBoxZone, keyComboBoxType, keyComboBoxParent) {  
            var oCore = sap.ui.getCore();
            var nameValue = oCore.byId("nameInput").getValue();
            var modbusAddressValue = oCore.byId("modbusAddressInput").getValue();
            var baudRateValue = oCore.byId("baudrateInput").getValue();
            var serialNumberValue = oCore.byId("serialnumberInput").getValue();
            var typeValue = oCore.byId("typeInput").getValue();
            var blockValue = oCore.byId("blockInput").getValue();
            var keyComboBoxZone = oCore.byId("zoneComboBox").getSelectedKey();
            var siteComboBoxZone = (oCore.byId("zoneComboBox").getSelectedItem() ? oCore.byId("zoneComboBox").getSelectedItem().getCustomData()[0].getValue() : "");
            var keyComboBoxType = (oCore.byId("sensorTypeComboBox").getSelectedItem()) ? oCore.byId("sensorTypeComboBox").getSelectedItem().getText() : "";
            var keyComboBoxLocation = (oCore.byId("sensorLocationComboBox").getSelectedItem()) ? oCore.byId("sensorLocationComboBox").getSelectedItem().getText() : "";
            var that = this;

            if (keyComboBoxZone.length == 0) {
                MessageBox.warning(that.geti18n("zoneWarning"));
                return;
            }

            if (keyComboBoxType.length == 0) {
                MessageBox.warning(that.geti18n("sensorServiceWarning"));
                return;
            }

            if (nameValue.length == 0) {
                MessageBox.warning(that.geti18n("nameWarning"));
                return;
            } 

            if (serialNumberValue.length == 0) {
                MessageBox.warning(that.geti18n("serialnumberWarning"));
                return;
            }

            if (keyComboBoxParent == "GATEWAY" || keyComboBoxParent == "SENSOR") {
                if (modbusAddressValue.length == 0) {
                    MessageBox.warning(that.geti18n("modbusWarning"));
                    return;
                } 
                if (baudRateValue.length == 0) {
                    MessageBox.warning(that.geti18n("baudrateWarning"));
                    return;
                }             
            }
            else {
                if (blockValue.length == 0) {
                    MessageBox.warning(that.geti18n("blockWarning"));
                    return;
                }
            }
            
            if (typeValue.length == 0) {
                MessageBox.warning(that.geti18n("sensorTypeWarning"));
                return;
            }

            if (keyComboBoxParent !== "GATEWAY") {
                if (oCore.byId("sensorLocationComboBox").getVisible()) {
                    if (keyComboBoxLocation.length == 0) {
                        MessageBox.warning(that.geti18n("sensorLocationWarning"));
                        return;
                    }
                }
            } else {
                keyComboBoxLocation = "";
            }

            var sensor = {
                Name: nameValue,
                ZoneID: keyComboBoxZone,
                SensorType: keyComboBoxType,
                ModbusAddress: modbusAddressValue,
                BaudRate: isNaN(parseInt(baudRateValue)) ? 0 : parseInt(baudRateValue),
                SerialNumber: serialNumberValue,
                Type: typeValue,
                SiteID: siteComboBoxZone, 
                Location: keyComboBoxLocation,
                DeletionRequest: 0,
                Parent: keyComboBoxParent,
                Block: blockValue
            }

            var successPost = false;
            
            return new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type : "POST",
                    contentType : "application/json",
                    url : "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Sensor",
                    dataType : "json",
                    data : JSON.stringify(sensor),
                    async: false, 
                    success : function(data, textStatus, jqXHR) {
                        that.oDefaultDialog.getBeginButton().setEnabled(false);
                        MessageBox.success("El sensor " + data.name + " con ID " + data.ID + " se ha creado", {
                            actions: [MessageBox.Action.OK],
                            onClose: function(oAction) {
                                if (oAction === MessageBox.Action.OK) {
                                    if (data.parent === "GATEWAY" || data.sensorType === "Temperatura" || data.sensorType === "Contacto") {
                                        successPost = true;
                                        fnResolve(successPost);
                                    } else {
                                        let urlDataProm = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/";
                                        let urlProm = (data.sensorType === "Eléctrico") ? "Electric_Prom" : (data.sensorType === "Gas") ? "Gas_Prom" : "Water_Prom";
                                        urlDataProm = urlDataProm + urlProm;
                                        that.dataToProm(data.sensorType, data.ID).then(function (entries) {
                                            that.sendDataProm(entries, urlDataProm)
                                                .then(function (resultados) {
                                                    successPost = true;
                                                    fnResolve(successPost);
                                                })
                                                .catch(function (error) {
                                                    console.error("Error en las inserciones:", error);
                                                    fnReject(error);
                                                });
                                        });
                                    }
                                }
                            }
                        });

                    },
                    error : function(XMLHttpRequest, textStatus, errorThrown) {
                        MessageBox.error("No se pudo crear el sensor. Contacta a la mesa de ayuda");
                    }
                });
            });
		},

        sendDataProm: function (entries, urlProm) {
            return new Promise(function (resolve, reject) {
                let promesasEnvio = [];

                for (let i = 0; i < entries.length; i++) {
                    let dato = entries[i];

                    let promesaEnvio = new Promise(function (fnResolve, fnReject) {
                        jQuery.ajax({
                            url: urlProm,
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify(dato),
                            success: function (data) {
                                fnResolve(data);
                            },
                            error: function (error) {
                                fnReject(error);
                            }
                        });
                    });

                    promesasEnvio.push(promesaEnvio);
                }

                Promise.all(promesasEnvio)
                    .then(function (resultados) {
                        resolve(resultados);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
		},

        refreshModel: function() {
            var that = this,
                oModelSensors = that.getView().getModel('Sensors');

            that._oBusyDialog = new sap.m.BusyDialog({
                text: "Cargando datos...",
                title: "Espere un momento"
            });
            that._oBusyDialog.open();

            pageSize = 1000; // tamaño de página
            skipToken = null; // token de salto
            sensorArraySize = 0;
            totalSensors = null; // total de registros
            sensorArray = [];

            pageSizeSite = 1000; // tamaño de página
            skipTokenSite = null; // token de salto
            siteArraySize = 0;
            totalSites = null; // total de registros
            siteArray = [];

            pageSizeZone = 1000; // tamaño de página
            skipTokenZone = null; // token de salto
            zoneArraySize = 0;
            totalZones = null; // total de registros
            zoneArray = [];
            
            that.getSensorsV2().then(function (res) {
                var sensorList = res;
                oModelSensors.setSizeLimit(100000);
                oModelSensors.setData(sensorList);

                that.getView().setModel(oModelSensors, 'Sensors');
                that.onSearchInitial();
            });
            that.getSitesV2().then(function (res) {
                that.getView().getModel().setProperty("/SiteCollection", []);
                that.getZonesV2().then(function (res) {
                    that._oBusyDialog.close();
                });
            });
        },
    
        dataToProm: function (sensorType, sensorID) {
            var that = this;
            return new Promise(function (resolve, reject) {
                let inicio = new Date();
                inicio.setHours(0, 0, 0, 0);
                let fin = new Date();
                // add a day
                fin.setDate(fin.getDate() + 1);
                fin.setHours(0, 0, 0, 0);

                const CINCO_MINUTOS = 1000 * 60 * 5;

                let entries = [];
                let season = that.getSeason(inicio.getMonth() + 1, inicio.getDate());
                let hourType;

                for (let i = inicio; i < fin; i = new Date(i).getTime() + CINCO_MINUTOS) {
                    let currentDateLoop = new Date(i);
                    let hour = that.timeFormat(currentDateLoop);
                    let hourInteger = parseInt(hour.split(":")[0]);
                    let value = [];
                    hourType = (hourInteger >= 0 && hourInteger < 7) ? 'B' : (hourInteger >= 7 && hourInteger < 20) ? 'I' : 'P';
                    let formattedDate = inicio.toISOString().slice(0, 10).replace('T', ' ');
                    let formattedMonth = String(inicio.getMonth() + 1).padStart(2, '0');
                    let formattedDay = String(inicio.getDate()).padStart(2, '0');
                    formattedDate = formattedDate.slice(0, 5) + formattedMonth + '-' + formattedDay;
                    value = {
                        sensorID: sensorID, time: formattedDate + " " + hour, 
                        Date: formattedDate, Year: inicio.getFullYear().toString(), 
                        Month: formattedMonth, Day: formattedDay, HHMMSS: hour,
                        WeekDay: inicio.getDay(), Season: season, hourType: hourType, Consumption: 0
                    };
                    if (sensorType === "Eléctrico") {
                        value = { ...value, Demand: 0, Power: 0, Consumption_Avg: 0, Demand_Avg: 0, Power_Avg: 0, Count: 0 };
                    }
                    else value = { ...value, Consumption_Avg: 0, Count: 0 };

                    entries.push(value);
                }
                resolve(entries);
            });
        },

        timeFormat: function(d) {
            let hours = this.formatTwoDigits(d.getHours());
            let minutes = this.formatTwoDigits(d.getMinutes());
            let seconds = this.formatTwoDigits(d.getSeconds());
            return hours + ":" + minutes + ":" + seconds;
        },
        
        formatTwoDigits: function(n) {
            return n < 10 ? '0' + n : n;
        },
        
        getSeason: function(month, day) {
            if ((month >= 1) & (month <= 2)) return "INVIERNO";
            if ((month == 3) & (day <= 20)) return "INVIERNO";
            if ((month == 12) & (day >= 21)) return "INVIERNO";
            if ((month >= 10) & (month <= 11)) return "OTOÑO";
            if ((month == 12) & (day <= 20)) return "OTOÑO";
            if ((month == 9) & (day >= 21)) return "OTOÑO";
            if ((month >= 7) & (month <= 8)) return "VERANO";
            if ((month == 9) & (day <= 20)) return "VERANO";
            if ((month == 6) & (day >= 21)) return "VERANO";
            if ((month >= 4) & (month <= 5)) return "PRIMAVERA";
            if ((month == 6) & (day <= 20)) return "PRIMAVERA";
            if ((month == 3) & (day >= 21)) return "PRIMAVERA";
        },

        crearOdataSensorType: function(sensorTypeComboBox) {
            var oModel = new JSONModel();
            var urlSensor = 'https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SensorTypeCatalog?$orderby=Name';

            // eslint-disable-next-line no-undef
            var aDataSensorType = fetch(urlSensor)
                .then(resSensorType => resSensorType.json())
                .then((outSensorType) => {
                    oModel.setData({SensorTypes: outSensorType.value}); 
                    sensorTypeComboBox.setModel(oModel, "SensorType");
                })
                .catch(err => { throw err });
        },

        crearOdataSensorLocation: function(sensorLocationComboBox) {
            var oModel = new JSONModel();
            var urlSensor = 'https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/SensorLocationCatalog?$orderby=Name';

            // eslint-disable-next-line no-undef
            var aDataSensorLocation = fetch(urlSensor)
                .then(resSensorLocation => resSensorLocation.json())
                .then((outSensorLocation) => {
                    oModel.setData({SensorLocations: outSensorLocation.value}); 
                    sensorLocationComboBox.setModel(oModel, "SensorLocation");
                })
                .catch(err => { throw err });
        },

        onChange: function(oEvent) {
            var _oInput = oEvent.getSource();
            var val = _oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            _oInput.setValue(val);
        },

        geti18n: function (textToSearch) {
            return this.getView().getModel("i18n").getResourceBundle().getText(textToSearch);
        },

        crearOdataZone: function(zoneComboBox) {
            let that = this;
            let oModel = new JSONModel();
            oModel.setSizeLimit(100000);
            if (that.getView().getModel().oData.SiteCollection.length > 0) {
                oModel.setData({Sites: that.getView().getModel().oData.SiteCollection});
                siteComboBox.setModel(oModel, "Site");
                return;
            }
            return;
            var urlZone = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$select=ID,Name,SiteID&$orderby=Name&$expand=Site($select=Name)&$filter=Site/DeletionRequest eq 0";
            
            // eslint-disable-next-line no-undef
            var aDataZone = fetch(urlZone)
            .then(resZone => resZone.json())
            .then((outZone) => {
                oModel.setData({Zones: outZone.value}); 
                zoneComboBox.setModel(oModel, "Zone");
            })
            .catch(err => { throw err });
        }

    });
});
