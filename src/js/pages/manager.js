$(document).ready(function () {
    Manager.init();
});

Manager = {
    web3Provider: null,
    i: 1,
    position: 0,
    arr: [],
    contracts: {},

    init: async function() {
        $('[data-head="name"]').html('Admin');
        $('[data-head="position"]').html('Quản Lý');
        return await Manager.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            Manager.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dManager browsers...
        else if (window.web3) {
            Manager.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            Manager.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Manager.web3Provider);
        return Manager.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Farm.json', function(data) {
            var RegiterDM = data;
            Manager.contracts.DM_Farm = TruffleContract(RegiterDM);
            Manager.contracts.DM_Farm.setProvider(Manager.web3Provider);
        });

        $.getJSON('DM_Factory.json', function(data) {
            var RegiterDM = data;
            Manager.contracts.DM_Factory = TruffleContract(RegiterDM);
            Manager.contracts.DM_Factory.setProvider(Manager.web3Provider);
        });

        $.getJSON('DM_Store.json', function(data) {
            var RegiterDM = data;
            Manager.contracts.DM_Store = TruffleContract(RegiterDM);
            Manager.contracts.DM_Store.setProvider(Manager.web3Provider);
            return Manager.bindEvents();
        });
    },

    bindEvents: function() {
        $(document).on('change', '#position', Manager.getDataUser);
        var page = window.localStorage.getItem('page-manager');
        if(page != null){
            $("#position").val(page);
            Manager.getDataUser();
            localStorage.removeItem('page-manager');
        }
    },

    getDataUser: function(){
        Manager.arr = [];
        $("#position option:selected").each(function () {
            if ($(this).val() == 1) {
                $("table#man-farm").show();
                $("table#man-store").hide();
                $("div#man-note").hide();
            } else if ($(this).val() == 2) {
                $("table#man-farm").hide();
                $("table#man-store").hide();
                $("div#man-note").hide();
            } else if ($(this).val() == 3) {
                $("table#man-farm").hide();
                $("table#man-store").show();
                $("div#man-note").hide();
            } else {
                $("table#man-farm").hide();
                $("table#man-store").hide();
                $("div#man-note").show();
            }
        });

        var position = $("#position").val();
        if(position == 1){
            web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.log(error);
                }
                var account = accounts[0];

                Manager.contracts.DM_Farm.deployed().then(function(instance) {
                    factoryInstance = instance;
                    return factoryInstance.getFarmLength();
                }).then(function(result) {
                    if(result.s){
                        var idFL = parseInt(result.c[0]);
                        if(idFL > 0){
                            getUser(1);
                        }
                        function getUser(i){
                            Manager.i = i;
                            Manager.contracts.DM_Farm.deployed().then(function(instance) {
                                var farmInstance = instance;
                                return farmInstance.getFarmInfoById(parseInt(Manager.i));
                            }).then(function(result) {
                                if(result[1].c[0]){
                                    var btn_edit = '';
                                    var lab_status = '';
                                    if(result[0].c[0] == 0){
                                        btn_edit = '<button type="button" onclick="Manager.changeStatusFarm(\''+result[4]+'\', 1)" class="btn btn-primary btn-sm btn-flat">Cho phép hoạt động</button>';
                                        lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-success">Mới đăng ký</span>';
                                    }else if(result[0].c[0] == 1){
                                        btn_edit = '<button type="button" onclick="Manager.changeStatusFarm(\''+result[4]+'\', 2)" class="btn btn-danger btn-sm btn-flat">Cấm hoạt động</button>';
                                        lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-primary">Đang hoạt động</span>';
                                    }else{
                                        btn_edit = '<button type="button" onclick="Manager.changeStatusFarm(\''+result[4]+'\', 1)" class="btn btn-primary btn-sm btn-flat">Cho phép hoạt động lại</button>';
                                        lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-danger">Cấm hoạt động</span>';
                                    }
                                    Manager.arr.push(
                                        [
                                            result[1].c[0],
                                            result[4],
                                            result[2],
                                            result[3],
                                            lab_status,
                                            btn_edit
                                        ]
                                    );
                                }
                                Manager.i++;
                                if(Manager.i < idFL){
                                    getUser(Manager.i);
                                }else{
                                    Manager.setTableUser(Manager.arr);
                                }
                            }).catch(function(err) {
                                console.log(err.message);
                            });
                        }
                    }
                }).catch(function(err) {
                    console.log(err.message);
                });
            });
        }else if(position == 2){
            web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.log(error);
                }
                var account = accounts[0];

                Manager.contracts.DM_Factory.deployed().then(function(instance) {
                    factoryInstance = instance;
                    return factoryInstance.getFactoryLength();
                }).then(function(result) {
                    if(result.s){
                        var idFL = parseInt(result.c[0]);
                        if(idFL > 0){
                            getUser(1);
                        }
                        function getUser(i){
                            Manager.i = i;
                            Manager.contracts.DM_Factory.deployed().then(function(instance) {
                                var factoryInstance = instance;
                                return factoryInstance.getFactoryInfoById(parseInt(Manager.i));
                            }).then(function(result) {
                                if(result[1].c[0]){
                                    var btn_edit = '';
                                    var lab_status = '';
                                    if(result[0].c[0] == 0){
                                        btn_edit = '<button type="button" onclick="Manager.changeStatusFactory(\''+result[4]+'\', 1)" class="btn btn-primary btn-sm btn-flat">Cho phép hoạt động</button>';
                                        lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-success">Mới đăng ký</span>';
                                    }else if(result[0].c[0] == 1){
                                        btn_edit = '<button type="button" onclick="Manager.changeStatusFactory(\''+result[4]+'\', 2)" class="btn btn-danger btn-sm btn-flat">Cấm hoạt động</button>';
                                        lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-primary">Đang hoạt động</span>';
                                    }else{
                                        btn_edit = '<button type="button" onclick="Manager.changeStatusFactory(\''+result[4]+'\', 1)" class="btn btn-primary btn-sm btn-flat">Cho phép hoạt động lại</button>';
                                        lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-danger">Cấm hoạt động</span>';
                                    }
                                    Manager.arr.push(
                                        [
                                            result[1].c[0],
                                            result[4],
                                            App.utf8Decode(web3.toAscii(result[2])),
                                            App.utf8Decode(web3.toAscii(result[3])),
                                            lab_status,
                                            btn_edit
                                        ]
                                    );
                                }
                                Manager.i++;
                                if(Manager.i < idFL){
                                    getUser(Manager.i);
                                }else{
                                    Manager.setTableUser(Manager.arr);
                                }
                            }).catch(function(err) {
                                console.log(err.message);
                            });
                        }
                    }
                }).catch(function(err) {
                    console.log(err.message);
                });
            });
        }else{
            Manager.contracts.DM_Store.deployed().then(function(instance) {
                storeInstance = instance;
                return storeInstance.idS();
            }).then(function(result) {
                if(result.s && result.c[0]){
                    var idS = parseInt(result.c[0]);
                    if(idS > 0){
                        getUser(1);
                    }
                    function getUser(i){
                        Manager.i = i;
                        Manager.contracts.DM_Store.deployed().then(function(instance) {
                            var storeInstance = instance;
                            return storeInstance.getInfoStoreById(parseInt(Manager.i));
                        }).then(function(result) {
                            if(result[1].c[0]){
                                var btn_edit = '';
                                var lab_status = '';
                                if(result[0].c[0] == 0){
                                    btn_edit = '<button type="button" onclick="Manager.changeStatusStore(\''+result[4]+'\', 1)" class="btn btn-primary btn-sm btn-flat">Cho phép hoạt động</button>';
                                    lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-success">Mới đăng ký</span>';
                                }else if(result[0].c[0] == 1){
                                    btn_edit = '<button type="button" onclick="Manager.changeStatusStore(\''+result[4]+'\', 2)" class="btn btn-danger btn-sm btn-flat">Cấm hoạt động</button>';
                                    lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-primary">Đang hoạt động</span>';
                                }else{
                                    btn_edit = '<button type="button" onclick="Manager.changeStatusStore(\''+result[4]+'\', 1)" class="btn btn-primary btn-sm btn-flat">Cho phép hoạt động lại</button>';
                                    lab_status = '<span id="status-'+result[4].substring(0, 10)+'" class="label label-danger">Cấm hoạt động</span>';
                                }
                                Manager.arr.push(
                                    [
                                        result[1].c[0],
                                        result[4],
                                        App.utf8Decode(web3.toAscii(result[2])),
                                        App.utf8Decode(web3.toAscii(result[3])),
                                        lab_status,
                                        btn_edit
                                    ]
                                );
                            }
                            Manager.i++;
                            if(Manager.i < idS){
                                getUser(Manager.i);
                            }else{
                                Manager.setTableUser(Manager.arr);
                            }
                        }).catch(function(err) {
                            console.log(err.message);
                        });
                    }
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        }
    },
    setTableUser: function(data) {
        $('#table-data').html('');
        var table = $('#table-data').DataTable({
            "scrollX": true,
            "processing": true,
            "paging": true,
            "lengthChange": true,
            "searching": true,
            "ordering": false,
            "order": [0, 'asc'],
            "info": false,
            "autoWidth": true,
            "bDestroy": true,
            "columns": [
                {
                    field: 'id',
                    title: 'ID'
                }, {
                    field: 'address',
                    title: 'Address'
                }, {
                    field: 'name',
                    title: 'Tên'
                }, {
                    field: 'location',
                    title: 'Địa Chỉ'
                }, {
                    field: 'status',
                    title: 'Trạng Thái'
                }, {
                    field: 'edit',
                    title: 'Sửa'
                }],
            "data": data
        });
    },
    changeStatusFarm: function(address, status) {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            Manager.contracts.DM_Farm.deployed().then(function(instance) {
                farmInstance = instance;
                return farmInstance.changeStatusFarm(address, status, {from: account});
            }).then(function(result) {
                if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                    var event = factoryInstance.changeStatus(function(error, result) {
                        if (error) return;
                        if(args = result['args']){
                            window.localStorage.setItem('page-manager', 1);
                            alert('Thay đổi thành công!');
                            location.reload();
                        }else{
                            alert('Address không có quyền thay đổi dữ liệu!');
                        }
                    })
                }else{
                    alert('Đã xảy ra lỗi!');
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },
    changeStatusFactory: function(address, status) {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            Manager.contracts.DM_Factory.deployed().then(function(instance) {
                factoryInstance = instance;
                return factoryInstance.changeStatusFactory(address, status, {from: account});
            }).then(function(result) {
                if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                    var event = factoryInstance.changeStatus(function(error, result) {
                        if (error) return;
                        if(args = result['args']){
                            window.localStorage.setItem('page-manager', 2);
                            alert('Thay đổi thành công!');
                            location.reload();
                        }else{
                            alert('Address không có quyền thay đổi dữ liệu!');
                        }
                    })
                }else{
                    alert('Đã xảy ra lỗi!');
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    changeStatusStore: function(address, status) {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            Manager.contracts.DM_Store.deployed().then(function(instance) {
                storeInstance = instance;
                return storeInstance.changeStatusStore(address, status, {from: account});
            }).then(function(result) {
                if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                    var event = storeInstance.changeStatus(function(error, result) {
                        if (error) return;
                        if(args = result['args']){
                            window.localStorage.setItem('page-manager', 3);
                            alert('Thay đổi thành công!');
                            location.reload();
                        }else{
                            alert('Address không có quyền thay đổi dữ liệu!');
                        }
                    })
                }else{
                    alert('Đã xảy ra lỗi!');
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },
};