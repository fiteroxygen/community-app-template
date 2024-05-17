(function (module) {
    mifosX.directives = _.extend(module, {
        LateValidateDirective: function () {
            var numRegex = /^\d{1,19}$|^\d{1,3}(,\d{3}){1,7}$/;
            var decimalRegex=/((^\d{1,19})|(^\d{1,3}(,\d{3}){1,7}))(\.\d{1,6})?$/;
            return {
                restrict: 'A',
                require: 'ngModel',
                scope:{
                    number:'@number',
                    decimalNumber:'@decimalNumber'
                },

                link: function (scope, elm, attr, ctrl) {
                    if (attr.type === 'radio' || attr.type === 'checkbox' || attr.type ==='input') return;
                    elm.bind('blur', function () {
                        scope.$apply(function () {
                            if (elm.val() === null) {
                                ctrl.$setValidity('req', false);
                            } else {
                                ctrl.$setValidity('req', true);
                            }
                            if(scope.number) {
                                var isMatchRegex = numRegex.test(elm.val());
                                if (isMatchRegex || elm.val() === '') {
                                    ctrl.$setValidity('nval', true);
                                } else {
                                    ctrl.$setValidity('nval', false);
                                }
                            }
                            if(scope.decimalNumber) {
                                var isDecimalMatchRegex=decimalRegex.test(elm.val());
                                if (isDecimalMatchRegex || elm.val() == '') {
                                    ctrl.$setValidity('nval', true);
                                } else {
                                    ctrl.$setValidity('nval', false);
                                }
                            }
                        });
                    });
                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("lateValidate", [mifosX.directives.LateValidateDirective]).run(function ($log) {
    $log.info("LateValidateDirective initialized");
});