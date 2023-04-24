(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsDocumentController: function (scope, location, resourceFactory, http, routeParams, API_VERSION, Upload, $rootScope) {
            scope.savingsId = routeParams.savingsId;
            scope.onFileSelect = function (files) {
                scope.formData.file = files[0];
            };

            scope.submit = function () {
                Upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/savings/' + scope.savingsId + '/documents',
                    data: { name : scope.formData.name, description : scope.formData.description, file: scope.formData.file},
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/savingaccount/' + scope.savingsId + '/documents');
                    });
            };

            resourceFactory.codeValueResource.getAllCodeValues({codeId: 34}, function (data) {
                scope.documenttypes = data;
            });
        }
    });
    mifosX.ng.application.controller('SavingsDocumentController', ['$scope', '$location', 'ResourceFactory', '$http', '$routeParams', 'API_VERSION', 'Upload', '$rootScope', mifosX.controllers.SavingsDocumentController]).run(function ($log) {
        $log.info("SavingsDocumentController initialized");
    });
}(mifosX.controllers || {}));
