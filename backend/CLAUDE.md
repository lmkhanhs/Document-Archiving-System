# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

- The Spring Boot backend lives in `dms/`; run Maven commands from that directory unless noted otherwise.
- Main package: `com.datn.dms` under `dms/src/main/java/com/datn/dms/`.
- Application entry point: `DmsApplication`, which sets the default timezone to `Asia/Ho_Chi_Minh` before starting Spring.
- Configuration files live in `dms/src/main/resources/`; `application.yml` defines `app.prefix: /api/v1`, MySQL defaults, Redis defaults, upload directory, JWT settings, Google client id, ConvertAPI secret, and AI service base URL.

## Common commands

From `dms/`:

```bash
# Run the app
./mvnw spring-boot:run

# Build the project
./mvnw clean package

# Run all tests
./mvnw test

# Run one test class
./mvnw -Dtest=ColorControllerTest test

# Run one test method
./mvnw -Dtest=ColorControllerTest#createColorReturnsCreated test
```

On Windows `cmd.exe`/PowerShell, use `mvnw.cmd` instead of `./mvnw`:

```bat
mvnw.cmd test
mvnw.cmd -Dtest=ColorControllerTest test
```

There is no separate lint command configured in `pom.xml`.

## Build and dependencies

- Java version: 21.
- Build tool: Maven wrapper in `dms/mvnw` and `dms/mvnw.cmd`.
- Spring Boot parent: 3.5.13.
- Major dependencies:
  - Spring Web / Validation / Data JPA / WebFlux / WebSocket
  - Spring OAuth2 Resource Server for JWT auth
  - MySQL runtime driver
  - Reactive Redis
  - MapStruct 1.6.3 with Lombok binding
  - Google API client and ConvertAPI client
  - Spring Boot Test, Reactor Test, and Spring Security Test for tests

## High-level architecture

This is a layered Spring Boot document management backend:

- `controllers/` exposes REST APIs under `${app.prefix}` (`/api/v1`). API groups include auth, users, files, folders, colors, countries, genders, summaries, admin documents, and admin statistics.
- `services/` contains business logic and orchestrates repositories, filesystem/storage work, Redis active-user state, external services, and DTO mapping.
- `repositories/` contains Spring Data JPA repositories for persistent entities.
- `entities/` contains JPA models, with `BaseEntity` providing common fields.
- `dtos/` is split by feature area into request/response DTOs. API responses are generally wrapped in `ApiResponse<T>` with `code`, `message`, `data`, and `timestamp`.
- `mapper/` contains MapStruct mappers used to convert entities to DTOs.
- `configuations/` contains application configuration. Note the directory/package is intentionally spelled `configuations` in the current codebase.
- `exception/` contains `AppException`, `ErrorCode`, and `GlobalExceptionHandler` for consistent API error responses.
- `utils/` contains helper classes such as authentication and Redis utilities.

## Security model

- `SecurityConfig` disables CSRF, enables CORS for all origins/patterns, configures the OAuth2 resource server, and uses a custom JWT decoder.
- Public routes include `/api/v1/auth/**`, `/uploads/public/**`, summarize WebSocket paths, `POST /api/v1/users`, and public GET routes for genders, countries, and colors.
- Most other routes require authentication.
- Admin-only endpoints use method security with `@PreAuthorize("hasAuthority('ADMIN')")`; method security is enabled with `@EnableMethodSecurity`.
- JWT authorities are used without a prefix because `JwtGrantedAuthoritiesConverter` has `setAuthorityPrefix("")`.

## External services and runtime dependencies

- MySQL is the primary database. Defaults in `application.yml` point to `jdbc:mysql://127.0.0.1/datn` with username `root` and password `123456`, overridable via environment variables.
- Redis defaults to `127.0.0.1:6379`, overridable via environment variables.
- Uploaded files default to the `uploads` directory, controlled by `APP_STORAGE_UPLOAD_DIR`.
- Summary functionality proxies to a Python AI server via `APP_AI_BASE_URL` (default `http://localhost:8000`) and includes WebSocket support.
- ConvertAPI and Google client configuration are read from `application.yml`/environment variables.

## Testing notes

- Existing controller tests use JUnit 5, Mockito, and standalone `MockMvc` setup to unit test controller request/response behavior while mocking services.
- For controller unit tests, prefer constructing the controller directly and mocking its service dependencies when database or Spring context startup is not needed.
- Use `MockMvcBuilders.standaloneSetup(...).addPlaceholderValue("app.prefix", "/api/v1")` when testing controllers whose `@RequestMapping` uses `${app.prefix}`.
- Use `GlobalExceptionHandler` in MockMvc setup when asserting standardized error responses.
- For security-specific tests, use `spring-security-test` helpers such as mock users/JWTs; for pure controller unit tests, keep service dependencies mocked and avoid requiring MySQL/Redis.
