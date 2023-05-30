(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTasksController: function (scope, resourceFactory,routeParams, location) {
            scope.formData ={};
            scope.showQuestions = true;
            scope.id = routeParams.id;
            resourceFactory.tasksResource.get({taskId : scope.id},{},function(data){
                scope.formData = data;
            });
        }
    });

    mifosX.ng.application.controller('ViewTasksController', ['$scope', 'ResourceFactory', '$routeParams', '$location', mifosX.controllers.ViewTasksController]).run(function ($log) {
        $log.info("ViewTasksController initialized");
    });
}(mifosX.controllers || {}));
