$(document).ready(function () {
    //Date picker
    $('#datepicker').datepicker({
        autoclose: true
    })
    Factory.init();
});

Factory = {
    web3Provider: null,
    i: 0,
    arr: [],
    dataType: [],
    types: [],
    contracts: {},
    init: async function() {
        $.getJSON('data/types.json', function(data) {
            Factory.dataType = data;
            var option_html = '';
            data.forEach(function(element) {
                option_html = '<option value="'+element.id+'">'+element.name+'</option>';
                $('[data-add="idType"]').append(option_html);
            });
        });
        return await Factory.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            Factory.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dFactory browsers...
        else if (window.web3) {
            Factory.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            Factory.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Factory.web3Provider);
        return Factory.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Farm.json', function(data) {
            var RegiterDMFarm = data;
            Factory.contracts.DM_Farm = TruffleContract(RegiterDMFarm);
            Factory.contracts.DM_Farm.setProvider(Factory.web3Provider);
        });
        $.getJSON('DM_Factory.json', function(data) {
            var dataFactory = data;
            Factory.contracts.DM_Factory = TruffleContract(dataFactory);
            Factory.contracts.DM_Factory.setProvider(Factory.web3Provider);
            Factory.infoFactory();
            return Factory.bindEvents();
        });
    },

    infoFactory: function() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            Factory.contracts.DM_Factory.deployed().then(function(instance) {
                return instance.getFactoryInfoByAddress(account, {from: account});
            }).then(function(result) {
                if(result[1].c[0]){
                    $('[data-head="name"]').html(web3.toAscii(result[2]));
                    $('[data-head="position"]').html('Nhà Máy');

                    $('span[data-factory="address"]').html(result[4]);
                    $('span[data-factory="name"]').html(App.utf8Decode(web3.toAscii(result[2])));
                    $('span[data-factory="location"]').html(App.utf8Decode(web3.toAscii(result[3])));
                    Factory.getListProduct();
                }else{
                    App.logout();
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    getListProduct: function() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            Factory.contracts.DM_Factory.deployed().then(function(instance) {
                return instance.getListProduct({from: account});
            }).then(function(resultListId) {
                var i = 1;
                var length = resultListId.length;
                resultListId.forEach(function(element) {
                    Factory.contracts.DM_Factory.deployed().then(function(instance) {
                        return instance.getProductInfoFactory(element.c[0], {from: account});
                    }).then(function(result) {
                        if(result[3].c[0]){
                            var typeInfor = Factory.dataType.find(x => x.id === result[4].c[0]);
                            Factory.arr.push(
                                [
                                    element.c[0],
                                    '<span onclick="Factory.getDetailMilk(this);">'+result[2].c[0]+'</span>',
                                    typeInfor.name,
                                    result[1].c[0] + ' ' + typeInfor.quantitative,
                                    App.formatTimeStampToDate(parseInt(web3.toAscii(result[7]))),
                                    App.formatTimeStampToDate(parseInt(web3.toAscii(result[8]))),
                                    result[9],
                                ]
                            );
                        }
                        if(i++ === length) {
                            Factory.setTableProduct(Factory.arr);
                        }
                    }).catch(function(err) {
                        console.log(err.message);
                    });
                    Factory.setTableProduct(Factory.arr);
                })
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    bindEvents: function() {
        $(document).on('click', '#btn-add-product', Factory.addProduct);
    },

    getDetailMilk: function(event) {
        $('#modal-show-milk').modal('show');
    },

    addProduct: function(event) {
        event.preventDefault();
        var timestamp_now = Math.round(+new Date()/1000);
        var timestamp_end = App.getTimeStamp($('[data-add="dateEnd"]').val());
        var obj = {
            idMilk:         $('[data-add="idMilk"]').val(),
            idType:         $('[data-add="idType"]').val(),
            quantity:       $('[data-add="quantity"]').val(),
            dateEnd:        timestamp_end.toString(),
            dateCreate:     timestamp_now.toString(),
            ingredients:    $('[data-add="ingredients"]').val(),
        };

        if(!obj.idMilk){
            alert('Nhập thông tin ID Milk');
            return;
        }
        if(!obj.idType){
            alert('Bạn chưa chọn loại sản phẩm!');
            return;
        }
        if(!obj.quantity){
            alert('Bạn chưa nhập số lượng!');
            return;
        }
        if(isNaN(obj.dateEnd)){
            alert('Bạn chưa chọn ngày hết hạng!');
            return;
        }
        if(!obj.ingredients.trim()){
            alert('Bạn chưa nhập thông tin bổ sung cho sản phẩm!');
            return;
        }

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];

            Factory.contracts.DM_Farm.deployed().then(function(instance) {
                return instance.get_info_milk_farm_with_id_milk(obj.idMilk ,{from: account});
            }).then(function(result) {
                if(result[0] == ""){
                    alert('ID Milk không tồn tại!');
                    return;
                }else{
                    Factory.contracts.DM_Factory.deployed().then(function(instance) {
                        return instance.addProduct(obj.idMilk, obj.idType, obj.ingredients, obj.quantity, obj.dateCreate, obj.dateEnd, {from: account});
                    }).then(function(result) {
                        if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                            alert('Thêm sản phẩm mới thành công!');
                            location.reload();
                        }else{
                            alert('Error! Thêm sản phẩm mới không thành công!');
                        }
                    }).catch(function(err) {
                        console.log(err.message);
                    });
                }
            }).catch(function(err) {
                console.log(err.message);
            });

        });
    },
    setTableProduct: function(data) {
        var table = $('#table-data').DataTable({
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
                    field: 'idProduct',
                    title: 'ID (Id product)'
                }, {
                    field: 'idMilk',
                    title: 'ID (Id đợt sữa)'
                }, {
                    field: 'idType',
                    title: 'Loại Sản Phẩm'
                }, {
                    field: 'quantity',
                    title: 'Số Lượng'
                }, {
                    field: 'dateCreate',
                    title: 'Ngày Sản Xuất'
                }, {
                    field: 'dateEnd',
                    title: 'Ngày Hết Hạng'
                }, {
                    field: 'ingredients',
                    title: 'Thành Phần Bổ Sung'
                }
            ],
            "data": data,
            "fnDrawCallback": function (oSettings) {
            }
        });
        // table.destroy();
    }
};


