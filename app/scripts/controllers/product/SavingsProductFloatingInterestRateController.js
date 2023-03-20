(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsProductFloatingInterestRateController: function (scope, routeParams, location, resourceFactory, route, $uibModal) {

            resourceFactory.savingProductsFloatingInterestRateResource.get({savingProductId: routeParams.productId, floatingInterestRateId: routeParams.floatingInterestrateId}, function (data) {
                scope.savingProductsFloatingInterestRate = data;
            });

            scope.productId = routeParams.productId;
            scope.floatingInterestRateId = routeParams.floatingInterestrateId;

            scope.deletefloatingInterestRate = function () {
                $uibModal.open({
                    templateUrl: 'deleteglfir.html',
                    controller: FloatingInterestDeleteCtrl
                });
            };

            var FloatingInterestDeleteCtrl = function ($scope, $uibModalInstance) {
                $scope.delete = function () {
                    resourceFactory.savingProductsFloatingInterestRateResource.delete({savingProductId: routeParams.productId, floatingInterestRateId: routeParams.floatingInterestrateId}, {}, function (data) {
                        $uibModalInstance.close('delete');
                        location.path('/viewsavingproduct/'+ scope.productId +'/floatinginterestrate');
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.changeState = function (disabled) {
                resourceFactory.accountCoaResource.update({'glAccountId': routeParams.id}, {disabled: !disabled}, function (data) {
                    route.reload();
                });
            };
        }
    });
    mifosX.ng.application.controller('SavingsProductFloatingInterestRateController', ['$scope', '$routeParams', '$location', 'ResourceFactory', '$route', '$uibModal', mifosX.controllers.SavingsProductFloatingInterestRateController]).run(function ($log) {
        $log.info("SavingsProductFloatingInterestRateController initialized");
    });
}(mifosX.controllers || {}));
