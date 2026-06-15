package com.datn.dms.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class DateTimeUtils {

    public static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private DateTimeUtils() {
    }

    public static LocalDate today() {
        return LocalDate.now(VIETNAM_ZONE);
    }

    public static LocalDateTime now() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }
}
