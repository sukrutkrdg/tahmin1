// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PredictionMarket
 * @dev Kripto tahmin bahis sistemi - Base Network için
 * @notice Bu kontrat ETH, BTC ve XRP fiyat tahminleri için kullanılır
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PredictionMarket is AccessControl, ReentrancyGuard {
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

    // State variables
    mapping(uint256 => Pool) public pools;
    mapping(address => Prediction[]) public userPredictions;
    mapping(address => uint256) public userPoints;
    mapping(TokenType => address) public tokenAddresses;
    
    uint256 public nextPoolId;
    uint256 public constant COMMISSION_RATE = 5; // 5%
    uint256 public constant COMMISSION_DENOMINATOR = 100;

    // Events
    event PredictionCreated(
        address indexed user,
        uint256 indexed poolId,
        Asset asset,
        uint256 threshold,
        Direction direction,
        uint256 amount,
        TokenType tokenType
    );

    event PoolResolved(
        uint256 indexed poolId,
        Asset asset,
        uint256 finalPrice,
        uint256 threshold,
        uint256 totalWinnings,
        uint256 commission
    );

    event RewardDistributed(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount,
        TokenType tokenType
    );

    event BalanceUpdated(
        address indexed user,
        TokenType tokenType,
        uint256 newBalance
    );

    constructor(address _usdcAddress, address _usdtAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        tokenAddresses[TokenType.USDC] = _usdcAddress;
        tokenAddresses[TokenType.USDT] = _usdtAddress;
    }

    /**
     * @dev Yeni tahmin oluştur
     */
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

        // Token transferi
        IERC20 token = IERC20(tokenAddresses[_tokenType]);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transferi basarisiz"
        );

        // Pool bul veya oluştur
        uint256 poolId = _findOrCreatePool(
            _asset,
            _threshold,
            _interval,
            _tokenType
        );

        Pool storage pool = pools[poolId];

        // Havuza bahis ekle
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

        // Tahmin kaydet
        Prediction memory prediction = Prediction({
            user: msg.sender,
            asset: _asset,
            threshold: _threshold,
            direction: _direction,
            interval: _interval,
            tokenType: _tokenType,
            amount: _amount,
            timestamp: block.timestamp,
            poolId: poolId
        });

        userPredictions[msg.sender].push(prediction);

        emit PredictionCreated(
            msg.sender,
            poolId,
            _asset,
            _threshold,
            _direction,
            _amount,
            _tokenType
        );

        return poolId;
    }

    /**
     * @dev Havuzu sonuçlandır (sadece admin)
     */
    function resolvePool(uint256 _poolId, uint256 _actualPrice) 
        external 
        onlyRole(ADMIN_ROLE) 
        nonReentrant 
    {
        Pool storage pool = pools[_poolId];
        require(!pool.resolved, "Havuz zaten sonuclandirilmis");
        require(_actualPrice > 0, "Gecersiz fiyat");

        pool.resolved = true;
        pool.finalPrice = _actualPrice;

        bool priceAboveThreshold = _actualPrice > pool.threshold;
        uint256 winningPool = priceAboveThreshold ? pool.abovePool : pool.belowPool;
        uint256 losingPool = priceAboveThreshold ? pool.belowPool : pool.abovePool;
        address[] memory winners = priceAboveThreshold ? pool.aboveBettors : pool.belowBettors;

        // Komisyon hesapla
        uint256 commission = (losingPool * COMMISSION_RATE) / COMMISSION_DENOMINATOR;
        uint256 distributionPool = losingPool - commission;
        uint256 totalWinningPool = winningPool + distributionPool;

        // Kazananlara dağıt
        for (uint256 i = 0; i < winners.length; i++) {
            address winner = winners[i];
            uint256 betAmount = priceAboveThreshold 
                ? pool.aboveBets[winner] 
                : pool.belowBets[winner];

            if (betAmount > 0 && winningPool > 0) {
                uint256 userShare = (betAmount * totalWinningPool) / winningPool;
                
                IERC20 token = IERC20(tokenAddresses[pool.tokenType]);
                require(token.transfer(winner, userShare), "Transfer basarisiz");

                userPoints[winner] += 10;

                emit RewardDistributed(winner, _poolId, userShare, pool.tokenType);
                emit BalanceUpdated(winner, pool.tokenType, token.balanceOf(winner));
            }
        }

        emit PoolResolved(
            _poolId,
            pool.asset,
            _actualPrice,
            pool.threshold,
            totalWinningPool,
            commission
        );
    }

    /**
     * @dev Pool bul veya yeni oluştur
     */
    function _findOrCreatePool(
        Asset _asset,
        uint256 _threshold,
        TimeInterval _interval,
        TokenType _tokenType
    ) internal returns (uint256) {
        // Mevcut aktif pool'ları kontrol et
        for (uint256 i = 0; i < nextPoolId; i++) {
            Pool storage pool = pools[i];
            if (
                !pool.resolved &&
                pool.asset == _asset &&
                pool.threshold == _threshold &&
                pool.interval == _interval &&
                pool.tokenType == _tokenType
            ) {
                return i;
            }
        }

        // Yeni pool oluştur
        uint256 poolId = nextPoolId++;
        Pool storage newPool = pools[poolId];
        newPool.asset = _asset;
        newPool.threshold = _threshold;
        newPool.interval = _interval;
        newPool.tokenType = _tokenType;
        newPool.timestamp = block.timestamp;
        newPool.resolved = false;

        return poolId;
    }

    /**
     * @dev Kullanıcının tahminlerini getir
     */
    function getUserPredictions(address _user) 
        external 
        view 
        returns (Prediction[] memory) 
    {
        return userPredictions[_user];
    }

    /**
     * @dev Pool detaylarını getir
     */
    function getPoolDetails(uint256 _poolId) 
        external 
        view 
        returns (
            Asset asset,
            uint256 threshold,
            uint256 abovePool,
            uint256 belowPool,
            bool resolved,
            uint256 finalPrice
        ) 
    {
        Pool storage pool = pools[_poolId];
        return (
            pool.asset,
            pool.threshold,
            pool.abovePool,
            pool.belowPool,
            pool.resolved,
            pool.finalPrice
        );
    }

    /**
     * @dev Kullanıcının puanını getir
     */
    function getUserPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }

    /**
     * @dev Token adreslerini güncelle (sadece admin)
     */
    function updateTokenAddress(TokenType _tokenType, address _newAddress) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_newAddress != address(0), "Gecersiz adres");
        tokenAddresses[_tokenType] = _newAddress;
    }

    /**
     * @dev Komisyon çek (sadece admin)
     */
    function withdrawCommission(TokenType _tokenType, uint256 _amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        nonReentrant 
    {
        IERC20 token = IERC20(tokenAddresses[_tokenType]);
        require(token.transfer(msg.sender, _amount), "Transfer basarisiz");
    }
}
