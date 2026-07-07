(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateChargeController: function (scope, resourceFactory, location, dateFilter, translate) {
            scope.template = [];
            scope.formData = {};
            scope.first = {};
            scope.isCollapsed = true;
            scope.showdatefield = false;
            scope.repeatEvery = false;
            scope.first.date = new Date();
            scope.translate = translate;
            scope.showFrequencyOptions = false;
            scope.showPenalty = true;
            scope.showfreewithdrawalfrequency = false;
            scope.showrestartfrequency = false;
            scope.paymentTypes = [];
            scope.showMinAndMaxAmountSettings = false;
            scope.loanChargeCalculationType = false;
            scope.loanChargeTimeChange = false;
            scope.varyAmounts = false;
            scope.showAmountRangeSelector = false;
            scope.showMaxOccurrence = false;
            scope.chart = {};

            resourceFactory.chargeTemplateResource.get(function (data) {
                scope.template = data;
                scope.showChargePaymentByField = true;
                scope.showMinAndMaxAmountSettings = false;
                scope.chargeCalculationTypeOptions = data.chargeCalculationTypeOptions;
                scope.chargeTimeTypeOptions = data.chargeTimeTypeOptions;

                scope.incomeAccountOptions = data.incomeOrLiabilityAccountOptions.incomeAccountOptions || [];
                scope.liabilityAccountOptions = data.incomeOrLiabilityAccountOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);

                scope.assetAccountOptions = data.assetAccountOptions || [];
                scope.expenseAccountOptions = data.expenseAccountOptions;
                scope.accountMappingForChargeConfig = data.accountMappingForChargeConfig;
                scope.accountMappingForCharge = [];

                scope.chart.chartSlabs = [];

                var accountMappingForChargeConfigVar = scope.accountMappingForChargeConfig.toLowerCase();

                if (accountMappingForChargeConfigVar.indexOf("asset") > -1) {
                    scope.accountMappingForCharge = scope.accountMappingForCharge.concat(scope.assetAccountOptions);
                }
                if (accountMappingForChargeConfigVar.indexOf("liability") > -1) {
                    scope.accountMappingForCharge = scope.accountMappingForCharge.concat(scope.liabilityAccountOptions);
                }
                if (accountMappingForChargeConfigVar.indexOf("expense") > -1) {
                    scope.accountMappingForCharge = scope.accountMappingForCharge.concat(scope.expenseAccountOptions);
                }
                if (accountMappingForChargeConfigVar.indexOf("income") > -1) {
                    scope.accountMappingForCharge = scope.accountMappingForCharge.concat(scope.incomeAccountOptions);
                }
            });

            scope.chargeAppliesToSelected = function (chargeAppliesId) {
                switch (chargeAppliesId) {
                    case 1:
                        scope.showChargePaymentByField = true;
                        scope.chargeCalculationTypeOptions = scope.template.loanChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.loanChargeTimeTypeOptions;
                        scope.showGLAccount = false;
                        scope.showMinAndMaxAmountSettings = false;
                        break;
                    case 2:
                        scope.showChargePaymentByField = false;
                        scope.chargeCalculationTypeOptions = scope.template.savingsChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.savingsChargeTimeTypeOptions;
                        scope.addfeefrequency = false;
                        scope.showGLAccount = true;
                        scope.showMinAndMaxAmountSettings = true;
                        break;
                    case 3:
                        scope.showChargePaymentByField = false;
                        scope.chargeCalculationTypeOptions = scope.template.clientChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.clientChargeTimeTypeOptions;
                        scope.addfeefrequency = false;
                        scope.showGLAccount = true;
                        scope.showMinAndMaxAmountSettings = false;
                        break;
                    case 4:
                        scope.showChargePaymentByField = false;
                        scope.chargeCalculationTypeOptions = scope.template.shareChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.shareChargeTimeTypeOptions;
                        scope.addfeefrequency = false;
                        scope.showGLAccount = false;
                        scope.showPenalty = false;
                        scope.showMinAndMaxAmountSettings = false;
                        break;
                }


            }
            scope.chargeCalculationTypeChange = function (chargeCalculationType) {
                scope.loanChargeCalculationType = false;
                if (chargeCalculationType == 1) {
                    scope.loanChargeCalculationType = false;
                } else {
                    scope.loanChargeCalculationType = true;
                }
            }
            
            // Check if CLI charge checkbox should be displayed (only for Disbursement and Disburse To Savings)
            scope.isCLIEligibleChargeTimeType = function () {
                if (!scope.formData.chargeTimeType || !scope.chargeTimeTypeOptions) {
                    return false;
                }
                for (var i = 0; i < scope.chargeTimeTypeOptions.length; i++) {
                    if (scope.chargeTimeTypeOptions[i].id === scope.formData.chargeTimeType) {
                        var code = scope.chargeTimeTypeOptions[i].code || '';
                        return code === 'chargeTimeType.disbursement' || code === 'chargeTimeType.disburseToSavings';
                    }
                }
                return false;
            };
            //when chargeAppliesTo is savings, below logic is
            //to display 'Due date' field, if chargeTimeType is
            //'annual fee' or 'monthly fee'
            scope.chargeTimeChange = function (chargeTimeType) {
                scope.showFrequencyOptions = false;
                scope.showMaxOccurrence = false;
                scope.loanChargeTimeChange = false;
                if (chargeTimeType == 9) {
                    scope.showFrequencyOptions = true;
                    scope.showMaxOccurrence = true;
                }
                if (chargeTimeType == 2) {
                    scope.loanChargeTimeChange = false;
                } else {
                    scope.loanChargeTimeChange = true;
                }
                if (scope.showChargePaymentByField === false) {
                    for (var i in scope.chargeTimeTypeOptions) {
                        if (chargeTimeType === scope.chargeTimeTypeOptions[i].id) {
                            if (scope.chargeTimeTypeOptions[i].value == "Annual Fee" || scope.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                scope.showdatefield = true;
                                scope.showenablefreewithdrawal = false;
                                scope.showenablepaymenttype = false;
                                scope.repeatsEveryLabel = 'label.input.months';
                                //to show 'repeats every' field for monthly fee
                                if (scope.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                    scope.repeatEvery = true;
                                } else {
                                    scope.repeatEvery = false;
                                }
                            } else if (scope.chargeTimeTypeOptions[i].value == "Weekly Fee") {
                                scope.repeatEvery = true;
                                scope.showdatefield = false;
                                scope.repeatsEveryLabel = 'label.input.weeks';
                                scope.showenablefreewithdrawal = false;
                                scope.showenablepaymenttype = false;
                            }
                            else if (scope.chargeTimeTypeOptions[i].value == "Withdrawal Fee") {
                                scope.showenablefreewithdrawal = true;
                                scope.showenablepaymenttype = true;
                            }
                            else {
                                scope.showenablefreewithdrawal = false;
                                scope.showenablepaymenttype = false;
                                scope.showdatefield = false;
                                scope.repeatEvery = false;
                            }
                        }


                    }
                }

                if (chargeTimeType == 19) {
                    scope.showAmountRangeSelector = true;
                } else {
                    scope.showAmountRangeSelector = false;
                }

            }

            /**
    * Add a new row with default values for entering chart details
    */
            scope.addNewRow = function () {
                var fromPeriod = '';
                var toPeriod = '';
                var amountRangeTo = '';
                if (_.isNull(scope.chart.chartSlabs) || _.isUndefined(scope.chart.chartSlabs)) {
                    scope.chart.chartSlabs = [];
                } else {
                    var lastChartSlab = {};
                    if (scope.chart.chartSlabs.length > 0) {
                        lastChartSlab = angular.copy(scope.chart.chartSlabs[scope.chart.chartSlabs.length - 1]);
                    } else {
                        lastChartSlab = null;
                    }
                    if (!(_.isNull(lastChartSlab) || _.isUndefined(lastChartSlab))) {
                        if (scope.isPrimaryGroupingByAmount) {
                            if ((_.isNull(lastChartSlab.toPeriod) || _.isUndefined(lastChartSlab.toPeriod) || lastChartSlab.toPeriod.length == 0)) {
                                amountRangeFrom = _.isNull(lastChartSlab) ? '' : parseFloat(lastChartSlab.amountRangeTo) + 1;
                                fromPeriod = (_.isNull(lastChartSlab.fromPeriod) || _.isUndefined(lastChartSlab.fromPeriod) || lastChartSlab.fromPeriod.length == 0) ? '' : 1;
                            } else {
                                amountRangeFrom = lastChartSlab.amountRangeFrom;
                                amountRangeTo = lastChartSlab.amountRangeTo;
                                fromPeriod = _.isNull(lastChartSlab) ? '' : parseInt(lastChartSlab.toPeriod) + 1;
                            }
                        } else {
                            if ((_.isNull(lastChartSlab.amountRangeTo) || _.isUndefined(lastChartSlab.amountRangeTo) || lastChartSlab.amountRangeTo.length == 0)) {
                                amountRangeFrom = (_.isNull(lastChartSlab.amountRangeFrom) || _.isUndefined(lastChartSlab.amountRangeFrom) || lastChartSlab.amountRangeFrom.length == 0) ? '' : 1;
                                fromPeriod = _.isNull(lastChartSlab) ? '' : parseFloat(lastChartSlab.toPeriod) + 1;
                            } else {
                                fromPeriod = lastChartSlab.fromPeriod;
                                toPeriod = lastChartSlab.toPeriod;
                                amountRangeFrom = _.isNull(lastChartSlab) ? '' : parseInt(lastChartSlab.amountRangeTo) + 1;
                            }
                        }
                        periodType = angular.copy(lastChartSlab.periodType);
                    }
                }


                var chartSlab = {
                    "fromPeriod": fromPeriod,
                };
                if (!_.isUndefined(toPeriod) && toPeriod.length > 0) {
                    chartSlab.toPeriod = toPeriod;
                }
                if (!_.isUndefined(amountRangeTo) && amountRangeTo.length > 0) {
                    chartSlab.amountRangeTo = amountRangeTo;
                }
                scope.chart.chartSlabs.push(chartSlab);
            }

            /**
             * Remove chart details row
             */
            scope.removeRow = function (index) {
                scope.chart.chartSlabs.splice(index, 1);
            }


            resourceFactory.paymentTypeResource.getAll(function (data) {
                scope.paymentTypes = data;
            });

            resourceFactory.loanProductResource.get({ resourceType: 'template' }, function (data) {
                scope.product = data;
                const i = 1;
                scope.filteredItems = scope.product.repaymentFrequencyTypeOptions.slice(0, i).concat(scope.product.repaymentFrequencyTypeOptions.slice(i + 1, scope.product.repaymentFrequencyTypeOptions.length));
            })

            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }

                if (this.formData.enablepaymenttypes) {
                    scope.choice = 1;
                } else if (!this.formData.enablepaymenttypes) {
                    scope.choice = 0;
                }
            };

            scope.setOptions = function () {
                if (this.formData.enableFreeWithdrawalCharge) {
                    scope.showfreewithdrawalfrequency = true;
                    scope.showrestartfrequency = true;

                } else if (!this.formData.enableFreeWithdrawalCharge) {
                    scope.showfreewithdrawalfrequency = false;
                    scope.showrestartfrequency = false;
                }

                if (this.formData.enablePaymentType) {
                    scope.showpaymenttype = true;
                } else if (!this.formData.enablePaymentType) {
                    scope.showpaymenttype = false;
                }
            };

            scope.hideweek = function () {
                return this.formData.countFrequencyType.id !== 1;
            };

            scope.filterChargeCalculations = function (chargeTimeType) {

                return function (item) {
                    if (chargeTimeType == 12 && ((item.id == 3) || (item.id == 4))) {
                        return false;
                    }
                    if (chargeTimeType != 12 && item.id == 5) {
                        return false;
                    }
                    return true;
                };
            };
            scope.submit = function () {
                //when chargeTimeType is 'annual' or 'monthly fee' then feeOnMonthDay added to
                //the formData
                if (scope.showChargePaymentByField === false) {
                    if (scope.showdatefield === true) {
                        var reqDate = dateFilter(scope.first.date, 'dd MMMM');
                        this.formData.monthDayFormat = 'dd MMM';
                        this.formData.feeOnMonthDay = reqDate;
                    }
                }

                if ((scope.formData.chargeAppliesTo === 1 || scope.formData.chargeAppliesTo === 3) && scope.addfeefrequency == 'false') {
                    scope.formData.feeFrequency = null;
                    scope.formData.feeInterval = null;
                }

                if (!scope.showChargePaymentByField) {
                    delete this.formData.chargePaymentMode;
                }
              
                if(scope.varyAmounts){
                    this.formData.chart = scope.chart
                    this.formData.amount = 0
                }
                this.formData.active = this.formData.active || false;
                this.formData.enableFreeWithdrawalCharge = this.formData.enableFreeWithdrawalCharge || false;
                this.formData.enablePaymentType = this.formData.enablePaymentType || false;
                this.formData.isCLICharge = this.formData.isCLICharge || false;
                this.formData.locale = scope.optlang.code;
                this.formData.monthDayFormat = 'dd MMM';

                resourceFactory.chargeResource.save(this.formData, function (data) {
                    location.path('/viewcharge/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateChargeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$translate', mifosX.controllers.CreateChargeController]).run(function ($log) {
        $log.info("CreateChargeController initialized");
    });
}(mifosX.controllers || {}));
