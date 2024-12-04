(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAuditController: function (scope, resourceFactory, routeParams, paginatorService, location) {
            scope.details = {};
            scope.audit = [];
            scope.searchData = [];

            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.auditResource.get({ templateResource: routeParams.id }, function (data) {
                    scope.details = data;
                    scope.commandAsJson = data.commandAsJson;
                    var obj = JSON.parse(scope.commandAsJson);
                    scope.jsondata = [];
                    _.each(obj, function (value, key) {
                        scope.jsondata.push({ name: key, property: value });
                    });

                    var params = {};
                    params.offset = offset;
                    params.limit = limit;
                    params.paged = true;

                    params.resourceId = data.resourceId;
                    resourceFactory.auditResource.search(params, function (historyData) {
                        scope.searchData.pageItems = historyData.pageItems;
                        if (scope.searchData.pageItems == '')
                            scope.flag = false;
                        else
                            scope.flag = true;

                        callback(historyData);
                    });

                });
            };


            scope.searchAudit = function () {
                scope.audit = paginatorService.paginate(fetchFunction, 5);
            };
            scope.searchAudit();

            scope.routeTo = function (id) {
                location.path('viewaudit/' + id);
            };
        }
    });
    mifosX.ng.application.controller('ViewAuditController', ['$scope', 'ResourceFactory', '$routeParams', 'PaginatorService', '$location', mifosX.controllers.ViewAuditController]).run(function ($log) {
        $log.info("ViewAuditController initialized");
    });
}(mifosX.controllers || {}));


