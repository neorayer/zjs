// model 'cart' must be defined. ( CartRS )

app.provider('CartServ', function(){
    this.$get = function($rootScope, $state, $cookieStore , CartRS, $timeout, $q, Cache, Dialogs) {
        var CreateCart = function() {
            return CartRS.Save({_id: 'new'}).then(function(cart) {
                $rootScope._cart = cart;
                $cookieStore.put('CartId', cart._id);
            });
        }

        var TryLoadCart = function() {
            cartId = $cookieStore.get('CartId');
            if (!cartId)
                return false;
            return CartRS.Read(cartId, true).then(function(cart) {
                if (!cart)
                    return false;
                $rootScope._cart = cart;
                return true;
            });
        }

        var SaveCart = function() {
            return CartRS.Save($rootScope._cart).catch(function(err){
                console.error(err.stack);
            })
        }

        var cartItems = [];

        return {
            Init: function() {
                
                $q.when().then(TryLoadCart)
                .then(function(isLoaded){
                    if (!isLoaded)
                        return CreateCart();
                }).then(function(){
                    if (!$rootScope._cart.items)
                        $rootScope._cart.items = [];
                    cartItems = $rootScope._cart.items;
                }, function(err) {
                    console.error('CartServ Error', err.stack);
                });                
            },
            /** item {
                    data: object,
                    id: String,
                    quantity: Number,
                    unitPrice: Number,
                }
            */
            AddItem: function(newItem) {
                for (var i = 0; i< cartItems.length; i++) {
                    var item = cartItems[i];
                    if (item.id === newItem.id) {
                        item.quantity += newItem.quantity;
                        return;
                    }
                }
                cartItems.push(newItem);
                SaveCart();
            },

            DeleteItem: function(item) {
                cartItems.Delete(item);
                SaveCart();
            },

            ItemsCount: function() {
                var count = 0;
                cartItems.forEach(function(item){
                    count += item.quantity;
                })
                return count;
            },

            Items: function() {
                return cartItems;

            },

            TotalPrice: function() {
                var total = 0;
                cartItems.forEach(function(item){
                    total += item.quantity * item.unitPrice;
                })
                return total;
            },

            IncQuantity: function(item, n) {
                var res = item.quantity + n;
                if (res <= 1)
                    item.quantity = 1;
                else
                    item.quantity = res;
                SaveCart();
            },
        }
    };
});

app.run(function($rootScope, CartServ){
    $rootScope.CartServ = CartServ;
});
