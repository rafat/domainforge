"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.domaApi = exports.DomaApiClient = void 0;
var cache_1 = require("./cache");
// Get API endpoints from environment variables
var DOMA_SUBGRAPH_URL = process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql';
var DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
var DOMA_API_KEY = process.env.DOMA_API_KEY || 'v1.xxxx';
var DomaApiClient = /** @class */ (function () {
    function DomaApiClient() {
        this.subgraphUrl = DOMA_SUBGRAPH_URL;
        this.apiUrl = DOMA_API_URL;
        this.apiKey = DOMA_API_KEY;
    }
    DomaApiClient.prototype.graphqlRequest = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, variables, useCache, cacheKey) {
            var key, cached, response, result;
            if (variables === void 0) { variables = {}; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = cacheKey || "graphql_".concat(JSON.stringify({ query: query, variables: variables }));
                        // Check cache first if enabled
                        if (useCache) {
                            cached = cache_1.domaCache.get(key);
                            if (cached) {
                                console.log("Cache hit for key: ".concat(key));
                                return [2 /*return*/, cached];
                            }
                        }
                        return [4 /*yield*/, fetch(this.subgraphUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Api-Key': this.apiKey,
                                },
                                body: JSON.stringify({
                                    query: query,
                                    variables: variables
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Subgraph API error: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (result.errors) {
                            throw new Error("GraphQL error: ".concat(JSON.stringify(result.errors)));
                        }
                        // Cache the result if caching is enabled
                        if (useCache) {
                            cache_1.domaCache.set(key, result.data);
                        }
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    DomaApiClient.prototype.restRequest = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options) {
            var url, defaultHeaders, response;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.apiUrl).concat(endpoint);
                        defaultHeaders = {
                            'Content-Type': 'application/json',
                            'Api-Key': this.apiKey
                        };
                        return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { headers: __assign(__assign({}, defaultHeaders), options.headers) }))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("API error: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Domain/Token queries
    DomaApiClient.prototype.getToken = function (tokenId_1) {
        return __awaiter(this, arguments, void 0, function (tokenId, useCache) {
            var query, cacheKey, data;
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetToken($tokenId: String!) {\n        token(tokenId: $tokenId) {\n          tokenId\n          ownerAddress\n          name {\n            name\n            expiresAt\n            registrar {\n              ianaId\n              name\n              websiteUrl\n              supportEmail\n            }\n          }\n          chain {\n            networkId\n            name\n          }\n          createdAt\n          expiresAt\n          type\n          tokenAddress\n          explorerUrl\n          listings {\n            id\n            externalId\n            price\n            offererAddress\n            orderbook\n            currency {\n              name\n              symbol\n              decimals\n            }\n            expiresAt\n            createdAt\n            updatedAt\n          }\n          activities {\n            ... on TokenMintedActivity {\n              type\n              tokenId\n              createdAt\n              owner: to\n              txHash\n              finalized\n            }\n            ... on TokenTransferredActivity {\n              type\n              tokenId\n              createdAt\n              transferredFrom\n              transferredTo\n              txHash\n              finalized\n            }\n            ... on TokenListedActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              startsAt\n              expiresAt\n              seller\n              buyer\n              payment {\n                price\n                tokenAddress\n                currencySymbol\n              }\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenOfferReceivedActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              expiresAt\n              buyer\n              seller\n              payment {\n                price\n                tokenAddress\n                currencySymbol\n              }\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenListingCancelledActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              reason\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenOfferCancelledActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              reason\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenPurchasedActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              purchasedAt\n              seller\n              buyer\n              payment {\n                price\n                tokenAddress\n                currencySymbol\n              }\n              orderbook\n              txHash\n              finalized\n            }\n          }\n        }\n      }\n    ";
                        cacheKey = "token_".concat(tokenId);
                        return [4 /*yield*/, this.graphqlRequest(query, { tokenId: tokenId }, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.token];
                }
            });
        });
    };
    DomaApiClient.prototype.getOffers = function (tokenId_1) {
        return __awaiter(this, arguments, void 0, function (tokenId, status, useCache) {
            var query, cacheKey, data;
            if (status === void 0) { status = 'ACTIVE'; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetOffers($tokenId: String!, $status: OfferStatus) {\n        offers(tokenId: $tokenId, status: $status, sortOrder: DESC) {\n          items {\n            id\n            externalId\n            price\n            offererAddress\n            orderbook\n            currency {\n              name\n              symbol\n              decimals\n            }\n            expiresAt\n            createdAt\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        cacheKey = "offers_".concat(tokenId, "_").concat(status);
                        return [4 /*yield*/, this.graphqlRequest(query, { tokenId: tokenId, status: status }, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.offers || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    DomaApiClient.prototype.getListings = function (tokenId_1) {
        return __awaiter(this, arguments, void 0, function (tokenId, status, useCache) {
            var query, cacheKey, data;
            if (status === void 0) { status = 'ACTIVE'; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetListings($tokenId: String!, $status: OfferStatus) {\n        listings(tokenId: $tokenId, status: $status, sortOrder: DESC) {\n          items {\n            id\n            externalId\n            price\n            offererAddress\n            orderbook\n            currency {\n              name\n              symbol\n              decimals\n            }\n            expiresAt\n            createdAt\n            updatedAt\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        cacheKey = "listings_".concat(tokenId, "_").concat(status);
                        return [4 /*yield*/, this.graphqlRequest(query, { tokenId: tokenId, status: status }, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.listings || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    DomaApiClient.prototype.getNames = function () {
        return __awaiter(this, arguments, void 0, function (filters, useCache) {
            var query, cacheKey, data;
            if (filters === void 0) { filters = {}; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetNames($ownedBy: [AddressCAIP10!], $name: String, $tlds: [String!], $skip: Int, $take: Int, $claimStatus: NamesQueryClaimStatus, $networkIds: [String!], $registrarIanaIds: [Int!], $sortOrder: SortOrderType) {\n        names(ownedBy: $ownedBy, name: $name, tlds: $tlds, skip: $skip, take: $take, claimStatus: $claimStatus, networkIds: $networkIds, registrarIanaIds: $registrarIanaIds, sortOrder: $sortOrder) {\n          items {\n            name\n            expiresAt\n            tokenizedAt\n            eoi\n            registrar {\n              ianaId\n              name\n              websiteUrl\n              supportEmail\n            }\n            nameservers {\n              ldhName\n            }\n            dsKeys {\n              keyTag\n              algorithm\n              digest\n              digestType\n            }\n            transferLock\n            claimedBy\n            tokens {\n              tokenId\n              networkId\n              ownerAddress\n              type\n              startsAt\n              expiresAt\n              explorerUrl\n              tokenAddress\n              createdAt\n              chain {\n                name\n                networkId\n              }\n              listings {\n                id\n                externalId\n                price\n                offererAddress\n                orderbook\n                currency {\n                  name\n                  symbol\n                  decimals\n                }\n                expiresAt\n                createdAt\n                updatedAt\n              }\n              activities {\n                ... on TokenMintedActivity {\n                  type\n                  tokenId\n                  createdAt\n                  owner: to\n                  txHash\n                  finalized\n                }\n                ... on TokenTransferredActivity {\n                  type\n                  tokenId\n                  createdAt\n                  transferredFrom\n                  transferredTo\n                  txHash\n                  finalized\n                }\n                ... on TokenListedActivity {\n                  type\n                  tokenId\n                  createdAt\n                  orderId\n                  startsAt\n                  expiresAt\n                  seller\n                  buyer\n                  payment {\n                    price\n                    tokenAddress\n                    currencySymbol\n                  }\n                  orderbook\n                  txHash\n                  finalized\n                }\n                ... on TokenOfferReceivedActivity {\n                  type\n                  tokenId\n                  createdAt\n                  orderId\n                  expiresAt\n                  buyer\n                  seller\n                  payment {\n                    price\n                    tokenAddress\n                    currencySymbol\n                  }\n                  orderbook\n                  txHash\n                  finalized\n                }\n                ... on TokenListingCancelledActivity {\n                  type\n                  tokenId\n                  createdAt\n                  orderId\n                  reason\n                  orderbook\n                  txHash\n                  finalized\n                }\n                ... on TokenOfferCancelledActivity {\n                  type\n                  tokenId\n                  createdAt\n                  orderId\n                  reason\n                  orderbook\n                  txHash\n                  finalized\n                }\n                ... on TokenPurchasedActivity {\n                  type\n                  tokenId\n                  createdAt\n                  orderId\n                  purchasedAt\n                  seller\n                  buyer\n                  payment {\n                    price\n                    tokenAddress\n                    currencySymbol\n                  }\n                  orderbook\n                  txHash\n                  finalized\n                }\n              }\n            }\n            activities {\n              ... on NameClaimedActivity {\n                type\n                txHash\n                sld\n                tld\n                createdAt\n                claimedBy\n              }\n              ... on NameRenewedActivity {\n                type\n                txHash\n                sld\n                tld\n                createdAt\n                expiresAt\n              }\n              ... on NameDetokenizedActivity {\n                type\n                txHash\n                sld\n                tld\n                createdAt\n                networkId\n              }\n              ... on NameTokenizedActivity {\n                type\n                txHash\n                sld\n                tld\n                createdAt\n                networkId\n              }\n            }\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        cacheKey = "names_".concat(JSON.stringify(filters));
                        return [4 /*yield*/, this.graphqlRequest(query, filters, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.names || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    // Orderbook API methods
    DomaApiClient.prototype.createOffer = function (offerData) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest('/v1/orderbook/offer', {
                                method: 'POST',
                                body: JSON.stringify(offerData)
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Failed to create offer: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.createListing = function (listingData) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest('/v1/orderbook/list', {
                                method: 'POST',
                                body: JSON.stringify(listingData)
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Failed to create listing: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.cancelOffer = function (orderId, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest('/v1/orderbook/offer/cancel', {
                                method: 'POST',
                                body: JSON.stringify({ orderId: orderId, signature: signature })
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Failed to cancel offer: ".concat(error_3.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.cancelListing = function (orderId, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest('/v1/orderbook/listing/cancel', {
                                method: 'POST',
                                body: JSON.stringify({ orderId: orderId, signature: signature })
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Failed to cancel listing: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.getOfferFulfillmentData = function (orderId, fulfiller) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/orderbook/offer/".concat(orderId, "/").concat(fulfiller))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Failed to get offer fulfillment data: ".concat(error_5.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.getListingFulfillmentData = function (orderId, buyer) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/orderbook/listing/".concat(orderId, "/").concat(buyer))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Failed to get listing fulfillment data: ".concat(error_6.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.getOrderbookFees = function (orderbook, chainId, contractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/orderbook/fee/".concat(orderbook, "/").concat(chainId, "/").concat(contractAddress))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Failed to get orderbook fees: ".concat(error_7.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.getSupportedCurrencies = function (chainId, contractAddress, orderbook) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/orderbook/currencies/".concat(chainId, "/").concat(contractAddress, "/").concat(orderbook))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        throw new Error("Failed to get supported currencies: ".concat(error_8.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Poll API methods
    DomaApiClient.prototype.pollEvents = function (eventTypes_1, limit_1) {
        return __awaiter(this, arguments, void 0, function (eventTypes, limit, finalizedOnly, cursor) {
            var params_1, error_9;
            if (finalizedOnly === void 0) { finalizedOnly = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params_1 = new URLSearchParams();
                        if (eventTypes && eventTypes.length > 0) {
                            eventTypes.forEach(function (type) { return params_1.append('eventTypes', type); });
                        }
                        if (limit) {
                            params_1.append('limit', limit.toString());
                        }
                        if (cursor) {
                            params_1.append('cursor', cursor);
                        }
                        params_1.append('finalizedOnly', finalizedOnly.toString());
                        return [4 /*yield*/, this.restRequest("/v1/poll?".concat(params_1.toString()))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_9 = _a.sent();
                        throw new Error("Failed to poll events: ".concat(error_9.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.acknowledgeEvent = function (lastEventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/poll/ack/".concat(lastEventId), {
                                method: 'POST'
                            })
                            // Handle empty responses from the API
                        ];
                    case 1:
                        response = _a.sent();
                        // Handle empty responses from the API
                        return [2 /*return*/, response || { success: true, message: 'Acknowledged' }];
                    case 2:
                        error_10 = _a.sent();
                        // Handle case where API returns empty response
                        if (error_10.message.includes('Unexpected end of JSON input')) {
                            console.warn('Received empty response from acknowledge endpoint, treating as success');
                            return [2 /*return*/, { success: true, message: 'Acknowledged' }];
                        }
                        throw new Error("Failed to acknowledge event: ".concat(error_10.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.resetPolling = function (eventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/poll/reset/".concat(eventId), {
                                method: 'POST'
                            })
                            // Handle empty responses from the API
                        ];
                    case 1:
                        response = _a.sent();
                        // Handle empty responses from the API
                        return [2 /*return*/, response || { success: true, message: 'Reset successful' }];
                    case 2:
                        error_11 = _a.sent();
                        throw new Error("Failed to reset polling: ".concat(error_11.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Enhanced Poll API methods with better typing and error handling
    DomaApiClient.prototype.pollEventsWithTypes = function (eventTypes_1, limit_1) {
        return __awaiter(this, arguments, void 0, function (eventTypes, limit, finalizedOnly, cursor) {
            var params_2, response, error_12;
            if (finalizedOnly === void 0) { finalizedOnly = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params_2 = new URLSearchParams();
                        if (eventTypes && eventTypes.length > 0) {
                            eventTypes.forEach(function (type) { return params_2.append('eventTypes', type); });
                        }
                        if (limit) {
                            params_2.append('limit', limit.toString());
                        }
                        if (cursor) {
                            params_2.append('cursor', cursor);
                        }
                        params_2.append('finalizedOnly', finalizedOnly.toString());
                        return [4 /*yield*/, this.restRequest("/v1/poll?".concat(params_2.toString()))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 2:
                        error_12 = _a.sent();
                        throw new Error("Failed to poll events: ".concat(error_12.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.acknowledgeEventWithResponse = function (lastEventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/poll/ack/".concat(lastEventId), {
                                method: 'POST'
                            })
                            // Handle empty responses from the API
                        ];
                    case 1:
                        response = _a.sent();
                        // Handle empty responses from the API
                        return [2 /*return*/, response || { success: true, message: 'Acknowledged' }];
                    case 2:
                        error_13 = _a.sent();
                        // Handle case where API returns empty response
                        if (error_13.message.includes('Unexpected end of JSON input')) {
                            console.warn('Received empty response from acknowledge endpoint, treating as success');
                            return [2 /*return*/, { success: true, message: 'Acknowledged' }];
                        }
                        throw new Error("Failed to acknowledge event: ".concat(error_13.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DomaApiClient.prototype.resetPollingWithResponse = function (eventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.restRequest("/v1/poll/reset/".concat(eventId), {
                                method: 'POST'
                            })
                            // Handle empty responses from the API
                        ];
                    case 1:
                        response = _a.sent();
                        // Handle empty responses from the API
                        return [2 /*return*/, response || { success: true, message: 'Reset successful' }];
                    case 2:
                        error_14 = _a.sent();
                        // Handle case where API returns empty response
                        if (error_14.message.includes('Unexpected end of JSON input')) {
                            console.warn('Received empty response from reset endpoint, treating as success');
                            return [2 /*return*/, { success: true, message: 'Reset successful' }];
                        }
                        throw new Error("Failed to reset polling: ".concat(error_14.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Additional helper methods
    DomaApiClient.prototype.getDomainByName = function (name_1) {
        return __awaiter(this, arguments, void 0, function (name, useCache) {
            var query, cacheKey, data;
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetDomainByName($name: String!) {\n        name(name: $name) {\n          name\n          expiresAt\n          tokenizedAt\n          eoi\n          registrar {\n            ianaId\n            name\n            websiteUrl\n            supportEmail\n          }\n          nameservers {\n            ldhName\n          }\n          dsKeys {\n            keyTag\n            algorithm\n            digest\n            digestType\n          }\n          transferLock\n          claimedBy\n          tokens {\n            tokenId\n            networkId\n            ownerAddress\n            type\n            startsAt\n            expiresAt\n            explorerUrl\n            tokenAddress\n            createdAt\n            chain {\n              name\n              networkId\n            }\n            listings {\n              id\n              externalId\n              price\n              offererAddress\n              orderbook\n              currency {\n                name\n                symbol\n                decimals\n              }\n              expiresAt\n              createdAt\n              updatedAt\n            }\n            activities {\n              ... on TokenMintedActivity {\n                type\n                tokenId\n                createdAt\n                owner: to\n                txHash\n                finalized\n              }\n              ... on TokenTransferredActivity {\n                type\n                tokenId\n                createdAt\n                transferredFrom\n                transferredTo\n                txHash\n                finalized\n              }\n              ... on TokenListedActivity {\n                type\n                tokenId\n                createdAt\n                orderId\n                startsAt\n                expiresAt\n                seller\n                buyer\n                payment {\n                  price\n                  tokenAddress\n                  currencySymbol\n                }\n                orderbook\n                txHash\n                finalized\n              }\n              ... on TokenOfferReceivedActivity {\n                type\n                tokenId\n                createdAt\n                orderId\n                expiresAt\n                buyer\n                seller\n                payment {\n                  price\n                  tokenAddress\n                  currencySymbol\n                }\n                orderbook\n                txHash\n                finalized\n              }\n              ... on TokenListingCancelledActivity {\n                type\n                tokenId\n                createdAt\n                orderId\n                reason\n                orderbook\n                txHash\n                finalized\n              }\n              ... on TokenOfferCancelledActivity {\n                type\n                tokenId\n                createdAt\n                orderId\n                reason\n                orderbook\n                txHash\n                finalized\n              }\n              ... on TokenPurchasedActivity {\n                type\n                tokenId\n                createdAt\n                orderId\n                purchasedAt\n                seller\n                buyer\n                payment {\n                  price\n                  tokenAddress\n                  currencySymbol\n                }\n                orderbook\n                txHash\n                finalized\n              }\n            }\n          }\n          activities {\n            ... on NameClaimedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              claimedBy\n            }\n            ... on NameRenewedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              expiresAt\n            }\n            ... on NameDetokenizedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              networkId\n            }\n            ... on NameTokenizedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              networkId\n            }\n          }\n        }\n      }\n    ";
                        cacheKey = "domain_".concat(name);
                        return [4 /*yield*/, this.graphqlRequest(query, { name: name }, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.name];
                }
            });
        });
    };
    // New comprehensive method to get domain statistics
    DomaApiClient.prototype.getDomainStatistics = function (tokenId_1) {
        return __awaiter(this, arguments, void 0, function (tokenId, useCache) {
            var query, cacheKey, data;
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetNameStatistics($tokenId: String!) {\n        nameStatistics(tokenId: $tokenId) {\n          name\n          highestOffer {\n            id\n            externalId\n            price\n            offererAddress\n            orderbook\n            currency {\n              name\n              symbol\n              decimals\n            }\n            expiresAt\n            createdAt\n          }\n          activeOffers\n          offersLast3Days\n        }\n      }\n    ";
                        cacheKey = "stats_".concat(tokenId);
                        return [4 /*yield*/, this.graphqlRequest(query, { tokenId: tokenId }, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.nameStatistics];
                }
            });
        });
    };
    // New method to get paginated listings with more filters
    DomaApiClient.prototype.getPaginatedListings = function () {
        return __awaiter(this, arguments, void 0, function (filters, useCache) {
            var query, cacheKey, data;
            if (filters === void 0) { filters = {}; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetPaginatedListings(\n        $skip: Float,\n        $take: Float,\n        $tlds: [String!],\n        $createdSince: DateTime,\n        $sld: String,\n        $networkIds: [String!],\n        $registrarIanaIds: [Int!],\n        $sortOrder: SortOrderType\n      ) {\n        listings(\n          skip: $skip,\n          take: $take,\n          tlds: $tlds,\n          createdSince: $createdSince,\n          sld: $sld,\n          networkIds: $networkIds,\n          registrarIanaIds: $registrarIanaIds,\n          sortOrder: $sortOrder\n        ) {\n          items {\n            id\n            externalId\n            price\n            offererAddress\n            orderbook\n            currency {\n              name\n              symbol\n              decimals\n            }\n            expiresAt\n            createdAt\n            updatedAt\n            name\n            nameExpiresAt\n            registrar {\n              ianaId\n              name\n              websiteUrl\n              supportEmail\n            }\n            tokenId\n            tokenAddress\n            chain {\n              name\n              networkId\n            }\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        cacheKey = "listings_".concat(JSON.stringify(filters));
                        return [4 /*yield*/, this.graphqlRequest(query, filters, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.listings || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    // New method to get paginated offers with more filters
    DomaApiClient.prototype.getPaginatedOffers = function () {
        return __awaiter(this, arguments, void 0, function (filters, useCache) {
            var query, cacheKey, data;
            if (filters === void 0) { filters = {}; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetPaginatedOffers(\n        $tokenId: String,\n        $offeredBy: [AddressCAIP10!],\n        $skip: Float,\n        $take: Float,\n        $status: OfferStatus,\n        $sortOrder: SortOrderType\n      ) {\n        offers(\n          tokenId: $tokenId,\n          offeredBy: $offeredBy,\n          skip: $skip,\n          take: $take,\n          status: $status,\n          sortOrder: $sortOrder\n        ) {\n          items {\n            id\n            externalId\n            price\n            offererAddress\n            orderbook\n            currency {\n              name\n              symbol\n              decimals\n            }\n            expiresAt\n            createdAt\n            name\n            nameExpiresAt\n            registrar {\n              ianaId\n              name\n              websiteUrl\n              supportEmail\n            }\n            tokenId\n            tokenAddress\n            chain {\n              name\n              networkId\n            }\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        cacheKey = "offers_".concat(JSON.stringify(filters));
                        return [4 /*yield*/, this.graphqlRequest(query, filters, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.offers || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    // New method to get name activities with pagination
    DomaApiClient.prototype.getNameActivities = function (name_1) {
        return __awaiter(this, arguments, void 0, function (name, filters, useCache) {
            var query, variables, cacheKey, data;
            if (filters === void 0) { filters = {}; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetNameActivities(\n        $name: String!,\n        $type: NameActivityType,\n        $skip: Float,\n        $take: Float,\n        $sortOrder: SortOrderType\n      ) {\n        nameActivities(\n          name: $name,\n          type: $type,\n          skip: $skip,\n          take: $take,\n          sortOrder: $sortOrder\n        ) {\n          items {\n            ... on NameClaimedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              claimedBy\n            }\n            ... on NameRenewedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              expiresAt\n            }\n            ... on NameDetokenizedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              networkId\n            }\n            ... on NameTokenizedActivity {\n              type\n              txHash\n              sld\n              tld\n              createdAt\n              networkId\n            }\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        variables = __assign({ name: name }, filters);
                        cacheKey = "name_activities_".concat(name, "_").concat(JSON.stringify(filters));
                        return [4 /*yield*/, this.graphqlRequest(query, variables, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.nameActivities || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    DomaApiClient.prototype.getDomainActivities = function (tokenId_1, type_1) {
        return __awaiter(this, arguments, void 0, function (tokenId, type, limit, useCache) {
            var query, cacheKey, data;
            if (limit === void 0) { limit = 50; }
            if (useCache === void 0) { useCache = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      query GetTokenActivities($tokenId: String!, $type: TokenActivityType, $take: Float) {\n        tokenActivities(tokenId: $tokenId, type: $type, take: $take, sortOrder: DESC) {\n          items {\n            ... on TokenMintedActivity {\n              type\n              tokenId\n              createdAt\n              owner: to\n              txHash\n              finalized\n            }\n            ... on TokenTransferredActivity {\n              type\n              tokenId\n              createdAt\n              transferredFrom\n              transferredTo\n              txHash\n              finalized\n            }\n            ... on TokenListedActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              startsAt\n              expiresAt\n              seller\n              buyer\n              payment {\n                price\n                tokenAddress\n                currencySymbol\n              }\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenOfferReceivedActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              expiresAt\n              buyer\n              seller\n              payment {\n                price\n                tokenAddress\n                currencySymbol\n              }\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenListingCancelledActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              reason\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenOfferCancelledActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              reason\n              orderbook\n              txHash\n              finalized\n            }\n            ... on TokenPurchasedActivity {\n              type\n              tokenId\n              createdAt\n              orderId\n              purchasedAt\n              seller\n              buyer\n              payment {\n                price\n                tokenAddress\n                currencySymbol\n              }\n              orderbook\n              txHash\n              finalized\n            }\n          }\n          totalCount\n          pageSize\n          currentPage\n          totalPages\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    ";
                        cacheKey = "activities_".concat(tokenId, "_").concat(type || 'all', "_").concat(limit);
                        return [4 /*yield*/, this.graphqlRequest(query, { tokenId: tokenId, type: type, take: limit }, useCache, cacheKey)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.tokenActivities || { items: [], totalCount: 0 }];
                }
            });
        });
    };
    return DomaApiClient;
}());
exports.DomaApiClient = DomaApiClient;
// Export a singleton instance
exports.domaApi = new DomaApiClient();
