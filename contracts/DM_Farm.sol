pragma solidity >=0.4.22 <0.6.0;
import "./Migrations.sol";
import "./Core.sol";

contract DM_Farm is Migrations{
    uint16 idF;
    uint16 idM;
    event changeStatus(address _from, bool status);
    Core cr;
    constructor () public{
        cr = new Core();
        idF = 1;
        idM = 1;
    }

    struct Farm {
        uint8 status;
        uint id;
        string name;
        string location;
        bytes32 password;
    }

    struct Milk {               // Thông tin của nguồn sữa
        uint16  id;              // IdMilk = IdFarm + length(Farm.milklist)++
        uint16  quantity;
        bytes32 nameCows;
        address addressFarm;
        address addressFactory;
        uint    dateMilk;
    }

    mapping (address => Farm) addressToFarm;
    mapping (uint16 => address) idToAddressFarm;

    mapping (uint16 => Milk) idMilkToInfo;
    uint16 [] public listMilk;

    modifier onlyFarm() {
        require(isFarm());
        _;
    }

    function isFarm() private view returns(bool){
        if(addressToFarm[msg.sender].id != 0 && addressToFarm[msg.sender].status == 1){
            return true;
        }
        return false;
    }

    function getListMilk() public view returns(uint16 [] memory){
        return listMilk;
    }

    function addFarm(string memory name, string memory location, string memory _password) public{
        if(addressToFarm[msg.sender].id != 0) return;
        addressToFarm[msg.sender] = Farm(0, idF, name, location, keccak256(abi.encodePacked(_password)));
        idToAddressFarm[idF] = msg.sender;
        idF++;
    }

    function getFarms(uint16 _i) public view returns(
        uint,           // id
        string memory,  // name;
        string memory   // location
    ){
        Farm memory fr = addressToFarm[idToAddressFarm[_i]];
        return (fr.id, fr.name, fr.location);
    }

    function getFarmLength() public view returns(uint16){
        return idF;
    }

    function getFarm(address _farm) public view returns(
        uint,
        string memory,
        string memory){
        Farm memory fr = addressToFarm[_farm];
        return (fr.id, fr.name, fr.location);
    }


    function addMilk(uint16 _quantity, string memory _nameCows, address _addressFactory) public onlyFarm{
        uint16 id = idM;
        idMilkToInfo[id] = Milk(id, _quantity, cr.stringToBytes32(_nameCows), msg.sender, _addressFactory, now);
        listMilk.push(idM);
        idM++;
    }



    function get_info_milk_farm_with_id_milk(uint16 _idMilk) public view returns (
        string memory, //name;
        string memory, //location;
        address,       //addressFarm;
        address,       //addressFactory;
        uint16,        //quantity;
        bytes32,       //nameCows;
        uint           // dateMilk;
    ){
        Milk memory _milk = idMilkToInfo[_idMilk];
        Farm memory _farm = addressToFarm[_milk.addressFarm];
        return (_farm.name, _farm.location, _milk.addressFarm, _milk.addressFactory, _milk.quantity, _milk.nameCows, _milk.dateMilk);
    }

    function loginFarm(address _addressFarm, string memory _password) public view returns(
        uint,               // idFarm
        uint8               // status
    ){
        Farm memory _farm = addressToFarm[_addressFarm];
        if(_farm.password == keccak256(abi.encodePacked(_password))){
            return (_farm.id, _farm.status);
        }
    }

    function changeStatusFarm(address _addressFarm, uint8 _status) public restricted{
        if(addressToFarm[_addressFarm].id != 0){
            addressToFarm[_addressFarm].status = _status;
            emit changeStatus(_addressFarm, true);
        }
    }

    function getFarmInfoById(uint16 _i) public view returns(
        uint8,          // status
        uint,           // id
        string memory,  // name;
        string memory,  // location
        address         // addressFarm
    ){
        Farm memory fr = addressToFarm[idToAddressFarm[_i]];
        return (fr.status, fr.id, fr.name, fr.location, idToAddressFarm[_i]);
    }
}