LOCA.rentCtrl = (function($, Handlebars) {

    // RentCtrl extends Controller
    function RentCtrl() {
        this.form = new LOCA.PaymentForm();
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-rent',
            domListId: '#rents',
            listSelectionMenuId: 'rents-selection-menu',
            urls: {
                overview: '/api/rents/overview',
                items: '/api/rents'
            }
        });
    }
    RentCtrl.prototype = Object.create(LOCA.ViewController);
    RentCtrl.prototype.constructor = RentCtrl;

    RentCtrl.prototype.initTemplates = function() {
        // Handlebars templates
        this.templateMonthSelector = Handlebars.compile($('#view-rent #month-selector-template').html());

        this.templateYearSelector = Handlebars.compile($('#view-rent #year-selector-template').html());

        Handlebars.registerPartial('renthistory-template', $('#view-rent #renthistory-template').html());
        this.templateHistoryRents = Handlebars.compile($('#view-rent #rentshistory-template').html());

        var $rentsSelected = $('#view-rent #rents-selected-template');
        if ($rentsSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($rentsSelected.html());
        }
    };

    RentCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    RentCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    RentCtrl.prototype.loadData = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.loadData.call(this, callback);
    };

    RentCtrl.prototype.loadList = function (callback) {
        var self = this;

        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/rents/overview?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
        },
        function(rentsOverview) {
            var countAll = rentsOverview.countAll;
            var countPaid = rentsOverview.countPaid;
            var countPartiallyPaid = rentsOverview.countPartiallyPaid;
            var countNotPaid = rentsOverview.countNotPaid;
            var totalToPay = rentsOverview.totalToPay;
            var totalNotPaid = rentsOverview.totalNotPaid;
            var totalPaid = rentsOverview.totalPaid;
            $('.all-filter-label').html(countAll);
            $('.paid-filter-label').html(countPaid+countPartiallyPaid);
            $('.not-paid-filter-label').html(countNotPaid);
            //$('.partially-paid-filter-label').html(countPartiallyPaid);
            $('.total-topay').html(LOCA.formatMoney(totalToPay));
            $('.total-notpaid').html(LOCA.formatMoney(totalNotPaid));
            $('.total-paid').html(LOCA.formatMoney(totalPaid));

            if (self.filterValue) {
                $('#view-rent .selection-filter-label').html($('#view-rent .filterbar .user-action[data-value="'+self.filterValue+'"]').text());
            }

            LOCA.requester.ajax({
                type: 'GET',
                url: '/api/rents?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
            },
            function(jsonRents) {
                self.list.init({rows: jsonRents});
                if (callback) {
                    callback();
                }
            });
        });
    };

    RentCtrl.prototype.getSelectedIds = function() {
        // Call parent
        return LOCA.ViewController.prototype.getSelectedIds.call(this);
    };

    RentCtrl.prototype.scrollToVisible = function(selector) {
        // Call parent
        LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    };

    RentCtrl.prototype.openForm = function(id) {
        // Call parent
        LOCA.ViewController.prototype.openForm.call(this, id);
    };

    RentCtrl.prototype.closeForm = function(id) {
        // Call parent
        LOCA.ViewController.prototype.closeForm.call(this, id);
    };

    RentCtrl.prototype.onUserAction = function($action, actionId) {
        var self = this,
            selection = [];

        selection = self.list.getSelectedData();

        if (actionId==='monthselector') {
            LOCA.currentMonth = $action.data('value');
            LOCA.application.updateView('rent', {
                month: LOCA.currentMonth,
                year: LOCA.currentYear
            }, true);
            $('#month-selector-dropdown').removeClass('open');
        }
        else if (actionId==='yearselector') {
            LOCA.currentYear = $action.data('value');
            LOCA.application.updateView('rent', {
                month: LOCA.currentMonth,
                year: LOCA.currentYear
            }, true);
            $('#year-selector-dropdown').removeClass('open');
        }
        else if (actionId==='list-action-pay-rent') {
            self.form.setData(selection[0]);
            self.openForm('pay-rent-form');
        }
        else if (actionId==='list-action-rents-history') {
            $('#rents-history-table').html('');
            LOCA.requester.ajax({
                type: 'GET',
                url: '/api/rents/occupant?id='+selection[0]._id
            },
            function(rentsHistory) {
                $('#rents-history-table').html(self.templateHistoryRents(rentsHistory));
                self.scrollToVisible('#renttable .active');
            });
            self.openForm('rents-history', true);
        }
        else if (actionId==='list-action-print') {
            self.openForm('print-doc-selector');
        }
        else if (actionId==='list-action-save-form') {
            self.form.submit(function(data) {
                self.closeForm(function() {
                    LOCA.requester.ajax({
                        type: 'GET',
                        url: '/api/rents/overview?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
                    },
                    function(rentsOverview) {
                        var countAll = rentsOverview.countAll;
                        var countPaid = rentsOverview.countPaid;
                        var countPartiallyPaid = rentsOverview.countPartiallyPaid;
                        var countNotPaid = rentsOverview.countNotPaid;
                        var totalToPay = rentsOverview.totalToPay;
                        var totalNotPaid = rentsOverview.totalNotPaid;
                        var totalPaid = rentsOverview.totalPaid;
                        $('.all-filter-label').html(countAll);
                        $('.paid-filter-label').html(countPaid + countPartiallyPaid);
                        $('.not-paid-filter-label').html(countNotPaid);
                        //$('.partially-paid-filter-label').html(countPartiallyPaid);
                        $('.total-topay').html(LOCA.formatMoney(totalToPay));
                        $('.total-notpaid').html(LOCA.formatMoney(totalNotPaid));
                        $('.total-paid').html(LOCA.formatMoney(totalPaid));

                        self.list.update(data);
                        self.list.showAllRows(function () {
                            self.scrollToVisible();
                        });
                    });
                });
            });
        }
    };

    RentCtrl.prototype.initListeners = function() {
        var self = this;

        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);

        $(document).on('click', '#view-rent #printinvoices', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/invoice?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #rentcall', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/rentcall?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #recovery1', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/recovery1?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #recovery2', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/recovery2?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #recovery3', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/recovery3?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #paymentorder', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/paymentorder?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });
    };

    RentCtrl.prototype.onLoadData = function(callback) {
        var self = this,
            years = [],
            monthes = [
                {monthLabel: 'Janvier', monthNumber: 1},
                {monthLabel: 'Février', monthNumber: 2},
                {monthLabel: 'Mars', monthNumber: 3},
                {monthLabel: 'Avril', monthNumber: 4},
                {monthLabel: 'Mai', monthNumber: 5},
                {monthLabel: 'Juin', monthNumber: 6},
                {monthLabel: 'Juillet', monthNumber: 7},
                {monthLabel: 'Août', monthNumber: 8},
                {monthLabel: 'Séptembre', monthNumber: 9},
                {monthLabel: 'Octobre', monthNumber: 10},
                {monthLabel: 'Novembre', monthNumber: 11},
                {monthLabel: 'Décembre', monthNumber: 12}
            ],
            year;
        for (year = LOCA.currentYear - 9; year<=LOCA.currentYear + 9; ++year) {
            years.push(year);
        }

        self.form.bindForm();

        $('#month-selector-dropdown ul').html(self.templateMonthSelector({monthes:monthes}));
        $('#year-selector-dropdown ul').html(self.templateYearSelector({years:years}));
        $('.month-selector-selection-label').html(monthes[LOCA.currentMonth-1].monthLabel);
        $('.year-selector-selection-label').html(LOCA.currentYear);

        if (callback) {
            callback();
        }
    };



    return new RentCtrl();
})(window.$, window.Handlebars);