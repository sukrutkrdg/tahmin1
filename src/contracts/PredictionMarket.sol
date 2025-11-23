// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // EKLENDI
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PredictionMarket is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20; // EKLENDI

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum Asset { ETH, BTC, XRP }
    enum Direction { ABOVE, BELOW }
    enum TimeInterval { ONE_HOUR, TWENTY_FOUR_HOURS }
    enum TokenType { USDC, USDT }

    struct Prediction {
        address user;
        Asset asset;
        uint256 threshold;
        Direction direction;
        TimeInterval interval;
        TokenType tokenType;
        uint256 amount;
        uint256 timestamp;
        uint256 poolId;
    }

    struct Pool {
        Asset asset;
        uint256 threshold;
        TimeInterval interval;
        TokenType tokenType;
        uint256 timestamp;
        uint256 abovePool;
        uint256 belowPool;
        address[] aboveBettors;
        address[] belowBettors;
        mapping(address => uint256) aboveBets;
        mapping(address => uint256) belowBets;
        bool resolved;
        uint256 finalPrice;
    }

    mapping(uint256 => Pool) public pools;
    mapping(address => Prediction[]) public userPredictions;
    mapping(address => uint256) public userPoints;
    mapping(TokenType => address) public tokenAddresses;
    
    // KRITIK DUZELTME: Döngüden kurtulmak için aktif havuzları tutan mapping
    // Hash(Asset, Threshold, Interval, TokenType) => PoolId
    mapping(bytes32 => uint256) public activePoolIds; 
    
    uint256 public nextPoolId = 1; // 0 rezerve, 1'den başlasın
    uint256 public constant COMMISSION_RATE = 5; 
    uint256 public constant COMMISSION_DENOMINATOR = 100;

    // ... (Eventler aynı kalacak) ...

    constructor(address _usdcAddress, address _usdtAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        tokenAddresses[TokenType.USDC] = _usdcAddress;
        tokenAddresses[TokenType.USDT] = _usdtAddress;
    }

    function createPrediction(
        Asset _asset,
        uint256 _threshold,
        Direction _direction,
        TimeInterval _interval,
        TokenType _tokenType,
        uint256 _amount
    ) external nonReentrant returns (uint256) {
        require(_amount > 0, "Miktar sifirdan buyuk olmali");
        require(_threshold > 0, "Esik degeri gecersiz");

        IERC20 token = IERC20(tokenAddresses[_tokenType]);
        
        // DUZELTME: SafeERC20 kullanımı
        token.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 poolId = _findOrCreatePool(_asset, _threshold, _interval, _tokenType);
        Pool storage pool = pools[poolId];

        if (_direction == Direction.ABOVE) {
            pool.abovePool += _amount;
            if (pool.aboveBets[msg.sender] == 0) {
                pool.aboveBettors.push(msg.sender);
            }
            pool.aboveBets[msg.sender] += _amount;
        } else {
            pool.belowPool += _amount;
            if (pool.belowBets[msg.sender] == 0) {
                pool.belowBettors.push(msg.sender);
            }
            pool.belowBets[msg.sender] += _amount;
        }

        // Prediction kaydı...
        userPredictions[msg.sender].push(Prediction({
            user: msg.sender,
            asset: _asset,
            threshold: _threshold,
            direction: _direction,
            interval: _interval,
            tokenType: _tokenType,
            amount: _amount,
            timestamp: block.timestamp,
            poolId: poolId
        }));

        // Event emit işlemleri...
        return poolId;
    }

    // KRITIK DUZELTME: O(1) Karmaşıklığında Pool Bulma
    function _findOrCreatePool(
        Asset _asset,
        uint256 _threshold,
        TimeInterval _interval,
        TokenType _tokenType
    ) internal returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_asset, _threshold, _interval, _tokenType));
        uint256 existingPoolId = activePoolIds[key];

        // Eğer aktif bir havuz varsa onu döndür
        if (existingPoolId != 0) {
            return existingPoolId;
        }

        // Yoksa yeni oluştur
        uint256 poolId = nextPoolId++;
        Pool storage newPool = pools[poolId];
        newPool.asset = _asset;
        newPool.threshold = _threshold;
        newPool.interval = _interval;
        newPool.tokenType = _tokenType;
        newPool.timestamp = block.timestamp;
        newPool.resolved = false;

        // Aktif havuza kaydet
        activePoolIds[key] = poolId;

        return poolId;
    }

    function resolvePool(uint256 _poolId, uint256 _actualPrice) 
        external 
        onlyRole(ADMIN_ROLE) 
        nonReentrant 
    {
        Pool storage pool = pools[_poolId];
        require(!pool.resolved, "Havuz zaten sonuclandirilmis");
        
        pool.resolved = true;
        pool.finalPrice = _actualPrice;

        // DUZELTME: Havuz çözüldüğü an active listesinden çıkar, böylece aynı parametrelerle yeni havuz açılabilir.
        bytes32 key = keccak256(abi.encodePacked(pool.asset, pool.threshold, pool.interval, pool.tokenType));
        delete activePoolIds[key];

        // ... (Kazanan hesaplama ve SafeTransfer kullanımı ile devam edecek) ...
        // Not: Dağıtım döngüsü hala çok katılımcıda riskli, ama şimdilik SafeERC20 ile güncelleyelim
        
        // Örnek dağıtım kısmı güncellemesi:
        // token.safeTransfer(winner, userShare);
    }
    
    // ... Diğer view fonksiyonları ...
}