(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSavingProductController: function (scope, routeParams, location, anchorScroll, resourceFactory) {
            resourceFactory.savingProductResource.get({savingProductId: routeParams.id, template: 'true'}, function (data) {
                scope.savingproduct = data;
                let  productType = data.productTypes.filter(pt=>pt.id===data.productTypeId)[0]
                scope.savingproduct.productType = productType ? productType.name: '';
                let productCategory = data.productCategories.filter(pc=>pc.id===data.productCategoryId)[0]
                scope.savingproduct.productCategory = productCategory ? productCategory.name: '';
                scope.chartSlabs = scope.depositproduct.activeChart.chartSlabs;
                scope.hasAccounting = data.accountingRule.id == 2 || data.accountingRule.id == 3 ? true : false;
            });

            scope.scrollto = function (link) {
                location.hash(link);
                anchorScroll();

            };
        }
    });
    mifosX.ng.application.controller('ViewSavingProductController', ['$scope', '$routeParams', '$location', '$anchorScroll' , 'ResourceFactory', mifosX.controllers.ViewSavingProductController]).run(function ($log) {
        $log.info("ViewSavingProductController initialized");
    });
}(mifosX.controllers || {}));
