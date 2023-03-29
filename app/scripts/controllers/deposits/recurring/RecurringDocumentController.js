(function (module) {
    mifosX.controllers = _.extend(module, {
        RecurringDocumentController: function (scope, location, http, routeParams, API_VERSION, Upload, $rootScope) {
            scope.accountId = routeParams.id;
            scope.onFileSelect = function (files) {
                scope.formData.file = files[0];
            };

            scope.submit = function () {
                Upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/recurring/' + scope.accountId + '/documents',
                    data: { name : scope.formData.name, description : scope.formData.description, file: scope.formData.file},
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/viewrecurringdepositaccount/' + scope.accountId);
                    });
            };
        }
    });
    mifosX.ng.application.controller('RecurringDocumentController', ['$scope', '$location', '$http', '$routeParams', 'API_VERSION', 'Upload', '$rootScope', mifosX.controllers.RecurringDocumentController]).run(function ($log) {
        $log.info("RecurringDocumentController initialized");
    });
}(mifosX.controllers || {}));