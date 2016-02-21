
var $stateProvider;
var $location;
var $rootScope;
var $state;
var $httpBackend;

var stateGo = function(name, params) {
    $state.go(name, params);
    $rootScope.$digest();
}

describe('route.js StateCreater', function() {
    var app;
    var sc;
    
   // console.log(module('myApp'))
    beforeEach(function() {
        angular.module('testApp', ['ui.router']).config(function($stateProvider){
            stateProvider = $stateProvider;
            sc = new StateCreater('/ui-user/pc/m/', $stateProvider);
        });

        module('testApp');
        inject(function (_$rootScope_, _$state_, _$httpBackend_, $templateCache ) {
            $rootScope = _$rootScope_;
            $httpBackend  =  _$httpBackend_;
            $state = _$state_;

            $templateCache.put('/ui-user/pc/m/product/product.html', '<div></div>');
            $templateCache.put('/ui-user/pc/m/product/product.list.html', '<div></div>');
            $templateCache.put('/ui-user/pc/m/product/product.cover.html', '<div></div>');
            $templateCache.put('/ui-user/pc/m/product/product.create.html', '<div></div>');
            $templateCache.put('/ui-user/pc/m/product/product.one.html', '<div></div>');
            $templateCache.put('/ui-user/pc/m/product/product.one.detail.html', '<div></div>');
            $templateCache.put('/ui-user/pc/m/product/product.one.edit.html', '<div></div>');
        });

        sc.createStates('product', 'product');
    });

    describe('after createStates()', function(){
        it('should go state: product', function () {
            stateGo('product');
            var current = $state.current;
            expect(current.name).toEqual('product');
            expect(current.url).toEqual('/product');
            expect(current.__ctl).toEqual('ProductController');
        });

        it('should go state: product.cover', function () {
            stateGo('product.cover');
            var current = $state.current;
            expect(current.name).toEqual('product.cover');
            expect(current.url).toEqual('/cover');
            expect(current.__ctl).toBeUndefined();
        });

        it('should go state: product.create', function () {
            stateGo('product.create');
            var current = $state.current;
            expect(current.name).toEqual('product.create');
            expect(current.url).toEqual('/create');
            expect(current.__ctl).toEqual('ProductController');
        });

        it('should go state: product.list', function () {
            stateGo('product.list');
            var current = $state.current;
            expect(current.name).toEqual('product.list');
            expect(current.url).toEqual('/list?filter&cond');
            expect(current.__ctl).toBeUndefined();
        });

        it('should go state: product.one', function () {
            stateGo('product.one', {product: '000003'});
            var current = $state.current;
            expect(current.name).toEqual('product.one');
            expect(current.url).toEqual('/one/:product');
            expect(current.__ctl).toEqual('ProductController');
        });

        it('should go state: product.one.detail', function () {
            stateGo('product.one.detail', {product: '000003'});
            var current = $state.current;
            expect(current.name).toEqual('product.one.detail');
            expect(current.url).toEqual('/detail');
            expect(current.__ctl).toBeUndefined();
        });

        it('should go state: product.one.edit', function () {
            stateGo('product.one.edit', {product: '000003'});
            var current = $state.current;
            expect(current.name).toEqual('product.one.edit');
            expect(current.url).toEqual('/edit?init');
            expect(current.__ctl).toEqual('ProductController');
        });

    })
});
