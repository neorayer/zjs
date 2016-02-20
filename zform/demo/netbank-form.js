'use strict'

var app = angular.module('zjsdemo', [
        'ui.bootstrap', 'ui.router',
        'ui.select', 'ngSanitize',  
        'pascalprecht.translate', 'textAngular',
        'ngLocale',
        'zform']);

app.config(function($translateProvider) {
    $translateProvider.preferredLanguage('cn');
});

app.controller('TransferController', function(
                $scope
                , $rootScope
                , $state
                , $interval
                , $timeout
                , VLDT
                ) {

    var linkedAccounts =  [
        { 
            title: 'Complete Access',
            bsb: '063-000',
            accNo: '1183 4646',
            balance: 55.7,
            type: 'linked',
        },
        { 
            title: 'Netbank Saver',
            bsb: '063-000',
            accNo: '1183 7177',
            balance: 55.7,
            type: 'linked',
        },
    ];

    var otherAccounts = [
        { 
            title: 'Citylink Toll',
            bsb: '443655',
            accNo: '90118780916',
            bank: 'CITYLINK MELBOURNE LIMITED',
        },
        { 
            title: 'Berwick Pool Shop',
            bsb: '063-191',
            accNo: '10111427',
            bank: 'Commonwealth Bank of Australia',
        },
    ];


    var allAccounts = [{ type: 'label', title: 'Linked Accounts'}];
    allAccounts = allAccounts.concat(linkedAccounts);
    allAccounts = allAccounts.concat({ type: 'label', title: 'Other Accounts'});
    allAccounts = allAccounts.concat(otherAccounts);

    var getAccOptionHtml_label = function(v) {
        return  '' + 
            '<div class="row bg-primary">' +
                '<div class="col-xs-12" >' +
                '<b>' + v.title + '</b><br/>' +
                '</div>' +
            '</div>';
    }

    var getAccOptionHtml_linked = function(v) {
        return  '' + 
            '<div class="row">' +
                '<div class="col-xs-7">' +
                '<b>' + v.title + '</b><br/>' +
                    v.bsb + ' ' + v.accNo + '<br/>' +
                '</div>' +
                '<div class="col-xs-5 text-right">' +
                    '<b><large>$' + v.balance + '</large></b>' +
                '</div>' +
            '</div>';
    }

    var getAccOptionHtml_other = function(v) {
        return  '' + 
            '<div class="row">' +
                '<div class="col-xs-7">' +
                '<b>' + v.title + '</b><br/>' +
                    v.bsb + ' ' + v.accNo + '<br/>' +
                '</div>' +
                '<div class="col-xs-5 text-right">' +
                    '<b><large><i class="fa fa-trash"></i></large></b>' +
                '</div>' +
            '</div>';
    }

    var getAccOptionHtml = function(v) {
        switch(v.type) {
            case 'label':
                return getAccOptionHtml_label(v);
            case 'linked':
                return getAccOptionHtml_linked(v);
            default:
                return getAccOptionHtml_other(v);
        }
    }

    var getAccSelectedHtml = function(v) {
        if (v.isLinked)
            return v.title + ' $' + v.balance;
        else
            return v.title + ' ' + v.bsb + ' ' + v.accNo;
    }

    $scope.formTransfer = {
        newPayeeSaveway: 'create-new',
        paymentMethod: 'transfer',
        when: 'now',
    };

    $scope.rows1 = [
        [
            {
                colClass: 'col-sm-12',
                el: 'text',
                text: 'From',
            },
            {
                colClass: 'col-sm-9',
                el: 'ui-select',
                name: 'fromAccount',
                placeholder: 'Select Account',
                selectedLabel:getAccSelectedHtml,
                optionLabel: getAccOptionHtml,
                options: linkedAccounts,
                isOptionDisable: function(v) {return v.type === 'label'; },
            }, // ui-select
            {
                colClass: 'col-sm-3',
            }
        ], // row: From

        [
            {
                colClass: 'col-xs-12',
                el: 'text',
                text: 'To',
            },
            {
                colClass: 'col-xs-9',
                el: 'ui-select',
                placeholder: 'Search your saved Transfers and BPAY accounts',
                name: 'toAccount',
                selectedLabel: getAccSelectedHtml,
                optionLabel: getAccOptionHtml,
                options: allAccounts,
                isOptionDisable: function(v) {return v.type === 'label'; },
            },
            {
                colClass: 'col-xs-3',
                el: 'button',
                text: 'New payee',
                icon: 'fa fa-plus',
                onClick: function(done, m) {
                    delete m.toAccount;
                    m.isToNew = true;
                    done();
                }
            },
            {
                colClass: 'col-xs-12',
                el: 'text',
                isHtml: true,
                text: function(m) { 
                    if (!m.toAccount) return '';
                    if (!m.toAccount.bank) return '';
                    return '<b>' + m.toAccount.bank + '</b>';
                },
            }
        ], // row: To
    ]; // rows1

    $scope.rows2 = [
        [
            {
                colClass: 'col-xs-12',
                el: 'radio-buttons',
                name: 'newPayeeSaveway',
                options: [
                    { label: 'Create new', value: 'create-new'},
                    { label: 'Add to existing', value: 'add-to-ex'},
                ],
            },
        ], //row newPayeeSaveway
        {
            isHidden: function(m) {
                return m.newPayeeSaveway !== 'add-to-ex';
            },
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: '*Find an entry to add account to',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'ui-select',
                    name: 'accountOfnewPayeeToSave',
                    selectedLabel: getAccSelectedHtml,
                    optionLabel: getAccOptionHtml,
                    options: allAccounts,
                    isOptionDisable: function(v) {return v.type === 'label'; },
                }
            ]
        }, // row : Find an entry to add account to
        [
            {
                colClass: 'col-xs-12',
                el: 'text',
                text: 'Payment method',
            },
            {
                colClass: 'col-xs-12',
                el: 'radio-buttons',
                name: 'paymentMethod',
                options: [
                    { label: 'Transfer', value: 'transfer'},
                    { label: 'BPAY', value: 'bpay'},
                    { label: 'Mobile', value: 'mobile'},
                    { label: 'Email', value: 'email'},
                ],                
            }
        ], // row : Payment method
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'transfer'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Account name',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'input',
                    name: 'newPayeeAccName',
                },
                {
                    colClass: 'col-xs-6',
                }
            ]
        }, // row: Account name
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'transfer'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'BSB',
                },
                {
                    colClass: 'col-xs-3',
                    el: 'input',
                    name: 'newPayeeBsb',
                },
                {
                    colClass: 'col-xs-9',
                }
            ]
        }, // row: BSB
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'transfer'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Account number',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'input',
                    name: 'newPayeeAccNo',
                },
                {
                    colClass: 'col-xs-6',
                }
            ]
        }, //row: Account number
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'bpay'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Bill name',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'input',
                    name: 'newPayeeBillName',
                },
                {
                    colClass: 'col-xs-6',
                }
            ]
        }, // row: Bill name
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'bpay'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Biller code',
                },
                {
                    colClass: 'col-xs-4',
                    el: 'input',
                    name: 'newPayeeBillerCode',
                },
                {
                    colClass: 'col-xs-8',
                }
            ]
        }, // row: Biller code
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'bpay'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Ref',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'input',
                    name: 'newPayeeRef',
                },
                {
                    colClass: 'col-xs-6',
                }
            ]
        }, //row: Ref
        
        { 
            isHidden: function(m) {return  m.paymentMethod !== 'mobile'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Mobile number',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'input',
                    name: 'newPayeeMobile',
                },
                {
                    colClass: 'col-xs-6',
                }
            ]
        }, //row: Mobile number

        { 
            isHidden: function(m) {return  m.paymentMethod !== 'email'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Email',
                },
                {
                    colClass: 'col-xs-6',
                    el: 'input',
                    name: 'newPayeeEmail',
                },
                {
                    colClass: 'col-xs-6',
                }
            ]
        }, //row: Mobile number
        [
            {
                colClass: 'col-xs-12',
                el: 'checkbox',
                name: 'isSaveToAddrBook',
                text: 'Save to address book',
            }
        ]
    ]; // rows2

    $scope.rows3 = [
        [
            {
                colClass: 'col-xs-12',
                el: 'text',
                text: 'Amount',
            },
            {
                colClass: 'col-xs-4',
                el: 'input-group',
                left: '$',
                input: {
                    type: 'number',
                    name: 'amount',
                },
            },
            {
                colClass: 'col-xs-8',
                el: 'text',
                isHtml: true,
                text: 'Remaining BPAY limit $50,000.00 <a href>Change limit</a>',
            },
        ], // row Amount
        
        [
            {
                colClass: 'col-xs-12',
                el: 'text',
                text: 'Description on your statement (optional)',
            },
            {
                colClass: 'col-xs-4',
                el: 'input',
                name: 'statementDesc',
                placeholder: '18 character limit',
                maxlength: 18,
            },
            {
                colClass: 'col-xs-8',
            },
        ], // row Description on your statement 

        
        [
            {
                colClass: 'col-xs-12',
                el: 'text',
                text: 'When',
            },
            {
                colClass: 'col-xs-12',
                el: 'radio-buttons',
                name: 'when',
                options: [
                    {label: 'Now', value: 'now'},
                    {label: 'Later', value: 'later'},
                    {label: 'Set up regular payments', value: 'regular'},
                ]
            },
        ], // row When

        {
            isHidden: function(m) {return m.when !== 'later'},
            cols: [
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'Date',
                },
                {
                    colClass: 'col-xs-4',
                    el: 'uib-datepicker',
                    name: 'date',
                    format: 'dd/MM/yyyy',
                    formatMonth: 'MMMM',
                    showButtonBar:true,
                },
                {
                    colClass: 'col-xs-8',
                },
                {
                    colClass: 'col-xs-12',
                    el: 'text',
                    text: 'New accounts will automatically be added to your address book.',
                }
            ]

        },

        [
            {
                colClass: 'col-xs-12',
                el: 'checkbox',
                name: 'saveToFavourite',
                text: 'Save this payment to favouirites',
            },
        ], // row saveToFavourite

        
    ]; // rows3
});