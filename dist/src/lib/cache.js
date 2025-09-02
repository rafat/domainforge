"use strict";
// src/lib/cache.ts
// Simple in-memory cache for Doma API responses
Object.defineProperty(exports, "__esModule", { value: true });
exports.domaCache = void 0;
var SimpleCache = /** @class */ (function () {
    function SimpleCache(defaultTTL) {
        var _this = this;
        this.cache = new Map();
        // Default TTL of 5 minutes
        this.defaultTTL = 5 * 60 * 1000;
        if (defaultTTL) {
            this.defaultTTL = defaultTTL;
        }
        // Periodically clean up expired items
        setInterval(function () {
            _this.cleanup();
        }, 60 * 1000); // Clean up every minute
    }
    SimpleCache.prototype.set = function (key, data, ttl) {
        var expirationTime = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        });
    };
    SimpleCache.prototype.get = function (key) {
        var item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // Check if item has expired
        if (Date.now() > item.timestamp + item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    };
    SimpleCache.prototype.has = function (key) {
        return this.get(key) !== null;
    };
    SimpleCache.prototype.delete = function (key) {
        return this.cache.delete(key);
    };
    SimpleCache.prototype.clear = function () {
        this.cache.clear();
    };
    SimpleCache.prototype.cleanup = function () {
        var now = Date.now();
        for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], item = _b[1];
            if (now > item.timestamp + item.ttl) {
                this.cache.delete(key);
            }
        }
    };
    SimpleCache.prototype.size = function () {
        return this.cache.size;
    };
    return SimpleCache;
}());
// Export a singleton instance
exports.domaCache = new SimpleCache();
