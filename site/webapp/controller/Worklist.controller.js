sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    var odataUrlSite = "https://telcl-dev-db-cap-telcl-srv.cfapps.us10.hana.ondemand.com/dataservices/Site?$select=ID,Name,BusinessUnit,Format,CostCenter,RPU,DeletionRequest&$expand=Address($select=State)";
    var pageSize = 1000; // tamaño de página
    var skipToken = null; // token de salto
    var siteArraySize = 0;
    var totalSites = null; // total de registros
    var siteArray = [];

    return BaseController.extend("globalhitss.ee.site.controller.Worklist", {

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

            sap.ui.getCore().getConfiguration().setLanguage("es-MX");

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");
            this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatchedV2, this);
        },

        _onObjectMatchedV2: function() {
            var that = this,
			    oModelSites = new sap.ui.model.json.JSONModel();

            pageSize = 1000; // tamaño de página
            skipToken = null; // token de salto
            siteArraySize = 0;
            totalSites = null; // total de registros
            siteArray = [];

            that._oBusyDialog = new sap.m.BusyDialog({
                text: "Cargando datos...",
                title: "Espere un momento"
            });
            that._oBusyDialog.open();

            that.getSitesV2().then(function(res) {
				var siteList = res;
                oModelSites.setSizeLimit(100000);
                oModelSites.setData(siteList);
                
                that.getView().setModel(oModelSites, 'Sites');
                that._oBusyDialog.close();
                that.onSearchInitial();
            });
        },

        getSitesV2: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                // construir la URL de la solicitud
                var url = odataUrlSite + "&$count=true";
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
                        siteArraySize += data.value.length;

                        // actualizar el total de registros si es la primera página
                        if (skipToken === null) {
                            totalSites = data["@odata.count"];
                        }

                        siteArray.push(...records);

                        // actualizar el token de salto si hay una siguiente página
                        if (nextLink !== null) {
                            newSkipToken = skipToken+pageSize;
                        }

                        // recuperar la siguiente página de registros
                        skipToken = newSkipToken;

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

        //Run when page is open and bind sites to worklist
        _onObjectMatched: function() {
            var that = this,
			    oModelSites = new sap.ui.model.json.JSONModel();

            that.getSites().then(function(res) {
				function onlyUnique(value, index, self) {
					return self.indexOf(value) === index;
				}
				var siteList = res;
                oModelSites.setData(siteList);                
                //Set to model to use in View
                that.getView().setModel(oModelSites, 'Sites');
                that.onSearchInitial();
            });
            
        },

        onCreate : function (oEvent) {
            // The source is the list item that got pressed
            this.getRouter().navTo("wizard");
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
            
            aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, sQuery)];
            
            this._applySearch(aTableSearchState);
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
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [new Filter("DeletionRequest", FilterOperator.EQ, this.byId("deleteRecords").mProperties.state ? 1 : 0)];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState.unshift(new Filter("businessUnit", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchFormat : function (oEvent) {
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
                    aTableSearchState.unshift(new Filter("format", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchCostCenter : function (oEvent) {
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
                    aTableSearchState.unshift(new Filter("costCenter", FilterOperator.Contains, sQuery));
                    
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchRPU : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    if (this.byId("deleteRecords").mProperties.state) {
                        aTableSearchState = [new Filter("RPU", FilterOperator.Contains, sQuery), new Filter("DeletionRequest", FilterOperator.EQ, 1)];
                    }
                    else aTableSearchState = [new Filter("RPU", FilterOperator.Contains, sQuery), new Filter("DeletionRequest", FilterOperator.EQ, 0)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        onSearchState : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    if (this.byId("deleteRecords").mProperties.state) {
                        aTableSearchState = [new Filter("address/state", FilterOperator.Contains, sQuery), new Filter("DeletionRequest", FilterOperator.EQ, 1)];
                    }
                    else aTableSearchState = [new Filter("address/state", FilterOperator.Contains, sQuery), new Filter("DeletionRequest", FilterOperator.EQ, 0)];
                }
                this._applySearch(aTableSearchState);
            }

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
                objectId: oItem.getModel('Sites').oData[index].ID
                
            });
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
        _applySearch: function(aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
});
