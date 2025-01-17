(function (module) {
    mifosX.controllers = _.extend(module, {
        GuarantorController: function ($q,scope, resourceFactory, routeParams, location, dateFilter) {
            scope.template = {};
            scope.clientview = false;
            scope.temp = true;
            scope.date = {};
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.clientData={};
            scope.offices=[];
            scope.toClients=[];
            scope.yesNoOptions = [{id: true, name: "Yes"}, {id: false, name: 'No'}];

            resourceFactory.clientTemplateResource.get(function(data) {
                scope.offices=data.officeOptions;
                scope.formData.officeId=scope.offices[0].id;
                scope.genderOptions = data.genderOptions;
            });

            scope.changeOffice=function(officeId){
                resourceFactory.clientTemplateResource.get({officeId:officeId},function (data) {
                    scope.staffs=data.staffOptions;
                });
            };

            resourceFactory.guarantorResource.get({ loanId: routeParams.id, templateResource: 'template'}, function (data) {
                scope.template = data;
                scope.loanId = routeParams.id;
            });

            scope.clientOptions=function(value){
            var deferred=$q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName:value, orderBy: 'displayName', officeId:
                scope.formData.officeId,sortOrder: 'ASC'},function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            }


            scope.viewClient = function (item) {
                scope.clientview = true;
                scope.client = item;
                scope.changeEvent();
            };
            scope.checkClient = function () {
                if (!scope.temp) {
                    scope.clientview = false;
                }
            };

            scope.changeEvent = function () {
                resourceFactory.guarantorAccountResource.get({ loanId: routeParams.id, clientId: scope.client.id},  function (data) {
                    scope.accounts = data.accountLinkingOptions;
                });
            }

            scope.submit = function () {
                var guarantor = {};
                var reqDate = dateFilter(scope.date.first, scope.df);
                if (scope.temp == true) {
                    guarantor.guarantorTypeId = scope.template.guarantorTypeOptions[0].id;
                    guarantor.locale = scope.optlang.code;
                    if (this.formData) {
                        guarantor.clientRelationshipTypeId = this.formData.relationship;
                    }
                    if (scope.client) {
                        guarantor.entityId = scope.client.id;
                        guarantor.savingsId =  this.formData.savingsId;
                        guarantor.amount =  this.formData.amount;
                    }
                }
                else if (this.formData) {
                    guarantor.addressLine1 = this.formData.addressLine1;
                    guarantor.addressLine2 = this.formData.addressLine2;
                    guarantor.city = this.formData.city;
                    guarantor.dob = reqDate;
                    guarantor.zip = this.formData.zip;
                    guarantor.dateFormat = scope.df;
                    guarantor.locale = scope.optlang.code;
                    guarantor.firstname = this.formData.firstname;
                    guarantor.lastname = this.formData.lastname;
                    guarantor.mobileNumber = this.formData.mobile;
                    guarantor.housePhoneNumber = this.formData.residence;
                    guarantor.guarantorTypeId = scope.template.guarantorTypeOptions[2].id;
                    guarantor.clientRelationshipTypeId = this.formData.relationshipType;
                    
                    if(this.formData.middlename){
                        guarantor.middlename = this.formData.middlename;
                    }

                    if(this.formData.email){
                        guarantor.email = this.formData.email;
                    }

                    if(this.formData.bvn){
                        guarantor.bvn = this.formData.bvn;
                    }

                    //add pep option if selected
                    if(this.formData.pep){
                        guarantor.pep = this.formData.pep;
                    }

                    if(this.formData.genderId){
                        guarantor.genderId = this.formData.genderId;
                    }

                }
                resourceFactory.guarantorResource.save({ loanId: routeParams.id}, guarantor, function (data) {
                    location.path('viewloanaccount/' + routeParams.id);
                });
            };
        }
    });
   mifosX.ng.application.controller('GuarantorController', ['$q','$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter', mifosX.controllers.GuarantorController]).run(function ($log) {
        $log.info("GuarantorController initialized");
    });
}(mifosX.controllers || {}));
