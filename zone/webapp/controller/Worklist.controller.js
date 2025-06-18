sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/ui/commons/form/SimpleForm",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/InputType",
    "sap/m/ComboBox",
    "sap/ui/core/Item",
    "sap/ui/core/ListItem",
    "sap/m/Button",
	"sap/m/ButtonType",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Dialog, SimpleForm, Label, Input, InputType, ComboBox, Item, ListItem, Button, ButtonType, MessageBox) {
    "use strict";

    var odataUrlZone = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone?$orderby=Site/Name,Name&$expand=Site&$filter=Site/DeletionRequest eq 0";
    var pageSize = 1000; // tamaño de página
    var skipToken = null; // token de salto
    var zoneArraySize = 0;
    var totalZones = null; // total de registros
    var zoneArray = [];

    var odataUrlSite = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$select=ID,Name,CostCenter&$orderby=Name&$filter=DeletionRequest eq 0";
    var pageSizeSite = 1000; // tamaño de página
    var skipTokenSite = null; // token de salto
    var siteArraySize = 0;
    var totalSites = null; // total de registros
    var siteArray = [];

    return BaseController.extend("globalhitss.ee.zone.controller.Worklist", {

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
            oModelEmpty.setSizeLimit(100000);
            that.getView().setModel(oModelEmpty);

            this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatchedV2, this);
        },

        _onObjectMatchedV2: function() {
            var that = this,
                oModelZones = new sap.ui.model.json.JSONModel();

            pageSize = 1000; // tamaño de página
            skipToken = null; // token de salto
            zoneArraySize = 0;
            totalZones = null; // total de registros
            zoneArray = [];

            pageSizeSite = 1000; // tamaño de página
            skipTokenSite = null; // token de salto
            siteArraySize = 0;
            totalSites = null; // total de registros
            siteArray = [];

            that._oBusyDialog = new sap.m.BusyDialog({
                text: "Cargando datos...",
                title: "Espere un momento"
            });
            that._oBusyDialog.open();

            that.getZonesV2().then(function (res) {
                var zoneList = res;
                oModelZones.setSizeLimit(100000);
                oModelZones.setData(zoneList);

                that.getView().setModel(oModelZones, 'Zones');
                that.onSearchInitial();
                that.getSitesV2().then(function (res) {
                    that.getView().getModel().setProperty("/SiteCollection", []);
                    that._oBusyDialog.close();
                });
            });
            
        },

        getZonesV2: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                var url = odataUrlZone + "&$count=true";
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
                        zoneArraySize += data.value.length;

                        // actualizar el total de registros si es la primera página
                        if (skipToken === null) {
                            totalZones = data["@odata.count"];
                        }

                        zoneArray.push(...records);

                        // actualizar el token de salto si hay una siguiente página
                        if (nextLink !== null) {
                            newSkipToken = skipToken + pageSize;
                        }

                        // recuperar la siguiente página de registros
                        skipToken = newSkipToken;

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
                            newSkipToken = skipTokenSite+pageSizeSite;
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

        //Run when page is open and bind companies to worklist
        _onObjectMatched: function() {
            var that = this,
                oModelZones = new sap.ui.model.json.JSONModel();
            
                that.getZones().then(function(res) {
				function onlyUnique(value, index, self) {
					return self.indexOf(value) === index;
				}
				var zoneList = res;
                oModelZones.setData(zoneList);
                
                //Set to model to use in View
                that.getView().setModel(oModelZones, 'Zones');
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


        onSearchName : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("name", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchBusinessUnit : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("site/businessUnit", FilterOperator.Contains, sQuery));
                    
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

        onSearchCostCenter : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("site/costCenter", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
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
            var aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];

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
                objectId: oItem.getModel('Zones').oData[index].ID
                
            });
        },

        onSearchInitial : function () {
            var aTableSearchState = [];
            var sQuery = 0;
            
            aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, sQuery)];
            
            this._applySearch(aTableSearchState);
        },

        handleChangeSwitch: function() {
            var aTableSearchState = [];
            if (this.byId("deleteRecords").mProperties.state) {
                aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, 1)];
            }
            else aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, 0)];
            
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
                (siteSearch) ? oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchSiteText")) :
                 oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },

        handlePopoverPress: function () {
            let that = this;
            if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: this.geti18n("createNewZone"),
                    contentWidth: "400px",
					contentHeight: "300px",
					content: this.zoneForm = new SimpleForm("zoneForm", {
                        editable : true,
                        content : [
                            new Label({
                                text : this.geti18n("siteLabel"),
                                required: true
                            }),
                            this.siteComboBox = new ComboBox("siteComboBox", { 
                                required: true,
                                showSecondaryValues: true,
                                items: {
                                    path: 'Site>/Sites',
                                    parameters: {
                                        expand: "site" 
                                    },
                                    template: new ListItem({
                                        key: "{Site>ID}",
                                        text: "{Site>name}",
                                        additionalText: "{Site>costCenter}"
                                    })
                                },
                                placeholder: this.geti18n("sitePlaceholder"),
                                change : function(oEvent) {
                                    if (oEvent.getSource().getValue().length > 0 ) {
                                        that.filterValues(oEvent.getSource().getValue(), 1, oEvent.getSource().getSelectedKey());
                                    }
                                }
                            }),
                            new Label("zoneName", {
                                text : this.geti18n("nameLabel"),
                                required: true
                            }),
                            this.nameInput = new Input("nameInput", {
                                id : this.getView().createId("nameInput"), 
                                type : InputType.Text,
                                placeholder: this.geti18n("namePlaceholder")
                            }),
                        ]
                    }),
					beginButton: new Button({
						type: ButtonType.Accept,
						text: this.geti18n("saveButton"),
						press: function () {
                            var successSave = this.onSaveZone();
                            if (successSave) {
                                this.oDefaultDialog.close();
                                this.siteComboBox.setSelectedKey("");
                                this.siteComboBox.removeAllItems();
                                this.nameInput.setValue("");
                                this.onRefresh();
                            }
						}.bind(this)
					}),
					endButton: new Button({
						text: this.geti18n("closeButton"),
						press: function () {
							this.oDefaultDialog.close();
                            this.siteComboBox.setSelectedKey("");
                            this.siteComboBox.removeAllItems();
                            this.nameInput.setValue("");
						}.bind(this)
					})
				});

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

            //populate siteComboBox
            this.crearOdata(this.siteComboBox);

			this.oDefaultDialog.open();
            
		},

        filterValues: function (stringToSearch, searchComboBox, key) {
            let that = this;
            let comboBox = (searchComboBox == 1) ? that.siteComboBox : that.byId("searchSiteComboBox");

            if (searchComboBox == 1 && key.length > 0) {
                return;
            }
            if (searchComboBox == 2 && key.length > 0) {
                that.searchSiteComboBox(key)
                return;
            }

            comboBox.removeAllItems()
            let expresion = new RegExp(`${stringToSearch}.*`, "i");
            let filteredArray = siteArray.filter(element => expresion.test(element.name));

            if (filteredArray.length > 0) {
                let items = comboBox.getItems();
                let newItem;
                filteredArray.forEach((element) => {
                    newItem = new sap.ui.core.ListItem({ text: element.name, key: element.ID, additionalText: element.costCenter });

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

        geti18n: function (textToSearch) {
            return this.getView().getModel("i18n").getResourceBundle().getText(textToSearch);
        },

        onSaveZone: function () {  
            var oCore = sap.ui.getCore();
            var value = oCore.byId("nameInput");
            var inputValue = value.getValue();
            var keyComboBox = this.siteComboBox.getSelectedKey();
            var that = this;
            
            if (keyComboBox.length == 0) {
                MessageBox.warning(this.geti18n("siteWarning"));
                return;
            }

            if (inputValue.length == 0) {
                MessageBox.warning(this.geti18n("nameWarning"));
                return;
            }

            var zone = {
                Name: inputValue,
                SiteID: keyComboBox,
                DeletionRequest: 0
            }

            var successPost = false;
            
            let promiseFunction = new Promise(function (fnResolve, fnReject) {
                let aData = jQuery.ajax({
                    type : "POST",
                    contentType : "application/json",
                    url : "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Zone",
                    dataType : "json",
                    data : JSON.stringify(zone),
                    async: false, 
                    success : function(data, textStatus, jqXHR) {
                        MessageBox.success("La zona " + data.Name + " con ID " + data.ID + " se ha creado", {
                            actions: [MessageBox.Action.OK],
                            onClose: function(oAction) {
                                if (oAction === MessageBox.Action.OK) {
                                    that.refreshModel();
                                }
                            }
                        });
                        successPost = true;
                    },
                    error : function(XMLHttpRequest, textStatus, errorThrown) {
                        MessageBox.error("No se pudo crear la zona");
                    }
                });
                fnResolve(aData);
            });

            return successPost;
		},

        refreshModel: function() {
            var that = this,
                oModelZones = that.getView().getModel('Zones');


            that._oBusyDialog = new sap.m.BusyDialog({
                text: "Cargando datos...",
                title: "Espere un momento"
            });
            that._oBusyDialog.open();

            pageSize = 1000; // tamaño de página
            skipToken = null; // token de salto
            zoneArraySize = 0;
            totalZones = null; // total de registros
            zoneArray = [];
            
            that.getZonesV2().then(function (res) {
                var zoneList = res;
                oModelZones.setSizeLimit(100000);
                oModelZones.setData(zoneList);

                that.getView().setModel(oModelZones, 'Zones');
                that._oBusyDialog.close();
                that.onSearchInitial();
            });
        },

        crearOdata: function(siteComboBox) {
            let that = this;
            let oModel = new JSONModel();
            oModel.setSizeLimit(100000);
            if (that.getView().getModel().oData.SiteCollection.length > 0) {
                oModel.setData({Sites: that.getView().getModel().oData.SiteCollection});
                siteComboBox.setModel(oModel, "Site");
                return;
            }
            return;
            let urlSite = 'https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$orderby=Name&$filter=DeletionRequest eq 0';

            // eslint-disable-next-line no-undef
            let aDataSite = fetch(urlSite)
                .then(resSite => resSite.json())
                .then((outSite) => {
                    oModel.setData({Sites: outSite.value}); 
                    siteComboBox.setModel(oModel, "Site");
                })
                .catch(err => { throw err });
        }

    });
});
