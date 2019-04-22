Store = {
    web3Provider: null,
    contracts: {},
    productType: [],

    init: async function () {
        $.getJSON('data/types.json', function (data) {
            Store.productType = data;
        });

        return await Store.initWeb3();
    },

    initWeb3: async function () {
        if (window.ethereum) {
            Store.web3Provider = window.ethereum;
            try {
                // Request account access
                await
                    window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dStore.browsers...
        else if (window.web3) {
            Store.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            Store.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(Store.web3Provider);

        return Store.initContract();
    },

    initContract: function () {
        $.when(
            // Store Contract
            $.getJSON('DM_Store.json', function (store) {
                Store.contracts.DM_Store = TruffleContract(store);
                Store.contracts.DM_Store.setProvider(Store.web3Provider);
            }),

            // Factory Contract
            $.getJSON('DM_Factory.json', function (factory) {
                Store.contracts.DM_Factory = TruffleContract(factory);
                Store.contracts.DM_Factory.setProvider(Store.web3Provider);
            })
        ).done(function (data1, data2) {
            Store.loadData();
            return Store.bindEvents();
        });
    },

    bindEvents: function () {
        $(document).on('click', '#btn-register', Store.handleAdopt);
    },

    handleAdopt: function (event) {
        event.preventDefault();
    },

    loadData: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];

            var adoptionInstance;

            Store.contracts.DM_Store.deployed().then(function (instance) {
                adoptionInstance = instance;

                return adoptionInstance.getInfoStore(account);
            }).then(function (result) {
                Store.bindData(result, account);
                return adoptionInstance.getListProduct();
            }).then(function (result) {
                var arr = [];

                result.forEach(function (element) {
                    var id = element.c[0];
                    var status = 'Còn';
                    var dateSell;
                    var buttonSell = '<a href="#" title="Bán" onclick="Store.sellProduct(' + id + ')"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a>';

                    // Get product's info form DM_Store Contract
                    Store.contracts.DM_Store.deployed().then(function (instance) {
                        return instance.getInfoProduct(id);
                    }).then(function (result) {
                        if (result[0].c[0] === 1) {
                            status = 'Đã bán';
                            buttonSell = '<span style="color:#ddd"><i class="fa fa-shopping-cart" aria-hidden="true"></i></span>';
                        }
                        dateSell = result[1];
                    });

                    // Get product's info form DM_Factory Contract
                    Store.contracts.DM_Factory.deployed().then(function (instance) {
                        return instance.getProductInfoFactory(id);
                    }).then(function (result) {
                        if (typeof result !== 'undefined') {
                            var productTypeId = result[4].c[0];
                            var typeInfo = Store.productType.find(x => x.id === productTypeId);

                            if (typeof typeInfo !== 'undefined') {
                                arr.push([
                                    id,
                                    buttonSell,
                                    typeInfo.name,
                                    typeInfo.name,
                                    status,
                                    dateSell,
                                ]);
                            }
                        }

                        Store.setTableProduct(arr);
                    });
                })
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    updateData: function () {
        var name = $('#inputStoreName').val();
        var address = $('#inputStoreAddress').val();

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];

            Store.contracts.DM_Store.deployed().then(function (instance) {
                adoptionInstance = instance;

                return adoptionInstance.updateStore(account, name, address);
            }).then(function (result) {
                window.location.reload();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    addProduct: function () {
        var id = $('#productId').val();

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            Store.contracts.DM_Store.deployed().then(function (instance) {
                adoptionInstance = instance;

                return adoptionInstance.addProductToStore(id);
            }).then(function (result) {
                window.location.reload();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    sellProduct: function (id) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var date = App.formatTimeStampToDate(new Date().getTime() / 1000);
            Store.contracts.DM_Store.deployed().then(function (instance) {
                return instance.sellProduct(id, date);
            }).then(function (result) {
                window.location.reload();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    bindData: function (result, account) {
        $('#createdDate').text(App.formatTimeStampToDate(result[2]));
        $('#address').text(account);
        $('#storeName').text(result[0]);
        $('#storeAddress').text(result[1]);

        // Bind data for form
        $('#labelAddress').text(account);
        $('#inputStoreName').val(result[0]);
        $('#inputStoreAddress').val(result[1])
    },

    setTableProduct: function (data) {
        $('#table-data').DataTable({
            "scrollX": true,
            "processing": true,
            "paging": true,
            "lengthChange": true,
            "searching": true,
            "ordering": false,
            "info": false,
            "autoWidth": true,
            "bDestroy": true,
            "columns": [
                {
                    field: 'id',
                    title: 'Mã sản phẩm',
                },
                {
                    field: 'link',
                    title: ''
                },
                {
                    field: 'name',
                    title: 'Tên sản phẩm'
                },
                {
                    field: 'cate',
                    title: 'Loại sản phẩm'
                },
                {
                    field: 'status',
                    title: 'Tình trạng'
                },
                {
                    field: 'dateSell',
                    title: 'Ngày bán'
                }
            ],
            "data": data,
            "fnDrawCallback": function (oSettings) {
            }
        });
    }
};

$(document).ready(function () {
    Store.init();
});
