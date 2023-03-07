(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSavingsProductFloatingInterestRatesController: function (scope, routeParams, location, anchorScroll, resourceFactory) {
            resourceFactory.savingProductResource.get({savingProductId: routeParams.id, template: 'true'}, function (data) {
                scope.savingproduct = data;
            });

            scope.productId = routeParams.id;

            scope.routeTo = function (id) {
                location.path('/viewsavingproduct/'+ scope.productId +'/floatinginterestrate/' + id);
            };
        }
    });
    mifosX.ng.application.controller('ViewSavingsProductFloatingInterestRatesController', ['$scope', '$routeParams', '$location', '$anchorScroll' , 'ResourceFactory', mifosX.controllers.ViewSavingsProductFloatingInterestRatesController]).run(function ($log) {
        $log.info("ViewSavingsProductFloatingInterestRatesController initialized");
    });
}(mifosX.controllers || {}));