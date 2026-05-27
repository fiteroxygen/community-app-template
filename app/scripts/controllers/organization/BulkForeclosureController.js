(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkForeclosureController: function (scope, resourceFactory, location, route, http, $uibModal, dateFilter, $interval) {
            // Initialize scope variables
            scope.eligibleLoans = [];
            scope.filteredLoans = [];
            scope.selectedLoans = {};
            scope.selectAllChecked = false;
            scope.isLoading = false;
            scope.showJobMonitor = false;
            scope.isRefreshing = false;
            scope.autoRefreshCountdown = 30;
            scope.loanProducts = [];
            scope.jobStatus = {};
            scope.totalRecords = 0;
            scope.itemsPerPage = 50;
            scope.currentPage = 1;

            // Tab management
            scope.activeTab = 'eligible';

            // Job history variables
            scope.jobHistory = [];
            scope.isLoadingJobs = false;
            scope.totalJobRecords = 0;
            scope.jobsPerPage = 20;
            scope.jobCurrentPage = 1;

            // Filter data matching backend API
            scope.filterData = {
                productId: '',
                fromDate: '',
                toDate: ''
            };

            // Datepicker configuration
            scope.fromDateOpened = false;
            scope.toDateOpened = false;
            scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            // Tab switching
            scope.setActiveTab = function (tab) {
                scope.activeTab = tab;
                if (tab === 'jobs') {
                    scope.loadJobHistory();
                }
            };

            // Load job history from API
            scope.loadJobHistory = function () {
                scope.isLoadingJobs = true;
                var params = {
                    limit: scope.jobsPerPage,
                    offset: (scope.jobCurrentPage - 1) * scope.jobsPerPage
                };
                resourceFactory.bulkForeclosureResource.getJobHistory(params, function (data) {
                    scope.jobHistory = data.pageItems || [];
                    scope.totalJobRecords = data.totalFilteredRecords || 0;
                    scope.isLoadingJobs = false;
                }, function (error) {
                    scope.isLoadingJobs = false;
                    scope.jobHistory = [];
                });
            };

            // Job history pagination
            scope.jobPageChanged = function () {
                scope.loadJobHistory();
            };

            // View job details - fetch from API /jobs/{jobId}
            scope.viewJobDetails = function (job) {
                scope.isLoadingJobs = true;
                scope.showJobMonitor = true;
                resourceFactory.bulkForeclosureResource.getJobStatus({jobId: job.jobId}, function (data) {
                    scope.jobStatus = data;
                    scope.isLoadingJobs = false;
                }, function (error) {
                    scope.jobStatus = job;
                    scope.isLoadingJobs = false;
                });
            };

            // Hide job monitor and go back to job list
            scope.hideJobMonitor = function () {
                scope.showJobMonitor = false;
            };

            // Format date array [year, month, day, hour, minute, second] to readable string
            scope.formatJobDate = function (dateArray) {
                if (!dateArray || !angular.isArray(dateArray) || dateArray.length < 3) {
                    return '-';
                }
                var date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2],
                                    dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);
                return dateFilter(date, 'dd MMM yyyy HH:mm:ss');
            };

            // Load loan products for dropdown
            resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
                scope.loanProducts = data;
            });
            // Load eligible loans from API
            scope.loadEligibleLoans = function (resetSelection) {
                if (!scope.filterData.productId) {
                    scope.eligibleLoans = [];
                    scope.filteredLoans = [];
                    return;
                }
                scope.isLoading = true;
                // Only reset selection when explicitly requested (e.g., on search/filter change)
                if (resetSelection) {
                    scope.selectedLoans = {};;
                    scope.selectAllChecked = false;
                }
                var params = {
                    productId: scope.filterData.productId,
                    limit: scope.itemsPerPage,
                    offset: (scope.currentPage - 1) * scope.itemsPerPage
                };
                // Add date filters if provided (format: dd-MM-yyyy)
                if (scope.filterData.fromDate) {
                    params.fromDate = dateFilter(scope.filterData.fromDate, 'dd-MM-yyyy');
                }
                if (scope.filterData.toDate) {
                    params.toDate = dateFilter(scope.filterData.toDate, 'dd-MM-yyyy');
                }
                resourceFactory.bulkForeclosureResource.getEligibleLoans(params, function (data) {
                    scope.eligibleLoans = data.pageItems || [];
                    scope.filteredLoans = scope.eligibleLoans;
                    scope.totalRecords = data.totalFilteredRecords || 0;
                    scope.isLoading = false;
                    // Update selectAllChecked based on current page items
                    scope.updateSelectAllState();
                }, function (error) {
                    scope.isLoading = false;
                    scope.eligibleLoans = [];
                    scope.filteredLoans = [];
                });
            };
            // Apply local filter for client-side filtering
            scope.applyLocalFilter = function () {
                scope.filteredLoans = scope.eligibleLoans.filter(function (loan) {
                    var match = true;
                    if (scope.localFilter && scope.localFilter.searchText) {
                        var searchText = scope.localFilter.searchText.toLowerCase();
                        match = (loan.clientName && loan.clientName.toLowerCase().indexOf(searchText) !== -1) ||
                                (loan.accountNo && loan.accountNo.toLowerCase().indexOf(searchText) !== -1) ||
                                (loan.loanAccountNumber && loan.loanAccountNumber.toLowerCase().indexOf(searchText) !== -1);
                    }
                    return match;
                });
            };
            // Reset filters
            scope.resetFilters = function () {
                scope.filterData = {
                    productId: scope.loanProducts.length > 0 ? scope.loanProducts[0].id : '',
                    fromDate: '',
                    toDate: ''
                };
                scope.localFilter = { searchText: '' };
                scope.currentPage = 1;
                scope.loadEligibleLoans(true); // Reset selection when filters are reset
            };
            // Pagination - keep selection when changing pages
            scope.pageChanged = function () {
                scope.loadEligibleLoans(false); // Don't reset selection on page change
            };
            // Update selectAll checkbox state based on current page
            scope.updateSelectAllState = function () {
                if (scope.filteredLoans.length === 0) {
                    scope.selectAllChecked = false;
                    return;
                }
                var allSelected = true;
                scope.filteredLoans.forEach(function (loan) {
                    if (!scope.selectedLoans[loan.loanId]) {
                        allSelected = false;
                    }
                });
                scope.selectAllChecked = allSelected;
            };
            // Selection functions
            scope.selectAll = function () {
                scope.filteredLoans.forEach(function (loan) {
                    scope.selectedLoans[loan.loanId] = true;
                });
                scope.selectAllChecked = true;
            };
            scope.deselectAll = function () {
                scope.selectedLoans = {};
                scope.selectAllChecked = false;
            };
            scope.toggleSelectAll = function () {
                if (scope.selectAllChecked) {
                    scope.selectAll();
                } else {
                    scope.deselectAll();
                }
            };
            scope.getSelectedCount = function () {
                var count = 0;
                for (var key in scope.selectedLoans) {
                    if (scope.selectedLoans[key] === true) {
                        count++;
                    }
                }
                return count;
            };
            scope.getSelectedLoanIds = function () {
                var loanIds = [];
                for (var key in scope.selectedLoans) {
                    if (scope.selectedLoans[key] === true) {
                        loanIds.push(key);
                    }
                }
                return loanIds;
            };
            // Confirmation modal
            scope.confirmBulkForeclosure = function () {
                var selectedCount = scope.getSelectedCount();
                if (selectedCount === 0) {
                    return;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'bulkForeclosureConfirmModal.html',
                    controller: BulkForeclosureConfirmModalController,
                    resolve: {
                        selectedCount: function () {
                            return selectedCount;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    scope.executeBulkForeclosure();
                });
            };
            // Execute bulk foreclosure
            scope.executeBulkForeclosure = function () {
                var loanIds = scope.getSelectedLoanIds();
                var requestData = {
                    loanIds: loanIds,
                    dateFormat: scope.df,
                    locale: scope.optlang.code,
                    foreclosureDate: dateFilter(new Date(), scope.df)
                };
                scope.isLoading = true;
                resourceFactory.bulkForeclosureResource.executeBulk(requestData, function (data) {
                    scope.isLoading = false;
                    scope.jobStatus = data;
                    scope.showJobMonitor = true;
                    // Start auto-refresh if job is in progress
                    if (data.status === 'QUEUED' || data.status === 'IN_PROGRESS') {
                        scope.startAutoRefresh();
                    }
                }, function (error) {
                    scope.isLoading = false;
                });
            };
            // Job monitoring functions
            scope.refreshJobStatus = function () {
                if (!scope.jobStatus.jobId) {
                    return;
                }
                scope.isRefreshing = true;
                resourceFactory.bulkForeclosureResource.getJobStatus({action: scope.jobStatus.jobId}, function (data) {
                    scope.jobStatus = data;
                    scope.isRefreshing = false;
                    if (data.status === 'COMPLETED' || data.status === 'COMPLETED_WITH_ERRORS' || data.status === 'FAILED') {
                        scope.stopAutoRefresh();
                    }
                }, function (error) {
                    scope.isRefreshing = false;
                });
            };
            // Auto-refresh mechanism
            var autoRefreshInterval;
            var countdownInterval;
            scope.startAutoRefresh = function () {
                scope.autoRefreshCountdown = 30;
                countdownInterval = $interval(function () {
                    scope.autoRefreshCountdown--;
                    if (scope.autoRefreshCountdown <= 0) {
                        scope.autoRefreshCountdown = 30;
                    }
                }, 1000);
                autoRefreshInterval = $interval(function () {
                    if (scope.jobStatus.status === 'QUEUED' || scope.jobStatus.status === 'IN_PROGRESS') {
                        scope.refreshJobStatus();
                    }
                }, 30000);
            };
            scope.stopAutoRefresh = function () {
                if (autoRefreshInterval) {
                    $interval.cancel(autoRefreshInterval);
                }
                if (countdownInterval) {
                    $interval.cancel(countdownInterval);
                }
            };
            scope.$on('$destroy', function () {
                scope.stopAutoRefresh();
            });
            scope.backToLoanSelection = function () {
                scope.showJobMonitor = false;
                scope.stopAutoRefresh();
                scope.loadEligibleLoans();
            };
            // Utility functions for progress bar
            scope.getSuccessPercentage = function () {
                if (!scope.jobStatus.total || scope.jobStatus.total === 0) {
                    return 0;
                }
                return Math.round((scope.jobStatus.successful / scope.jobStatus.total) * 100);
            };
            scope.getFailedPercentage = function () {
                if (!scope.jobStatus.total || scope.jobStatus.total === 0) {
                    return 0;
                }
                return Math.round((scope.jobStatus.failed / scope.jobStatus.total) * 100);
            };
            scope.getJobStatusClass = function (status) {
                switch (status) {
                    case 'QUEUED': return 'label-default';
                    case 'IN_PROGRESS': return 'label-info';
                    case 'COMPLETED': return 'label-success';
                    case 'COMPLETED_WITH_ERRORS': return 'label-warning';
                    case 'FAILED': return 'label-danger';
                    default: return 'label-default';
                }
            };
            // Initialize - don't auto-load, wait for product selection
            scope.localFilter = { searchText: '' };
        }
    });
    var BulkForeclosureConfirmModalController = function ($scope, $uibModalInstance, selectedCount) {
        $scope.selectedCount = selectedCount;
        $scope.confirm = function () {
            $uibModalInstance.close(true);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
    mifosX.ng.application.controller('BulkForeclosureController', [
        '$scope', 'ResourceFactory', '$location', '$route', '$http', '$uibModal', 'dateFilter', '$interval',
        mifosX.controllers.BulkForeclosureController
    ]).run(function ($log) {
        $log.info("BulkForeclosureController initialized");
    });
}(mifosX.controllers || {}));
