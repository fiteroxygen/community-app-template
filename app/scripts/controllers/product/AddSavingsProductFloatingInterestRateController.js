(function (module) {
    mifosX.controllers = _.extend(module, {
        AddSavingsProductFloatingInterestRateController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.savingProductsFloatingInterestRate = {};
            scope.productId = routeParams.productId;
            scope.floatingInterestRateId = routeParams.floatingInterestrateId;

            scope.submit = function () {
                fromDateSelected = dateFilter(scope.savingProductsFloatingInterestRate.fromDate, scope.df);
                endDateSelected = dateFilter(scope.savingProductsFloatingInterestRate.endDate, scope.df);
                floatingInterestRateValue = scope.savingProductsFloatingInterestRate.floatingInterestRate;
                var updatedSavingProductFloatingInterestRate = {
                    "fromDate": fromDateSelected,
                    "endDate": endDateSelected,
                    "floatingInterestRateValue": floatingInterestRateValue,
                    "dateFormat": scope.df,
                    "locale": scope.optlang.code,
                };

                resourceFactory.savingProductsFloatingInterestRateResource.save({savingProductId: scope.productId}, updatedSavingProductFloatingInterestRate, function (data) {
                    location.path('/viewsavingproduct/' + scope.productId + '/floatinginterestrate'); //viewsavingproduct/:productId/floatinginterestrate/:floatinginterestrateId
                });
            };
        }
    });
    mifosX.ng.application.controller('AddSavingsProductFloatingInterestRateController', ['$scope', '$routeParams', 'ResourceFactory', '$location','dateFilter', mifosX.controllers.AddSavingsProductFloatingInterestRateController]).run(function ($log) {
        $log.info("AddSavingsProductFloatingInterestRateController initialized");
    });
}(mifosX.controllers || {}));
