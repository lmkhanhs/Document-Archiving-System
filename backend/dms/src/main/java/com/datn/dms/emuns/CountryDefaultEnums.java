package com.datn.dms.emuns;

public enum CountryDefaultEnums {
    VIETNAM("Vietnam", "vn"),
    UNITED_STATES("United States", "us"),
    JAPAN("Japan", "jp"),
    SOUTH_KOREA("South Korea", "kr"),
    CHINA("China", "cn"),
    UNITED_KINGDOM("United Kingdom", "gb"),
    FRANCE("France", "fr"),
    GERMANY("Germany", "de"),
    AUSTRALIA("Australia", "au"),
    CANADA("Canada", "ca");

    private final String name;
    private final String countryCode;

    CountryDefaultEnums(String name, String countryCode) {
        this.name = name;
        this.countryCode = countryCode;
    }

    public String getName() {
        return name;
    }

    public String getCountryCode() {
        return countryCode;
    }

    /**
     * Returns the flag image URL from flagcdn.com (256px width PNG).
     */
    public String getFlagUrl() {
        return "https://flagcdn.com/w320/" + countryCode + ".png";
    }
}
