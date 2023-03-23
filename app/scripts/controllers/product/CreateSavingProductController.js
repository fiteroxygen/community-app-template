(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateSavingProductController: function (scope, $rootScope, resourceFactory, location , dateFilter, WizardHandler) {
            scope.formData = {};
            scope.savingproduct = {};
            scope.charges = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeaccounts = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.configureFundOption = {};
            scope.isClicked = false;
            scope.floatingInterestRates = [];

            resourceFactory.savingProductResource.get({resourceType: 'template'}, function (data) {
                scope.product = data;
                scope.product.chargeOptions = scope.product.chargeOptions || [];
                scope.productCategories = data.productCategories;
                scope.productTypes = data.productTypes;
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [];
                scope.liabilityAccountOptions = scope.product.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.product.accountingMappingOptions.expenseAccountOptions || [];
                scope.paymentOptions = [];
                //
                scope.accountMappingForPayment = scope.product.accountMappingForPayment.toLowerCase();
                var accountMappingForPaymentVar = scope.accountMappingForPayment;
                if(accountMappingForPaymentVar.indexOf("asset") > -1){
                    scope.paymentOptions = scope.paymentOptions.concat(scope.assetAccountOptions);
                }
                if(accountMappingForPaymentVar.indexOf("liability") > -1){
                    scope.paymentOptions = scope.paymentOptions.concat(scope.liabilityAccountOptions);
                }
               if(accountMappingForPaymentVar.indexOf("expense") > -1){
                scope.paymentOptions = scope.paymentOptions.concat(scope.expenseAccountOptions);
                }
               if(accountMappingForPaymentVar.indexOf("income") > -1){
                scope.paymentOptions = scope.paymentOptions.concat(scope.incomeAccountOptions);
                }


                scope.formData.useFloatingInterestRate = false;

                scope.formData.currencyCode = data.currencyOptions[0].code;
                scope.formData.digitsAfterDecimal = data.currencyOptions[0].decimalPlaces;
                scope.formData.interestCompoundingPeriodType = data.interestCompoundingPeriodType.id;
                scope.formData.interestPostingPeriodType = data.interestPostingPeriodType.id;
                scope.formData.interestCalculationType = data.interestCalculationType.id;
                scope.formData.interestCalculationDaysInYearType = data.interestCalculationDaysInYearType.id;
                scope.formData.accountingRule = '1';
                scope.savingproduct = angular.copy(scope.formData);

            });

            scope.$watch('formData',function(newVal){
                scope.savingproduct = angular.extend(scope.savingproduct,newVal);
            },true);

            scope.goNext = function(form){
                WizardHandler.wizard().checkValid(form);
                scope.isClicked = true;
            }

            scope.formValue = function(array,model,findattr,retAttr){
                findattr = findattr ? findattr : 'id';
                retAttr = retAttr ? retAttr : 'value';
                console.log(findattr,retAttr,model);
                return _.find(array, function (obj) {
                    return obj[findattr] === model;
                })[retAttr];
            };
            //$rootScope.formValue is used which is defined in CreateLoanProductController.js

            //advanced accounting rule
            scope.showOrHide = function (showOrHideValue) {

                if (showOrHideValue == "show") {
                    scope.showOrHideValue = 'hide';
                }

                if (showOrHideValue == "hide") {
                    scope.showOrHideValue = 'show';
                }
            }
            scope.isAccountingEnabled = function () {
                            if (scope.formData.accountingRule == 2 || scope.formData.accountingRule == 3 ) {
                                return true;
                            }
                            return false;
                        }

            scope.isAccrualAccountingEnabled = function () {
                            if (scope.formData.accountingRule == 3 ) {
                                return true;
                            }
                            return false;
                        }

            scope.chargeSelected = function (chargeId) {
                if (chargeId) {
                    resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, this.formData, function (data) {
                        data.chargeId = data.id;
                        scope.charges.push(data);
                        //to charge select box empty
                        scope.chargeId = '';
                    });
                }
            }

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.addConfigureFundSource = function () {
                if (scope.product.paymentTypeOptions && scope.product.paymentTypeOptions.length > 0 &&
                    scope.paymentOptions && scope.paymentOptions.length > 0) {
                    scope.configureFundOptions.push({
                        paymentTypeId: scope.product.paymentTypeOptions[0].id,
                        fundSourceAccountId: scope.paymentOptions[0].id,
                        paymentTypeOptions: scope.product.paymentTypeOptions,
                        assetAccountOptions: scope.paymentOptions
                    });
                }
                ;
            }

            scope.mapFees = function () {
                if (scope.product.chargeOptions && scope.product.chargeOptions.length > 0 && scope.incomeAccountOptions && scope.incomeAccountOptions.length > 0) {
                    scope.specificIncomeaccounts.push({
                        chargeId: scope.product.chargeOptions[0].id,
                        incomeAccountId: scope.incomeAccountOptions[0].id,
                        chargeOptions: scope.product.chargeOptions,
                        incomeAccountOptions: scope.product.accountingMappingOptions.incomeAccountOptions
                    });
                }
            }

            scope.mapPenalty = function () {
                if (scope.product.penaltyOptions && scope.product.penaltyOptions.length > 0 && scope.incomeAccountOptions && scope.incomeAccountOptions.length > 0) {
                    scope.penaltySpecificIncomeaccounts.push({
                        chargeId: scope.product.penaltyOptions[0].id,
                        incomeAccountId: scope.incomeAccountOptions[0].id,
                        penaltyOptions: scope.product.penaltyOptions,
                        incomeAccountOptions: scope.incomeAccountOptions
                    });
                }
            }

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            }

            scope.deleteFee = function (index) {
                scope.specificIncomeaccounts.splice(index, 1);
            }

            scope.deletePenalty = function (index) {
                scope.penaltySpecificIncomeaccounts.splice(index, 1);
            }

            scope.cancel = function () {
                location.path('/savingproducts');
            };

            /**
             * Add floating interest rate from list
             */
            scope.addNewRow = function () {
                var fromDateSelected = '';
                var endDateSelected = '';
                var floatingInterestRateValue = '';
                if (_.isNull(scope.floatingInterestRates) || _.isUndefined(scope.floatingInterestRates)) {
                    scope.floatingInterestRates = [];
                } else {
                    var lastFloatingInterestRate = {};
                    if (scope.floatingInterestRates.length > 0) {
                        lastFloatingInterestRate = angular.copy(scope.floatingInterestRates[scope.floatingInterestRates.length - 1]);
                    }else{
                        lastFloatingInterestRate = null;
                    }
                    if (!(_.isNull(lastFloatingInterestRate) || _.isUndefined(lastFloatingInterestRate))) {
                        fromDateSelected = dateFilter(lastFloatingInterestRate.fromDate, scope.df);
                        endDateSelected = dateFilter(lastFloatingInterestRate.endDate, scope.df);
                        floatingInterestRateValue = lastFloatingInterestRate.floatingInterestRateValue;

                        /*var savingProductFloatingInterestRate = {
                            "fromDate": fromDateSelected,
                            "endDate": endDateSelected,
                            "floatingInterestRate": floatingInterestRateValue,
                            "dateFormat": scope.df,
                            "locale": scope.optlang.code,
                        };
                        scope.floatingInterestRates.push(savingProductFloatingInterestRate);*/
                    }
                }
                 var savingProductFloatingInterestRate = {
                    "fromDate": fromDateSelected,
                    "endDate": endDateSelected,
                    "floatingInterestRateValue": floatingInterestRateValue,
                    "dateFormat": scope.df,
                    "locale": scope.optlang.code
                };
                scope.floatingInterestRates.push(savingProductFloatingInterestRate);
            };

             /**
             * Remove floating interest interest  row
             */
            scope.removeRow = function (index) {
                scope.floatingInterestRates.splice(index, 1);
            }

            ////

            scope.submit = function () {
                scope.paymentChannelToFundSourceMappings = [];
                scope.feeToIncomeAccountMappings = [];
                scope.penaltyToIncomeAccountMappings = [];
                scope.chargesSelected = [];

                var temp = '';

                //configure fund sources for payment channels
                for (var i in scope.configureFundOptions) {
                    temp = {
                        paymentTypeId: scope.configureFundOptions[i].paymentTypeId,
                        fundSourceAccountId: scope.configureFundOptions[i].fundSourceAccountId
                    }
                    scope.paymentChannelToFundSourceMappings.push(temp);
                }

                //map fees to specific income accounts
                for (var i in scope.specificIncomeaccounts) {
                    temp = {
                        chargeId: scope.specificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.specificIncomeaccounts[i].incomeAccountId,
                    }
                    scope.feeToIncomeAccountMappings.push(temp);
                }

                //map penalties to specific income accounts
                for (var i in scope.penaltySpecificIncomeaccounts) {
                    temp = {
                        chargeId: scope.penaltySpecificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.penaltySpecificIncomeaccounts[i].incomeAccountId,
                    }
                    scope.penaltyToIncomeAccountMappings.push(temp);
                }

                for (var i in scope.charges) {
                    temp = {
                        id: scope.charges[i].id
                    }
                    scope.chargesSelected.push(temp);
                }

                this.formData.paymentChannelToFundSourceMappings = scope.paymentChannelToFundSourceMappings;
                this.formData.feeToIncomeAccountMappings = scope.feeToIncomeAccountMappings;
                this.formData.penaltyToIncomeAccountMappings = scope.penaltyToIncomeAccountMappings;
                this.formData.charges = scope.chargesSelected;
                this.formData.locale = scope.optlang.code;
                for (var i in scope.floatingInterestRates) {
                    scope.floatingInterestRates[i].fromDate = dateFilter(scope.floatingInterestRates[i].fromDate, scope.df);
                    scope.floatingInterestRates[i].endDate = dateFilter(scope.floatingInterestRates[i].endDate, scope.df);
                    this.formData.nominalAnnualInterestRate = scope.floatingInterestRates[i].floatingInterestRateValue;//as nominal interest rate is required just populating it from any of floating rate
                }
                this.formData.floatingInterestRates = scope.floatingInterestRates;

                resourceFactory.savingProductResource.save(this.formData, function (data) {
                    location.path('/viewsavingproduct/' + data.resourceId);
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateSavingProductController', ['$scope', '$rootScope', 'ResourceFactory', '$location','dateFilter','WizardHandler', mifosX.controllers.CreateSavingProductController]).run(function ($log) {
        $log.info("CreateSavingProductController initialized");
    });
}(mifosX.controllers || {}));
