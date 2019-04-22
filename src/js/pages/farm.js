$(document).ready(function () {
    Farm.init();
});

Farm = {
    web3Provider: null,
    i: 1,
    position: 0,
    arr: [],
    contracts: {},

    init: async function() {
        return await Farm.initWeb3();
    },

    initWeb3: async function() {
    if (window.ethereum) {
      Farm.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dFarm browsers...
    else if (window.web3) {
      Farm.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      Farm.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(Farm.web3Provider);
    return Farm.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Factory.json', function(data) {
          var dataFactory = data;
          Farm.contracts.DM_Factory = TruffleContract(dataFactory);
          Farm.contracts.DM_Factory.setProvider(Farm.web3Provider);
        });
        $.getJSON('DM_Farm.json', function(data) {
          var dataFarm = data;
          Farm.contracts.DM_Farm = TruffleContract(dataFarm);
          Farm.contracts.DM_Farm.setProvider(Farm.web3Provider);
          //[START] [ADD][vinh_khang] -- Farm
          Farm.infoFarm();
          //[END] [ADD][vinh_khang] -- Farm
        });

        return Farm.bindEvents();
    },

//[START] [ADD][vinh_khang] -- Farm
    infoFarm: function() {
        web3.eth.getAccounts(function(error, accounts) {
             if (error) {
                console.log(error);
             }
             var account = accounts[0];
              Farm.contracts.DM_Farm.deployed().then(function(instance) {
                    return instance.getFarm(account, {from: account});

             }).then(function(result) {
                 if (result[1] == "" && result[2] == ""){
                    App.logout();
                 }
                 
                 $('[data-head="name"]').html(result[1]);
                 $('[data-head="position"]').html('Trang Trại');

                 $("#name_farm_info").text(result[1]);
                 $("#location_farm_info").text(result[2]);

             });
             $("#address_farm_info").text(account);
             Farm.contracts.DM_Farm.deployed().then(function(instance) {
                return instance.getListMilk();
             }).then(function(listMilk) {
                console.log(listMilk);
                var j = 0;
                var count = listMilk.length;
                jQuery.each(listMilk,function(i){
                    Farm.contracts.DM_Farm.deployed().then(function(instance) {
                       return instance.get_info_milk_farm_with_id_milk(listMilk[i]);
                    }).then(function(result) {
                       console.log(result);
                       Farm.arr.push(
                           [
                               listMilk[i],
                               result[2],
                               result[4].c[0],
                               App.utf8Decode(web3.toAscii(result[5])),
                               App.formatTimeStampToDate(result[6].c[0]),
                           ]
                       );
                       j++;
                       if (j == count){
                           Farm.setTableUser(Farm.arr);
                       }
                    }).catch(function(err) {
                       console.log(err.message);
                    });
                });

             }).catch(function(err) {
                console.log(err.message);
             });
        });

    },
//[END] [ADD][vinh_khang] -- Farm

    bindEvents: function() {
        $(document).on('change', '#position', Farm.getDataUser);
        $(document).on('click', '#btn-add-milk', Farm.handleAddMilk);
        $(document).on('click', '#btn-add-milk-form', Farm.loadAddMilkForm);
    },

    loadAddMilkForm: function(event) {
        event.preventDefault();
        $("#txt_add_address_farm").val(web3.eth.coinbase);
        web3.eth.getAccounts(function(error, accounts) {
             if (error) {
                console.log(error);
             }
             var account = accounts[0];
             Farm.contracts.DM_Factory.deployed().then(function(instance) {
               return instance.getListFactory();
             }).then(function(listFactory) {
                jQuery.each(listFactory,function(i){
                    Farm.contracts.DM_Factory.deployed().then(function(instance) {
                       return instance.getFactoryInfoByAddress(listFactory[i]);
                     }).then(function(result) {
                        if(result[0].c[0] == 1){
                            var optionElement = '<option value="'+result[4]+'">'+web3.toAscii(result[2])+'</option>';
                            jQuery('#slt_factory').append(optionElement);
                        }
                     }).catch(function(err) {
                       console.log(err.message);
                     });
                });
             }).catch(function(err) {
               console.log(err.message);
             });
        });
    },

    handleAddMilk: function(event) {
        event.preventDefault();

        var objMilk = {
            quantity: $('#txt_add_quantity_milk').val(),
            address_factory: $('#slt_factory').val(),
            cow_name: $('#txt_add_cow_milk').val(),
        };
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
              console.log(error);
            }
            var account = accounts[0];
            Farm.contracts.DM_Farm.deployed().then(function(instance) {
              return instance.addMilk(objMilk.quantity, objMilk.cow_name, objMilk.address_factory,{from: account});
            }).then(function(result) {
              alert("Thêm sữa thành công");
              location.reload();
            }).catch(function(err) {
              console.log(err.message);
            });
        });
    },

    getDataUser: function(event){
        event.preventDefault();

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];

            Farm.contracts.DM_Factory.deployed().then(function(instance) {
                adoptionInstance = instance;
                return adoptionInstance.getFactoryLength();
            }).then(function(result) {
                if(result.s){
                    var idFL = parseInt(result.c[0]);
                    if(idFL > 0){
                        getUser(1);
                    }
                    function getUser(i){
                        Farm.i = i;
                        Farm.contracts.DM_Factory.deployed().then(function(instance) {
                            var adoptionInstance = instance;
                            return adoptionInstance.getFactoryInfoById(parseInt(Farm.i));
                        }).then(function(result) {
                            if(result){
                                var btn_edit = '<button type="button" class="btn btn-primary btn-sm btn-block btn-flat">Sửa</button>';
                                Farm.arr.push(
                                    [
                                        result[1].c[0],
                                        result[4],
                                        web3.fromAscii(result[2]),
                                        web3.fromAscii(result[3]),
                                        result[0].c[0],
                                        btn_edit
                                    ]
                                );
                            }
                            Farm.i++;
                            if(Farm.i < idFL){
                                getUser(Farm.i);
                            }else{
                                Farm.setTableUser(Farm.arr);
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
    },
    setTableUser: function(data) {
        $('#tbl-farm').DataTable({
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
                    title: 'ID'
                }, {
                    field: 'address',
                    title: 'Address Factory'
                }, {
                    field: 'name',
                    title: 'Số lượng'
                }, {
                    field: 'location',
                    title: 'Giống bò'
                }, {
                    field: 'status',
                    title: 'Ngày lấy sữa'
                }],
            "data": data,
            "fnDrawCallback": function (oSettings) {
            }
        });
    }
};


