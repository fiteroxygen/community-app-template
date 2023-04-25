(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsDocumentsController: function (scope, resourceFactory, routeParams, location, route, $rootScope, API_VERSION) {

            scope.accountDocuments = [];
            scope.savingsId = routeParams.savingsId;

            resourceFactory.savingsDocumentsResource.getAllSavingsDocuments({savingsId: routeParams.savingsId}, function (data) {
                for (var l in data) {

                    var docs = {};
                    docs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    data[l].docUrl = docs;
                    if (data[l].fileName)
                        if (data[l].fileName.toLowerCase().indexOf('.jpg') != -1 || data[l].fileName.toLowerCase().indexOf('.jpeg') != -1 || data[l].fileName.toLowerCase().indexOf('.png') != -1)
                            data[l].fileIsImage = true;
                    if (data[l].type)
                         if (data[l].type.toLowerCase().indexOf('image') != -1)
                            data[l].fileIsImage = true;
                }
                scope.accountDocuments = data;
            });

            scope.deleteDocument = function (documentId, index) {
                resourceFactory.savingsDocumentsResource.delete({savingsId: routeParams.savingsId, documentId: documentId}, '', function (data) {
                    scope.accountDocuments.splice(index, 1);
                });
            };

            scope.previewDocument = function (url, fileName) {
                scope.preview =  true;
                scope.fileUrl = scope.hostUrl + url;
                if(fileName.toLowerCase().indexOf('.png') != -1)
                    scope.fileType = 'image/png';
                else if(fileName.toLowerCase().indexOf('.jpg') != -1)
                    scope.fileType = 'image/jpg';
                else if(fileName.toLowerCase().indexOf('.jpeg') != -1)
                    scope.fileType = 'image/jpeg';
            };

        }
    });
    mifosX.ng.application.controller('SavingsDocumentsController', ['$scope', 'ResourceFactory', '$routeParams', '$location', '$route', '$rootScope', 'API_VERSION', mifosX.controllers.SavingsDocumentsController]).run(function ($log) {
        $log.info("SavingsDocumentsController initialized");
    });
}(mifosX.controllers || {}));

