// scripts/test-enhanced-doma-api.js
// Test script for enhanced Doma API integration
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
function testEnhancedDomaAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var domaApiModule, domaApi, token, names, domain, activities, stats, paginatedListings, paginatedOffers, cacheModule, domaCache, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    console.log('🔍 Testing Enhanced Doma API Integration...');
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../src/lib/domaApi.ts'); })];
                case 2:
                    domaApiModule = _k.sent();
                    domaApi = domaApiModule.domaApi;
                    // Test 1: Get a specific token with enhanced data
                    console.log('\n=== Test 1: Enhanced getToken method ===');
                    return [4 /*yield*/, domaApi.getToken('1', true)]; // with caching
                case 3:
                    token = _k.sent() // with caching
                    ;
                    console.log('✅ getToken successful');
                    console.log("   Token ID: ".concat(token === null || token === void 0 ? void 0 : token.tokenId));
                    console.log("   Owner: ".concat(token === null || token === void 0 ? void 0 : token.ownerAddress));
                    console.log("   Name: ".concat((_a = token === null || token === void 0 ? void 0 : token.name) === null || _a === void 0 ? void 0 : _a.name));
                    console.log("   Activities count: ".concat(((_b = token === null || token === void 0 ? void 0 : token.activities) === null || _b === void 0 ? void 0 : _b.length) || 0));
                    // Test 2: Get names with comprehensive filters
                    console.log('\n=== Test 2: Enhanced getNames method ===');
                    return [4 /*yield*/, domaApi.getNames({
                            take: 5,
                            skip: 0,
                            sortOrder: 'DESC'
                        }, true)]; // with caching
                case 4:
                    names = _k.sent() // with caching
                    ;
                    console.log('✅ getNames successful');
                    console.log("   Found ".concat(((_c = names.items) === null || _c === void 0 ? void 0 : _c.length) || 0, " names"));
                    console.log("   Total count: ".concat(names.totalCount));
                    if (names.items && names.items.length > 0) {
                        console.log('   Sample name:', names.items[0].name);
                    }
                    // Test 3: Get domain by name
                    console.log('\n=== Test 3: Enhanced getDomainByName method ===');
                    if (!((_d = token === null || token === void 0 ? void 0 : token.name) === null || _d === void 0 ? void 0 : _d.name)) return [3 /*break*/, 6];
                    return [4 /*yield*/, domaApi.getDomainByName(token.name.name, true)]; // with caching
                case 5:
                    domain = _k.sent() // with caching
                    ;
                    console.log('✅ getDomainByName successful');
                    console.log("   Domain name: ".concat(domain === null || domain === void 0 ? void 0 : domain.name));
                    console.log("   Registrar: ".concat((_e = domain === null || domain === void 0 ? void 0 : domain.registrar) === null || _e === void 0 ? void 0 : _e.name));
                    console.log("   Tokens count: ".concat(((_f = domain === null || domain === void 0 ? void 0 : domain.tokens) === null || _f === void 0 ? void 0 : _f.length) || 0));
                    _k.label = 6;
                case 6:
                    // Test 4: Get domain activities with pagination
                    console.log('\n=== Test 4: Enhanced getDomainActivities method ===');
                    return [4 /*yield*/, domaApi.getDomainActivities('1', undefined, 10, true)]; // with caching
                case 7:
                    activities = _k.sent() // with caching
                    ;
                    console.log('✅ getDomainActivities successful');
                    console.log("   Found ".concat(((_g = activities.items) === null || _g === void 0 ? void 0 : _g.length) || 0, " activities"));
                    console.log("   Total count: ".concat(activities.totalCount));
                    // Test 5: Get domain statistics
                    console.log('\n=== Test 5: New getDomainStatistics method ===');
                    return [4 /*yield*/, domaApi.getDomainStatistics('1', true)]; // with caching
                case 8:
                    stats = _k.sent() // with caching
                    ;
                    console.log('✅ getDomainStatistics successful');
                    console.log("   Domain name: ".concat(stats === null || stats === void 0 ? void 0 : stats.name));
                    console.log("   Active offers: ".concat((stats === null || stats === void 0 ? void 0 : stats.activeOffers) || 0));
                    console.log("   Offers in last 3 days: ".concat((stats === null || stats === void 0 ? void 0 : stats.offersLast3Days) || 0));
                    // Test 6: Get paginated listings
                    console.log('\n=== Test 6: New getPaginatedListings method ===');
                    return [4 /*yield*/, domaApi.getPaginatedListings({
                            take: 5,
                            skip: 0,
                            sortOrder: 'DESC'
                        }, true)]; // with caching
                case 9:
                    paginatedListings = _k.sent() // with caching
                    ;
                    console.log('✅ getPaginatedListings successful');
                    console.log("   Found ".concat(((_h = paginatedListings.items) === null || _h === void 0 ? void 0 : _h.length) || 0, " listings"));
                    console.log("   Total count: ".concat(paginatedListings.totalCount));
                    // Test 7: Get paginated offers
                    console.log('\n=== Test 7: New getPaginatedOffers method ===');
                    return [4 /*yield*/, domaApi.getPaginatedOffers({
                            take: 5,
                            skip: 0,
                            status: 'ACTIVE',
                            sortOrder: 'DESC'
                        }, true)]; // with caching
                case 10:
                    paginatedOffers = _k.sent() // with caching
                    ;
                    console.log('✅ getPaginatedOffers successful');
                    console.log("   Found ".concat(((_j = paginatedOffers.items) === null || _j === void 0 ? void 0 : _j.length) || 0, " offers"));
                    console.log("   Total count: ".concat(paginatedOffers.totalCount));
                    // Test 8: Check cache size
                    console.log('\n=== Test 8: Cache status ===');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../src/lib/cache.ts'); })];
                case 11:
                    cacheModule = _k.sent();
                    domaCache = cacheModule.domaCache;
                    console.log("   Cache size: ".concat(domaCache.size()));
                    console.log('\n🎉 All enhanced Doma API tests completed!');
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _k.sent();
                    console.error('❌ Error testing enhanced Doma API:', error_1.message);
                    console.error('Stack trace:', error_1.stack);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
testEnhancedDomaAPI();
