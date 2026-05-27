package com.datn.dms.emuns;

public enum GenderEnums {
    MALE("Male", "https://img.icons8.com/color/48/000000/male.png"),
    FEMALE("Female", "https://img.icons8.com/color/48/000000/female.png"),
    OTHER("Other", "https://img.icons8.com/color/48/000000/gender-neutral-user.png");

    private final String name;
    private final String thumbnailUrl;

    GenderEnums(String name, String thumbnailUrl) {
        this.name = name;
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getName() {
        return name;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
}
