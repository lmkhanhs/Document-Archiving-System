package com.datn.dms.emuns;

public enum CountryDefaultEnums {
    VIETNAM("Vietnam"),
    UNITED_STATES("United States"),
    JAPAN("Japan"),
    SOUTH_KOREA("South Korea"),
    CHINA("China"),
    UNITED_KINGDOM("United Kingdom"),
    FRANCE("France"),
    GERMANY("Germany"),
    AUSTRALIA("Australia"),
    CANADA("Canada");

    private final String name;

    CountryDefaultEnums(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
