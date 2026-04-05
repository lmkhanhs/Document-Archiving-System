package com.datn.dms.utils;


import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class BaseRedisUtils  {
    private final RedisTemplate<String, Object> redisTemplate;
    private HashOperations<String, String, Object> hashOperations;

    public BaseRedisUtils(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.hashOperations = redisTemplate.opsForHash();
    }
    public void set(String key, String value) {
        this.redisTemplate.opsForValue().set(key, value);
    }

    public void set(String key, Boolean value, Long expireTime, TimeUnit timeUnit) {
        this.redisTemplate.opsForValue().set(key, value, expireTime, timeUnit);
    }

    public void hashSet(String key, String field, Object hashValue) {
        this.hashOperations.put(key, field, hashValue);
    }

    public void setTimetoLive(String key, Long expireTime, TimeUnit timeUnit) {
        this.redisTemplate.expire(key, expireTime, timeUnit);
    }


    public Object getForString(String key) {
        return this.redisTemplate.opsForValue().get(key);
    }

    public void deleteForString(String key) {
        this.redisTemplate.delete(key);
    }

    public Set<String> getKeys(String pattern) {
        return this.redisTemplate.keys(pattern);
    }
}
