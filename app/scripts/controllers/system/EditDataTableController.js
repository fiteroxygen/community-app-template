(function (module) {
    mifosX.controllers = _.extend(module, {
        EditDataTableController: function (scope, routeParams, resourceFactory, location) {

            scope.columns = [];
            scope.dropColumns = [];
            scope.formData = {};
            scope.columnnameerror = false;
            scope.columntypeerror = false;
            scope.showLegalForm = true;
            scope.datatableTemplate = {};

            resourceFactory.codeResources.getAllCodes({}, function (data) {
                scope.codes = data;
            });

            scope.legalFormChange = function (apptableName) {
                if (apptableName == 'm_client') {
                    scope.showLegalForm = true;
                }
                else{
                    scope.showLegalForm = false;
                }
            }

            resourceFactory.DataTablesResource.getTableDetails({datatablename: routeParams.tableName}, function (data) {
                scope.datatable = data;

                scope.formData.apptableName = data.applicationTableName;
                scope.formData.entitySubType = data.entitySubType;

                if(scope.formData.apptableName == 'm_client'){
                    scope.showLegalForm = true;
                }
                else{
                    scope.showLegalForm = false;
                }

                var temp = [];
                var colName = data.columnHeaderData[0].columnName;
                if (colName == 'id') {
                    data.columnHeaderData.splice(0, 1);
                }
                colName = data.columnHeaderData[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                    data.columnHeaderData.splice(0, 1);
                }

                for (var i in data.columnHeaderData) {

                    data.columnHeaderData[i].originalName = data.columnHeaderData[i].columnName;
                    if (data.columnHeaderData[i].columnName.indexOf("_cd_") > 0) {
                        temp = data.columnHeaderData[i].columnName.split("_cd_");
                        data.columnHeaderData[i].columnName = temp[1];
                        data.columnHeaderData[i].code = temp[0];
                    }

                    var tempColumn = {name: data.columnHeaderData[i].columnName, mandatory: !data.columnHeaderData[i].isColumnNullable};
                    tempColumn.originalName = data.columnHeaderData[i].originalName;
                    var colType = data.columnHeaderData[i].columnDisplayType.toLowerCase();

                    if (colType == 'integer') {
                        colType = 'number';
                    }
                    else if (colType == 'codelookup') {
                        colType = 'dropdown';
                    }
                    tempColumn.type = colType;

                    if (colType == 'string') {
                        tempColumn.length = data.columnHeaderData[i].columnLength;
                    }

                    if (data.columnHeaderData[i].columnCode) {
                        tempColumn.code = data.columnHeaderData[i].columnCode;
                    }

                    scope.columns.push(tempColumn);
                }
            });

            scope.addColumn = function () {
                if (scope.datatableTemplate.columnName && scope.datatableTemplate.columnType) {
                    scope.columnnameerror = false;
                    scope.columntypeerror = false;
                    scope.columns.push({name: scope.datatableTemplate.columnName, type: scope.datatableTemplate.columnType, mandatory: false});
                    scope.datatableTemplate.columnName = undefined;
                    scope.datatableTemplate.columnType = undefined;
                } else if (!scope.datatableTemplate.columnName) {
                    scope.columnnameerror = true;
                    scope.labelerror = "columnnameerr";
                } else if (scope.datatableTemplate.columnName) {
                    scope.columntypeerror = true;
                    scope.labelerror = "columntypeerr";
                }
            };

            scope.removeColumn = function (index) {
                if (scope.columns[index].originalName) {
                    scope.dropColumns.push({name: scope.columns[index].originalName});
                }
                scope.columns.splice(index, 1);
            };

            scope.updateDepenedencies = function (index) {
                if (scope.columns[index].type != 'string') {
                    scope.columns[index].length = undefined;
                }
                if (scope.columns[index].type != 'dropdown') {
                    scope.columns[index].code = undefined;
                }
            };

            scope.submit = function () {

                scope.formData.addColumns = [];
                scope.formData.changeColumns = [];
                var tempColumns = JSON.parse(JSON.stringify(scope.columns));

                if (scope.dropColumns.length > 0) {
                    scope.formData.dropColumns = scope.dropColumns;
                }

                for (var i in tempColumns) {

                    if (tempColumns[i].originalName) {
                        //This value should be updated based on the configuration
                        /*if (scope.columns[i].newName) {
                         if (scope.columns[i].type == "dropdown") {
                         scope.columns[i].columnName = scope.columns[i].originalName;
                         scope.columns[i].newName = scope.columns[i].columnCode + "_cd_" + scope.columns[i].newName;
                         }
                         }*/
                        delete tempColumns[i].originalName;
                        delete tempColumns[i].type;

                        if (tempColumns[i].code) {
                            tempColumns[i].newCode = tempColumns[i].newCode || tempColumns[i].code;
                        }

                        if (tempColumns[i].name) {
                            tempColumns[i].newName = tempColumns[i].newName || tempColumns[i].name;
                        }
                        scope.formData.changeColumns.push(tempColumns[i]);

                    } else {
                        scope.formData.addColumns.push(tempColumns[i]);
                    }
                }

                if (scope.formData.addColumns.length == 0) delete scope.formData.addColumns;
                if (scope.formData.changeColumns.length == 0) delete scope.formData.changeColumns;

                resourceFactory.DataTablesResource.update({datatablename: routeParams.tableName}, this.formData, function (data) {
                    location.path('/viewdatatable/' + data.resourceIdentifier);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditDataTableController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.EditDataTableController]).run(function ($log) {
        $log.info("EditDataTableController initialized");
    });
}(mifosX.controllers || {}));
