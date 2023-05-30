(function (module) {
    mifosX.controllers = _.extend(module, {
        ManageTasksController: function (scope, resourceFactory, location,dateFilter) {
            scope.tasksList = [];
            scope.option = {};
            scope.formData = {
            };

            scope.getAllTasks = function(){
                resourceFactory.tasksResource.getAll(function(data){
                    scope.tasksList = data;
                });
            };

            scope.getAllTasks();


            scope.createTask = function(){
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.dueDate = dateFilter(scope.formData.dueDate, scope.df);
                resourceFactory.tasksResource.save(scope.formData,function(data){
                    location.path('/viewmytask/'+data.resourceId);
                });
            }

            scope.routeTo = function(id){
                location.path('/viewmytask/'+id);
            };

        }
    });

    mifosX.ng.application.controller('ManageTasksController', ['$scope', 'ResourceFactory', '$location','dateFilter', mifosX.controllers.ManageTasksController]).run(function ($log) {
        $log.info("ManageTasksController initialized");
    });
}(mifosX.controllers || {}));
