$(document).ready(function () {
    View.init();
});

View = {
    web3Provider: null,
    i: 0,
    arr: [],
    dataType: [],
    types: [],
    contracts: {},
    init: async function() {

        return await View.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            View.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dView browsers...
        else if (window.web3) {
            View.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            View.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(View.web3Provider);
        return View.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Farm.json', function(data) {
            var RegiterDM = data;
            View.contracts.DM_Farm = TruffleContract(RegiterDM);
            View.contracts.DM_Farm.setProvider(View.web3Provider);
        });
        $.getJSON('DM_Factory.json', function(data) {
            var RegiterDM = data;
            View.contracts.DM_Factory = TruffleContract(RegiterDM);
            View.contracts.DM_Factory.setProvider(View.web3Provider);
            return View.bindEvents();
        });
    },

    bindEvents: function() {
        $('#bth-chk-idproduct').click(View.getDetail);
    },

    getDetail: function() {
        var idP = $('#chk-idproduct').val();
        if(idP == ""){
            alert('Nhập ID-Product!');
            return;
        }
        View.contracts.DM_Factory.deployed().then(function(instance) {
            return instance.getProductInfoFactory(idP);
        }).then(function(result) {
            if(result[3].c[0] == 0){
                alert('Sản phẩm không tồn tại!');
            }else {
                var productInfo = {
                    fac_status: result[0].c[0],
                    fac_quantity: result[1].c[0],
                    fac_idMilk: result[2].c[0],
                    fac_idFactory: result[3].c[0],
                    fac_idType: result[4].c[0],
                    fac_name: App.utf8Decode(web3.toAscii(result[5])),
                    fac_location: App.utf8Decode(web3.toAscii(result[6])),
                    fac_dateCreate: App.formatTimeStampToDate(parseInt(web3.toAscii(result[7]))),
                    fac_dateEnd: App.formatTimeStampToDate(parseInt(web3.toAscii(result[8]))),
                    fac_ingredients: result[9],
                    fac_address: result[10],
                }

                if(productInfo.fac_idMilk != 0){
                    View.contracts.DM_Farm.deployed().then(function(instance) {
                        return instance.get_info_milk_farm_with_id_milk(productInfo.fac_idMilk);
                    }).then(function(result) {
                        if(result[2] == ""){
                            alert('Sản phẩm không tồn tại!');
                        }else {
                            Object.assign(productInfo, {
                                far_name: result[0],
                                far_location: result[1],
                                far_address: result[2],
                                far_quantity: result[4].c[0],
                                far_nameCows: App.utf8Decode(web3.toAscii(result[5])),
                                far_dateMilk: App.formatTimeStampToDate(result[6].c[0]),
                            });
                            View.showDetailProduct(productInfo);
                        }
                    });
                }
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    showDetailProduct: function(productInfo) {
         $.getJSON('data/types.json', function(dataType) {
             var typeInfor = dataType.find(x => x.id === productInfo.fac_idType);
             if(typeInfor){
                 // Load DB Header
                 $('[data-product="pro_img"]').attr('src', typeInfor.picture);
                 $('[data-product="pro_typeName"]').html(typeInfor.name);
                 $('[data-product="pro_id"]').html('ID-Product: '+$('#chk-idproduct').val());

                 // Load DB Farm Body
                 $('[data-product="far_address"]').html(productInfo.far_address);
                 $('[data-product="far_name"]').html(productInfo.far_name);
                 $('[data-product="far_location"]').html(productInfo.far_location);
                 $('[data-product="far_nameCows"]').html(productInfo.far_nameCows);
                 $('[data-product="far_dateMilk"]').html(productInfo.far_dateMilk);

                 // Load DB Factory Body
                 $('[data-product="fac_address"]').html(productInfo.fac_address);
                 $('[data-product="fac_name"]').html(productInfo.fac_name);
                 $('[data-product="fac_location"]').html(productInfo.fac_location);
                 $('[data-product="fac_dateCreate"]').html(productInfo.fac_dateCreate);
                 $('[data-product="fac_dateEnd"]').html(productInfo.fac_dateEnd);
                 $('[data-product="fac_ingredients"]').html(productInfo.fac_ingredients);

                 // Show Div Infors Product
                 $('#msg-info').hide();
                 $('#div-infos-pro').show();
             }
         });
    }
};


