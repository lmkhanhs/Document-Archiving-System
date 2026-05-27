package com.datn.dms.emuns;

public enum GenderEnums {
    MALE("Male"),
    FEMALE("Female"),
    OTHER("Other");

    private final String name;

    GenderEnums(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
