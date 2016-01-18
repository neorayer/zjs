'use strict'

var app = angular.module('zjsdemo', [
        'ngResource', 'ui.router', 'ui.bootstrap',
        'ui.select', 'ngSanitize', 'ngCookies', 
        'pascalprecht.translate', 'textAngular',
        'zform']);

app.config(function($translateProvider) {
    $translateProvider.translations('en', {
    });
    $translateProvider.translations('cn', {
        'New' : '全新',
        'Old' : '二手',
        'Youth' : '青年(18-40周岁)',
        'Middle age' : '中年（40-60周岁）',
        'Old age' : '老年（60周岁以上）',
        'Children' : '儿童',
    });

    $translateProvider.preferredLanguage('cn');
});

app.controller('ProductController', function(
                $scope
                , $rootScope
                , $state
                , $interval
                , $timeout
                , VLDT
                )  {

    $scope.formProduct = {
        termOfValid: 7,
    };

    var cols = $scope.cols = {
        newOld: {
            el: 'radio',
            isInline: true,
            name: 'newOld',
            options: [
                {label: 'New', value: 'new'},
                {label: 'Old', value: 'old'},
            ],
            validators: {required: VLDT.required, },
        },
        gotoSellOld: {
            el: 'link',
            text: '发布限制宝贝，请走【卖闲置】建议流程',
            url: 'http://www.google.com',
        },
        template: {
            el: 'ui-select',
            name: 'template',
            optionLabel: 'label',
            options: [
                {label: '现代', value: 'contemporary'},
                {label: '古典', value: 'classical'},
            ],
            validators: {required: VLDT.required, },
        },
        brand: {
            el: 'ui-select',
            name: 'brand',
            options: ['Lv', 'Hemas', 'IBM', 'SkyMiracle', 'OrangeClub'],
            validators: {
                required: VLDT.required,
            },
        },
        meterial: {
            el: 'ui-select',
            name: 'meterial',
            options: ['PU', '二层牛皮', '头层牛皮', '小羊皮', '山羊皮'],
            validators: {required: VLDT.required, },
        },
        suitableFor: {
            el: 'checkboxs',
            isInline: true,
            name: 'suitableFor',
            options: [
                {label: 'Youth', value: 'youth'},
                {label: 'Middle age', value: 'middle-age'},
                {label: 'Old age', value: 'old-age'},
                {label: 'Children', value: 'children'},
            ],
            validators: {required: VLDT.required, },
        },
        title: {
            el: 'input',
            type: 'text',
            name: 'title',
            maxlength: 30,
            validators: {
                required: VLDT.required,
            },
        },
        title_tip: {
            el: 'text',
            text: function(model) {
                var len = model.title ? model.title.length : 0;
                var less = 30 - len;
                return '还能输入' + less + '字';
            }
        },
        subheading: {
            el: 'textarea',
            name: 'subheading',
            maxlength: 150,
            tip: '最多输入150字',
        },
        subheading_tip: {
            el: 'text',
            text: function(model) {
                var len = model.subheading ? model.subheading.length : 0;
                var less = 150 - len;
                return '还能输入' + less + '字';
            }
        },
        buyoutPrice: {
            el: 'input-group',
            input: {
                el: 'input',
                type: 'number',
                name: 'buyoutPrice',
                min: 0.01,
                validators: {required: VLDT.required, },
            },
            right: {
                el: 'text',
                text: '元',
            }
        },
        presaleType: {
            el: 'radio',
            isInline: true,
            name: 'presaleType',
            options: [
                {label: '非预售', value: 'no'},
                {label: '普通预售', value: 'normal'},
                {label: '定时预售', value: 'timer'},
            ],
            validators: {required: VLDT.required, },
        },
        quantity: {
            el: 'input-group',
            input: {
                el: 'input',
                type: 'number',
                name: 'quantity',
                min: 0,
                max: 100000,
                validators: {required: VLDT.required, },
            },
            right: {
                el: 'text',
                text: '件',
            },
        },
        sourceLocType: {
            el: 'radio',
            name: 'sourceLocType',
            options: [
                {label: '国内', tip:'只包括中国大陆各地区', value: 'domestic'},
                {label: '海外及港澳台', value: 'oversea'},
            ],
            validators: {required: VLDT.required, },
        },
        sourceLocArea: {
            el: 'ui-select',
            name: 'sourceLocArea',
            options: CONSTS.countries,
            optionLabel: 'name',
            optionValue: 'name',
        },
        sourceLocStockType: {
            el: 'radio',
            name: 'sourceLocStockType',
            options: [
                {label: '现货，可迅速发货', value: 0},
                {label: '非现货，需采购', value: 1},
            ],
            validators: {required: VLDT.required, },
        },
        barcode: {
            el: 'input',
            type: 'text',
            name: 'barcode',
            tip: '用扫描枪是最便捷的方式',
        },
        barcode_link: {
            el: 'link',
            text:'你家宝贝没条形码？怎样抢扫码新流量！',
            url: 'http://www.yahoo.com',
        },
        pictures: {
            el: 'pics',
            name: 'pictures',
            qiniu: {
                uptoken_url: '/public-qiniu/uptoken',
                domain: 'http://7xp52k.com1.z0.glb.clouddn.com/',
            },
        },
        desc: {
            el: 'text-angular',
            name: 'desc',
        },
        postageTplSelect: {
            el: 'select',
            name: 'postage',
            placeholder: '选择运费模版',
            optionLabel: 'label',
            optionValue: 'value',
            options: [
                {label: '免费快递', value: 0},
                {label: '顺风快递', value: 1},
                {label: '如风达快递', value: 2},
                {label: '申通', value: 3},
            ]
        },
        postageTplCreate: {
            el: 'button',
            text: '新建运费模版',
            btnClass: 'btn-default',
        },
        postageTplTip: {
            el: 'link',
            icon: 'fa fa-info-circle',
            tip: '若无法成功新增运费模板，请您到卖家中心左侧物流工具设置新增运费模板后，再到该页面重新设置新增运费模板即可。',
        },
        submit: {
            el: 'button',
            type: 'submit',
            text: '保存',
        }
    }

    var propRows = [
        ['货号', {el: 'input', type: 'text', name: 'productNo', validators: {required: VLDT.required}}, ''],
        ['品牌 *', cols.brand, ''],
        ['材料', cols.meterial, ''],
        ['适合对象', cols.suitableFor],
    ];

    var sourceLocRows = [
        ['地区/国家', cols.sourceLocArea, ''],
        ['库存类型', cols.sourceLocStockType],
    ];

    $scope.rows1 = [
        ['宝贝类型', cols.newOld, cols.gotoSellOld],
        ['页面模版', cols.template, ''],
        ['宝贝属性', { 
            el: 'rows', 
            colClass: 'col-sm-9 bg-success',
            rows: propRows
        }],
        ['宝贝标题', cols.title,  cols.title_tip],
        ['宝贝卖点', cols.subheading,  cols.subheading_tip],
        ['买断价格', cols.buyoutPrice, ''],
        ['预售设置', cols.presaleType],
        ['宝贝数量', cols.quantity, ''],
        {el: 'row', cols: ['采购地', cols.sourceLocType, '']},
        {
            el: 'row', 
            ngIf: function() {
                return $scope.formProduct.sourceLocType === 'oversea'; 
            },
            cols: ['', {
                colClass: 'col-sm-9 bg-success',
                el: 'rows',
                rows: sourceLocRows,
            }],
        },
        ['商品条形码', cols.barcode, cols.barcode_link],
    ]

    $scope.rows2 = [
        [
            {
                el: 'label',
                text: '运费',
                icon: 'fa fa-ship',
            },
            cols.postageTplSelect, 
            cols.postageTplCreate, 
            cols.postageTplTip,
        ], // row 运费

        [
            '', 
            {
                el: 'html',
                html: '运费模板已进行升级，您的“宝贝所在地”、\
                        “卖家承担运费”等设置需要在运费模板中进行操作，\
                        <a href="">查看详情</a>',
            },
        ], // row html

        [
            '',
            {
                el: 'checkbox',
                name: 'etradeTag',
                text: '电子交易凭证',
            },
            {
                el: 'link',
                text: '申请开通',
                onClick: function(model) {
                    alert('申请开通');
                },
            },
            {
                el: 'link',
                text: '了解详情',
                url: 'http://www.google.com',
                target: '_blank',
            },
            ''
        ], // row 电子交易凭证

        [
            '物流参数',
            {
                colClass: 'col-sm-7 bg-warning',
                el: 'rows',
                rows: [
                    [
                        '物流体积:', 
                        {
                            el: 'input-group',
                            input: { el: 'input', type: 'number', name: 'logiVolume'},
                            right: 'm3',
                        },
                    ],
                    [
                        '物流重量:', 
                        {
                            el: 'input-group',
                            input: { el: 'input', type: 'number', name: 'logiWeight'},
                            right: 'kg',
                        },
                    ],
                ]
            },
            {
                colClass: 'col-sm-2',
            }
        ], // 物流参数
    ]

    $scope.rows3 = [
        [
            '发票',
            {
                el: 'radio', 
                name: 'receipt', 
                isInline: true,
                options:[{label: '无', value: false}, {label: '有', value: true}],
            }
        ],
        [
            '保修',
            {
                el: 'radio',
                name: 'guaantee',
                isInline: true,
                options:[{label: '无', value: false}, {label: '有', value: true}],
            }
        ],
        [
            '退换货承诺',
            {
                el: 'checkbox',
                name: 'refund',
                text: '凡使用支付宝服务付款购买本店商品，若存在质量问题或与描述不符，本店将主动提供退换货服务并承担来回邮费!',
            }
        ],
        [
            '服务保障',
            {
                el: 'checkbox',
                isDisabled: true,
                name: 'service',
                isHtml: true,
                text: '该商品品类须支持“七天退货”服务；承诺更好服务可通过<a href="">交易合约</a>设置',
            },
        ],

    ]

    $scope.rows4 = [
        [
            '库存计数',
            {
                el: 'radio',
                name: 'stockCountWay',
                options: [
                    {label: '拍下减库存', value: 0, tip: '买家拍下商品即减少库存，存在恶拍风险。秒杀、超低价等热销商品，如需避免超卖可选此方式'},
                    {label: '付款减库存', value: 1, tip: '买家拍下并完成付款方减少库存，存在超卖风险。如需减少恶拍、提高回款效率，可选此方式'},
                ]
            }
        ], //库存计数

        [
            '有效期',
            {
                el: 'radio',
                name: 'termOfValid',
                options: [{label: '7天 <b style="color:red">即日起全网一口价有效期统一为7天</b>', value: 7, isHtml: true}],
            }
        ],

        [
            '秒杀功能',
            {
                colClass: 'col-sm-3',
                el: 'checkboxs',
                name: 'secKill',
                isInline: true,
                options: [
                    { label: '电脑用户', value: 'pc'},
                    { label: '手机用户', value: 'mobile'},
                ],
            },
            {
                colClass: 'col-sm-6',
                el: 'text',
                isHtml: true,
                text: '<i class="fa fa-exclamation-circle "></i>勾选后商品将无“购物车”功能，且单次只能购买一件，点此<a href>查看详情</a>',
            }
        ],

        [
            'ztree-select测试',
            {
                colClass: 'col-sm-9',
                el: 'ztree-select',
                name: 'category',

                placeholder: '搜索关键词',
                rootName: '所有分类',
                options: [
                    { _id: '1',            name: 'food'},
                    { _id: '11', pid: '1', name: 'sea food'},
                    { _id: '12', pid: '1', name: 'meat'},
                    { _id: '121', pid: '12', name: 'pork'},
                    { _id: '122', pid: '12', name: 'lamb'},
                    { _id: '1221', pid: '122', name: 'goat lamb'},

                    { _id: '2',            name: 'tools'},
                    { _id: '21', pid: '2', name: 'kitchen tools'},
                    { _id: '22', pid: '2', name: 'garage tools'},
                    { _id: '23', pid: '2', name: 'garden tools'},

                    { _id: '1222', pid: '122', name: 'sheep lamb'},
                    { _id: '123', pid: '12', name: 'beef'},
                    { _id: '124', pid: '12', name: 'chicken'},
                    { _id: '13', pid: '1', name: 'vegitable'},
                ],
            }
        ],
        
    ]

});