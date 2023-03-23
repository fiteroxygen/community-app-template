(function(module) {
  mifosX.controllers = _.extend(module, {
    ViewFixedDepositProductController: function(scope, routeParams , location , anchorScroll , resourceFactory,$uibModal ) {
        resourceFactory.fixedDepositProductResource.get({productId: routeParams.productId , template: 'true'} , function(data) {
            scope.depositproduct = data;
            let  productType = data.productTypes.filter(pt=>pt.id===data.productTypeId)[0]
            scope.depositproduct.productType = productType?productType.name:'';
            let productCategory = data.productCategories.filter(pc=>pc.id===data.productCategoryId)[0]
            scope.depositproduct.productCategory = productCategory?productCategory.name:'';
            scope.chartSlabs = scope.depositproduct.activeChart.chartSlabs;
            scope.hasAccounting = data.accountingRule.id == 2 || data.accountingRule.id == 3 ? true : false;
        });

        scope.scrollto = function (link){
                location.hash(link);
                anchorScroll();

        };

        scope.incentives = function(index){
            $uibModal.open({
                templateUrl: 'incentive.html',
                controller: IncentiveCtrl,
                resolve: {
                    chartSlab: function () {
                        return scope.depositproduct.activeChart.chartSlabs[index];
                    }
                }
            });
        }

        var IncentiveCtrl = function ($scope, $uibModalInstance, chartSlab) {
            $scope.chartSlab = chartSlab;
            _.each($scope.chartSlab.incentives, function (incentive) {
                if(!incentive.attributeValueDesc){
                    incentive.attributeValueDesc = incentive.attributeValue;
                }
            });
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        };
    }
  });
  mifosX.ng.application.controller('ViewFixedDepositProductController', ['$scope', '$routeParams', '$location', '$anchorScroll' , 'ResourceFactory','$uibModal', mifosX.controllers.ViewFixedDepositProductController]).run(function($log) {
    $log.info("ViewFixedDepositProductController initialized");
  });
}(mifosX.controllers || {}));
