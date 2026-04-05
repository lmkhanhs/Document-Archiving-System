package com.datn.dms.emuns;

public enum ColorDefaultEnums {
    RED("Red", "#FF0000"),
    BLUE("Blue", "#0000FF"),
    YELLOW("Yellow", "#FFFF00"),
    WHITE("White", "#FFFFFF"),
    BLACK("Black", "#000000"),
    GRAY("Gray", "#808080"),
    ORANGE("Orange", "#FFA500"),
    PINK("Pink", "#FFC0CB");

    private final String name;
    private final String hexCode;

    ColorDefaultEnums(String name, String hexCode) {
        this.name = name;
        this.hexCode = hexCode;
    }

    public String getName() {
        return name;
    }

    public String getHexCode() {
        return hexCode;
    }
}
