/**
 * StateCreater() specifies a set of convention to define routes in Angular 1.x.
 * It depends on 'angular-ui/ui.router'.
 */

/**
 * StateCreater class
 *
 *
 * examples: 
 *  app.config(function($stateProvider){
 *      var sc = new StateCreater('/ui-user/pc/m/', $stateProvider);
 *
 *      sc.createStates('home', 'home');
 *      sc.createStates('dashboard', 'dashboard');
 *      sc.createStates('product', 'product', null, null, globalResolve);
 *      sc.createStates('product', 'product.category');
 *      sc.createStates('product', 'product.one.editwb');
 *  }
 * 
 * Each createState() will create 7 states of a module, they can cover most all the states of business logic.
 */
var StateCreater = function(moduleDir, stateProvider) {
    this.moduleDir = moduleDir;

    // examples:
    //     sc.createStates('home', 'home');
    //     sc.createStates('dashboard', 'dashboard');
    //     sc.createStates('product', 'product', null, null, globalResolve);
    //     sc.createStates('product', 'product.category');
    //     sc.createStates('product', 'product.one.editwb');
    //     sc.createStates('product', 'product.one.price');
    //     sc.createStates('product', 'product.one.picture');
    //     sc.createStates('product', 'product.one.document');
    //     sc.createStates('product', 'product.one.supplier');
    //     sc.createStates('supplier', 'supplier', null, null, globalResolve);
    //     sc.createStates('supplier', 'supplier.one.supProduct');
    //     sc.createStates('user', 'user');
    //     sc.createStates('client', 'client');
    //     sc.createStates('client', 'client.one.oppt');
    //     sc.createStates('client', 'client.one.contact');
    this.createStates = function(moduleName, stateRootName, controllerName, viewName, resolve) {
        // 缺省参数填补
        if (!controllerName)
            controllerName = stateRootName;
        if (!viewName)
            viewName = '';

        // controller
        //      ClientController
        //      ClientAddressController
        function getCtlName(stateRootName) {
            var name = '';
            var words = stateRootName.split('.');
            words.forEach(function(w){
                name += CapitalFirst(w);
            })
            name += 'Controller';
            return name;
        }

        // client => chient
        // client.one.address => address
        function getModelName(stateRootName) {
            var words = stateRootName.split('.');
            return words[words.length - 1];
        }

        var tplBase = moduleDir + SnakeCase(moduleName, '-') + '/';
        var ctlName = getCtlName(controllerName);
        var modelName = getModelName(stateRootName);

        var states = [
            {
                name: stateRootName,
                url: '/' + getModelName(stateRootName),
                resolve: resolve,
                __ctl:  ctlName,
             },
            {
                name: stateRootName+ '.cover',
                url: '/cover',
            },
            {
                name: stateRootName+ '.create',
                url: '/create',
                __ctl:  ctlName,
            },
            {
                name: stateRootName+ '.list',
                url: '/list?filter&cond',
            },
            {
                name: stateRootName+ '.one',
                url: '/one/:' +  modelName,// +'Id', //TODO 暂时废弃 /:_random', //这个random用来带入随机数,用以强制reload
                __ctl:  ctlName,
            },
            {
                name: stateRootName+ '.one.detail',
                url: '/detail',
            },
            {
                name: stateRootName+ '.one.edit',
                url: '/edit?init',
                __ctl:  ctlName,
            },
        ];

        states.forEach(function(state) {
            state.views = {};
            state.views[viewName] = {
                templateUrl: tplBase  + SnakeCase(state.name, '-') + '.html',
                controller:  ctlName,
                //这里始终有问题的
                //controller: state.__ctl,
            };

            //这里有BUG,暂时屏蔽
            // if (state.name === stateRootName) {
            //     state.views[viewName].controller = ctlName;
            // };
            // 注：这里非常非常矛盾啊。如果每个view 用一个Controller，则同一个controller要运行很多次。
            // 否则$scope $state又会有问题

            stateProvider.state(state);
        })
    }
}

