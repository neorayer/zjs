var app = angular.module('zjsdemo', 
    [ 
        'ngResource', 'ui.router', 'ui.bootstrap',
        'ui.select', 'ngSanitize', 'ngCookies',
        'zjs']);




app.controller('DemoZformController', function(
                $scope
                , $rootScope
                , $state
                , $interval
                , $timeout
                )  {
    console.log('controller init');


    $scope.countries = [
        { label: '澳大利亚 +61', shortname: 'au', areacode: '61'},
        { label: '美国 +1',      shortname: 'us', areacode: '1'},
        { label: '日本 +81',     shortname: 'jp', areacode: '81'},
        { label: '韩国 +82',     shortname: 'kr', areacode: '82'},
        { label: '中国香港 +852',shortname: 'hk', areacode: '853'},
        { label: '德国 +49',     shortname: 'de', areacode: '49'},
        { label: '荷兰 +31',     shortname: 'nl', areacode: '31'},
    ];

    //最好初始化
    $scope.formData = {
        modelLabel     : 'label.text will be replaced by model value',
        modelText     : 'text.text will be replaced by model value',
        authway     :'email',
        currency    : 'JPY',
        country     : $scope.countries[0],
        authcode    : '1234', //
        mobile      : '0438271860',
        password    : '111111',
    };
    $scope.formRows = [];

    $scope.formRows.label = [
        {   
            cssCol: 'col-sm-7',
            text: 'label', 
        },
        {
            cssCol: 'col-sm-5',
            type: 'label',
            ngModel: $scope.formData,
            name: 'modelText',
            text: 'label', 
        }
    ]
    $scope.formRows.text = [
        {   
            cssCol: 'col-sm-7',
            type: 'text',
            text: 'text', 
        },
        {
            cssCol: 'col-sm-5',
            type: 'text',
            ngModel: $scope.formData,
            name: 'modelText',
            text: 'text',
        }
    ]
    $scope.formRows.button = [
        {   
            cssCol: 'col-sm-3',
            type: 'button',
            text: 'default button',
            Click: function(done) {
                done();
            }
        },
        {   
            cssCol: 'col-sm-3',
            type: 'button',
            cssBtn: 'btn-success',
            text: 'button style',
            Click: function(done) {
                $scope.formRows.button[1].cssBtn = 'btn-warning btn-lg',
                done();
            }
        },
        {   
            cssCol: 'col-sm-3',
            type: 'button',
            text: 'button waiting',
            doingText: 'I am doing...',  //XXX
            Click: function(done) {
                $timeout(function() {
                    done();
                }, 3000);
            }
        },
        {   
            cssCol: 'col-sm-3',
            type: 'button',
            text: 'button countdown',
            Click: function(done) {
                var COUNT = 5;
                var btnDef = $scope.formRows.button[3];
                var c = COUNT;
                $interval(function(){
                    btnDef.btnText = 'Wait ' + c + ' seconds.';
                    c --;
                }, 1000, COUNT);
                $timeout(function() {
                    btnDef.btnText = btnDef.text;
                    done();
                }, (COUNT + 1) * 1000);
            }
        },
        {
            cssCol: 'col-sm-3',
            type: 'button',
            text: 'disabled button',
            isDisabled: true,
        },
        {
            cssCol: 'col-sm-3',
            type: 'button',
            btnType: 'submit',
            text: 'button[submit]',
            Click: function(done){
                alert('all the inputs of zform will be validated before the Click() is invoked.');
                done();
            }
        },
    ]
    $scope.formRows.dropdownButton = [
        {
            text: 'dropdown-button',
        },
        {
            cssCol: 'col-sm-4',
            type: 'dropdown-button',
            cssBtn: 'btn-success',
            text: 'Search',
            options: [
                {
                    label: 'Search all',
                    range: 'all',
                },
                {
                    label: 'Search this category',
                    range: 'category',
                },
                '-',        //XXX: divider
                {
                    label: 'Advanced Search',
                    range: 'customer',
                }
            ],
            //optionLabel: 'label',         //XXX: the simple way
            optionLabel: function(option) { //XXX: the advanced way
                if (option.label)
                    return option.label.toUpperCase();
                else
                    return '';
            },
            OnSelectItem: function(option) {
                console.log(option);
            }
        },
    ];

    $scope.formRows.input = [
        {
            text: 'input[number]',
        },
        {
            cssCol: 'col-sm-6',
            type: 'input',
            inputType: 'Number',
            class: 'bg-success',
            ngModel: $scope.formData,
            name: 'modelInput',
            placeholder: 'price',
            validators:[
                {
                    msg: 'price should be more than 0',
                    Check: function(v) { return v > 0; },
                }
            ]
        }
    ]


    $scope.formRows.grp_radio1 = [
        {   
            cssCol: 'col-sm-7',
            text: 'radio', 
        },
        {
            cssCol: 'col-sm-5',
            type: 'input-group',
            left: {
                type: 'radio',
                ngModel: $scope.formData,
                name: 'authway',
                options: [
                    {
                        label: 'Email',
                        value: 'email',
                    },
                ]
            },
            input: {
                type: 'input',
                inputType: 'text',
                ngModel: $scope.formData,
                name: 'email',
            },
            right: {
                type: 'button',
                btnType: 'button',
                text: '?',
            }
        }
    ]

    $scope.formRows.grp_radio2 = [
        {   
            cssCol: 'col-sm-7',
            text: 'radio', 
        },
        {
            cssCol: 'col-sm-5',
            type: 'input-group',
            left: {
                type: 'radio',
                ngModel: $scope.formData,
                name: 'authway',
                options: [
                    {
                        label: 'QQ',
                        value: 'qq',
                    },
                ]
            },
            input: {
                type: 'input',
                inputType: 'text',
                ngModel: $scope.formData,
                name: 'qq',
            },
            right: {
                type: 'button',
                btnType: 'button',
                text: '?',
            }
        }
    ]

    $scope.formRows.grp_text = [
        {   
            cssCol: 'col-sm-7',
            text: 'text & text with model', 
        },
        {
            cssCol: 'col-sm-5',
            type: 'input-group',
            left: {
                type: 'text',
                text: 'Price',
            },
            input: {
                type: 'input',
                inputType: 'Number',
                ngModel: $scope.formData,
                name: 'price',
            },
            right: {
                type: 'text',
                text: 'CUR:',
                ngModel: $scope.formData,
                name: 'currency',
            },
        }
    ]

    $scope.formRows['mobile'] = [
        {
            cssCol: 'col-sm-3',
            type: 'label',
            text: '手机',
        },
        {
            cssCol: 'col-sm-4 col-xs-5',
            type: 'select',
            options: $scope.countries,
            optionLabel: 'label',
            placeholder: '国际区号',
            ngModel: $scope.formData,
            name: 'country',
            validators: [
                VALIDATOR_REQUIRE,
            ]
        },
        {
            cssCol: 'col-sm-5 col-xs-7',
            type: 'input',
            inputType: 'text',
            placeholder: '手机号码',
            ngModel: $scope.formData,
            name: 'mobile',
            validators: [
                VALIDATOR_REQUIRE,
                {
                    msg: '手机号格式不正确',
                    Check: function(v) {
                        if (!v) 
                            return true;
                        if (!$scope.formData.country)
                            return true;

                        v = v.trim();
                        switch ($scope.formData.country.shortname) {
                            case 'au':
                                //去除前面的0,可能来自用户误输入
                                if (v.indexOf('04') === 0)
                                    v = v.substring(1);
                                // 4开头
                                if (v.indexOf('4') !== 0)
                                    return false;
                                // 9位数字
                                if (v.length != 9)
                                    return false;
                            break;
                        }
                        return true;
                    }
                }
            ]
        }
    ];

    $scope.formRows['authcode'] = [
        {
            cssCol: 'col-sm-3',
            type: 'label',
            text: '短信验证码',
        },
        {
            cssCol: 'col-sm-6 col-xs-7',
            type: 'input',
            inputType: 'text',
            ngModel: $scope.formData,
            name: 'authcode',
            autocomplete: 'off',
            placeholder: '点右边按键获取验证码',
            validators: [
                {
                    msg: '点右边按键获取验证码',
                    Check: function(v) { 
                        if (!v)
                            return false;
                        if (v.trim().length === 0)
                            return false;
                        return true;
                    }
                }
            ]
        },
        {
            cssCol: 'col-sm-3 col-xs-5',
            type: 'button',
            btnType: 'button',
            cssBtn: 'btn-warning',
            text: '获取',
            relatives: ['country', 'mobile'],
            Click: function(done) {
                done();
            }
        }
    ],

    $scope.formRows['password'] = [
        {
            type: 'label',
            text: '密码',
        },
        {
            cssCol: 'col-sm-9',
            type: 'input',
            inputType: 'password',
            name: 'password',
            ngModel: $scope.formData,
            validators: [
                VALIDATOR_REQUIRE,
                {
                    msg: '包含6~16个字符',
                    Check: function(v) { 
                        if (!v) return true;
                        v = v.trim();
                        var len = v.length;
                        return len >= 6 && len <=16;
                    },
                } 
            ]
        }
    ]

    $scope.formRows['nickname'] = [
        {
            type: 'label',
            text: '微信名',
        },
        {
            cssCol: 'col-sm-5',
            type: 'input',
            inputType: 'text',
            name: 'nickname',
            ngModel: $scope.formData,
            validators: [
                VALIDATOR_REQUIRE,
            ]
        },
        {
            cssCol: 'col-sm-4',
            type: 'checkbox',
            name: 'isChecked',
            text: 'Is Checked',
            ngModel: $scope.formData,
        }
    ]

    $scope.formRows['submit'] = [
        {
            cssCol: 'col-sm-3',
        },
        {
            cssCol: 'col-sm-9',
            type: 'button',
            btnType: 'submit',
            text: '下一步',
            Click: function(done) {
                var d = $scope.formData;
                SignupRS.Save({
                    areacode: d.country.areacode,
                    mobile:   d.mobile,
                    authcode: d.authcode,
                    password: d.password,
                    nickname: d.nickname,
                }).then(function(data){
                    zformErrorsHandle($scope.serverErrors);
                    $scope.GotoSignin({msg:'账户注册成功，现在就登录吧！'});
                }, function(err){
                    zformErrorsHandle($scope.serverErrors, err);
                }).finally(done);
            }
        }
    ];

    $scope.serverErrors = {};




    console.log('controller init end')
});