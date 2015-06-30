// example: moduleDir = '/public/kanga/devices/ph/m/'
var StateCreater = function(moduleDir, stateProvider) {
    this.moduleDir = moduleDir;

    // createStates($statePrivider, 'client', 'client')
    // createStates($statePrivider, 'client', 'client.one.address')
    this.createStates = function(moduleName, stateRootName, controllerName, viewName) {
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
            },
            {
                name: stateRootName+ '.cover',
                url: '/cover',
            },
            {
                name: stateRootName+ '.create',
                url: '/create',
            },
            {
                name: stateRootName+ '.list',
                url: '/list?filter&cond',
            },
            {
                name: stateRootName+ '.one',
                url: '/one/:' +  modelName,// +'Id', //TODO 暂时废弃 /:_random', //这个random用来带入随机数,用以强制reload
            },
            {
                name: stateRootName+ '.one.detail',
                url: '/detail',
            },
            {
                name: stateRootName+ '.one.edit',
                url: '/edit',
            },
        ];

        states.forEach(function(state) {
            state.views = {};
            state.views[viewName] = {
                templateUrl: tplBase  + SnakeCase(state.name, '-') + '.html',
                controller:  ctlName,
            };
            stateProvider.state(state);
        })
    }
}

