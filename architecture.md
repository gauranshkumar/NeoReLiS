# ReLiS Architecture (Legacy CodeIgniter Implementation)

## 1. Document scope
This document explains the architecture of the current ReLiS codebase in this repository.

- Repository root: `/Users/shishuranjan/Learn/relis`
- Main app type: PHP monolith on CodeIgniter 3 conventions
- Main application folders:
  - `relis_app/` (application logic)
  - `relis_sys/` (CodeIgniter framework internals)
  - `deployment/` (container runtime)
  - `install/` (installation/update flow pages)
  - `cside/` (assets, vendor frontend libs, export templates)

This is an architecture reference for understanding and maintenance, not a rewrite plan.

## 2. High-level architecture
At runtime, ReLiS is a server-rendered web app with a dynamic, configuration-driven domain model.

- UI: server-rendered PHP views + JS/CSS assets from `cside/`
- App runtime: Apache + PHP container (`relis-application`)
- DB: MariaDB (`db`) with:
  - platform DB (`relis_db`) for users/projects/global config
  - per-project DB(s) (for project-specific screening/QA/classification data)
- External services:
  - `bibler` service for BibTeX/EndNote parsing and conversion
  - `tomcat` + API shim for editor-generated project configuration files

The application is not a strict layered architecture. It behaves as:

1. Request enters controller.
2. Autoloaded libraries/helpers/models are available globally.
3. Session state determines active project DB and permission context.
4. Dynamic entity configuration determines form/list/query behavior.
5. DB operations are mostly executed via generated stored procedures.

## 3. Runtime topology (Docker)
Defined in `deployment/docker-compose.yml`.

### 3.1 Services
- `db` (`mariadb:11.4`)
  - seeds `relis_db` from `deployment/db/initial_db.sql`
- `relis-application` (PHP/Apache)
  - serves app on port `8083`
  - mounts repo at `/u/relis/public_html`
- `phpmyadmin`
  - exposed on `8080`
- `tomcat`
  - editor-related integration and project config listing
  - exposed on `8088` and `8089`
- `bibler`
  - alias `relisbibler` in Docker network

### 3.2 Key environment assumptions
- `index.php` uses `ENV` env variable (`dev`, `testing`, `prod`) to control error mode.
- Config defaults in `relis_app/config/config.php` are container-oriented:
  - `base_url = http://localhost:8083/`
  - `project_db_host = db`
  - `editor_url = http://tomcat:8080/relis/texteditor`
  - `tomcat_api_url = http://tomcat:8181/apis/tomcat`
  - `biblerproxy_url = http://relisbibler:8000/`

## 4. Framework bootstrap and request lifecycle
### 4.1 Front controller bootstrap
- Entry point: `index.php`
- Loads CodeIgniter core from `relis_sys/`
- Resolves app path to `relis_app/`
- Bootstraps CI kernel via `relis_sys/core/CodeIgniter.php`

### 4.2 Routing
- `relis_app/config/routes.php`
  - default controller: `home`
- URL suffix configured as `.html` in `relis_app/config/config.php`

### 4.3 Autoloaded components
`relis_app/config/autoload.php` autoloads critical building blocks globally.

- Libraries: `database`, `session`, `table`, `bm_lib`, `user_lib`, `manager_lib`, `entity_config_lib`, `manage_stored_procedure_lib`, `paper/biblerproxy_lib`, etc.
- Helpers: `url`, `file`, `form`, `bm`, `operations`, `install_project`, etc.
- Models: `DBConnection_mdl`, `Manage_mdl`, `User_dataAccess`, `Paper_dataAccess`, `Project_dataAccess`, `Screening_dataAccess`, etc.

### 4.4 Authentication gate
- Main gate is in `relis_app/libraries/user/User_lib.php` constructor.
- `free_controllers` list in config allows unauthenticated access to selected controllers:
  - `auth`, `api`, `apiquery`, `user`, `unit_test`
- For other controllers, `user_lib` checks `session.user_id` and redirects to `user` if missing.

### 4.5 Session model
Session is central to context switching and authorization.

Important keys:
- `user_id`, `user_username`, `active_language`
- `project_db`, `project_id`, `project_title`, `project_public`
- `working_perspective` (`class`, `screen`, `qa`)
- UI/navigation behavior keys (`after_save_redirect`, `submit_mode`, etc.)

The current project DB is resolved through helper function `project_db()` in `relis_app/helpers/bm_helper.php`.

## 5. Core module map (controllers)
Controllers live in `relis_app/controllers/`.

### 5.1 Public/auth and entry controllers
- `User.php`
  - landing pages, login, demo user bootstrap, account validation and help pages
- `Home.php`
  - dashboard, completion stats, shortcuts into module workflows

### 5.2 Project lifecycle and installation
- `Project.php`
  - list/select/publish projects, create project from uploaded/generated config
- `Install.php`
  - update/reconfigure project from setup files/editor output
  - orchestration of schema/regeneration flows

### 5.3 Domain workflow controllers
- `Paper.php`
  - import/manual add/update/export of papers
- `Screening.php`
  - assignment, phase flows, decisions, conflict management
- `Quality_assessment.php`
  - QA assignment, scoring, validation
- `Data_extraction.php`
  - classification/data extraction assignments and forms
- `Reporting.php`
  - report generation and data export views/outputs

### 5.4 Generic CRUD/meta controllers
- `Element.php`, `Manager.php`, `Manage.php`, `Op.php`, `Config.php`
  - generic entity operations powered by table/entity configuration metadata

### 5.5 API controllers
- `Api.php`
  - protocol/report style JSON outputs (parts marked as not used)
- `Apiquery.php`
  - SQL execution endpoint for query access (`run` method)

### 5.6 Other controllers
- `Admin.php`
  - admin-level actions
- `relis/Manager.php`
  - nested legacy manager controller variant
- `test/Unit_test.php`
  - custom in-app test orchestrator endpoint

## 6. Data access layer
Models are in `relis_app/models/`.

- `DBConnection_mdl.php`
  - generic stored-procedure-based list/detail/save/remove access
  - switches between default DB and active project DB
  - heavy use of `CALL procedure(...)` and `mysqli_next_result(...)`
- `Manage_mdl.php`
  - query execution utility, including generic run-query behavior
- Domain models:
  - `User_dataAccess.php`
  - `Project_dataAccess.php`
  - `Paper_dataAccess.php`
  - `Screening_dataAccess.php`
  - `Data_extraction_dataAccess.php`
  - `Quality_assessment_dataAccess.php`
  - `Reporting_dataAccess.php`

Key characteristic: controllers often call models that call stored procedures, not ORM entities.

## 7. Dynamic configuration engine (core architectural differentiator)
This is the most important architecture concept in ReLiS.

### 7.1 What it does
Project behavior (entities, forms, operations, generated SQL procedures) is not fully hardcoded. It is partially generated and loaded from project configuration artifacts.

### 7.2 Primary components
- `relis_app/libraries/Entity_config_lib.php`
  - resolves table/entity config for built-in and generated entities
- `relis_app/libraries/Entity_configuration_lib.php`
  - install config loading/normalization
- `relis_app/libraries/Manage_stored_procedure_lib.php`
  - generates/recreates CRUD/list/detail/count stored procedures
- `relis_app/helpers/operations_helper.php`
  - operation registry and procedure generation hooks

### 7.3 Configuration sources
- Built-in/common configs from:
  - `relis_app/libraries/entity_config/relis/*.php`
- Generated project-specific config from:
  - `relis_app/libraries/table_config/project/install_config_<project_db>.php`
  - plus editor-generated files fetched via tomcat API path

### 7.4 Runtime effect
The same controller/action patterns can operate on different entity definitions and schemas depending on the active project config loaded from session project DB.

## 8. Database architecture
Two-tier data architecture:

### 8.1 Platform DB (`relis_db`)
Initialized from `deployment/db/initial_db.sql`.

Holds global metadata and identity data:
- users/user groups and memberships
- projects catalog
- admin and platform config
- logs/help/info content

Representative tables:
- `users`, `usergroup`, `userproject`, `projects`
- `config_admin`, `admin_config`, `config`
- `info`, `log`, `str_management`

### 8.2 Project DB (per review project)
Base schema template: `relis_app/libraries/table_config/project/init_sql/project_initial_query.sql`.

Representative objects:
- Tables:
  - `paper`, `assigned`, `classification`, `inclusion`, `exclusion`, `config`, `installation_info`, `ref_tables`
- Views:
  - `view_paper_assigned`, `view_paper_pending`, `view_paper_processed`
- Stored procedures:
  - list/get/count/detail/add/update/remove patterns and module-specific procedures

### 8.3 DB connection strategy
- `relis_app/config/database.php` defines at least:
  - `default` -> platform DB `relis_db`
  - sample project DB group `demo_relis`
- Current project DB key comes from session (`project_db`), then loaded by `load->database(project_db(), TRUE)`.

## 9. Query model and stored procedure dependence
ReLiS relies heavily on SQL procedures as its executable data contract.

Patterns:
- `get_list_<entity>`
- `get_detail_<entity>`
- `remove_<entity>`
- `add_<entity>`
- `update_<entity>`
- `count_<entity>`

Procedure generation points:
- installer/reconfiguration flow (`Install.php`, helper functions)
- management utilities (`Manage_stored_procedure_lib.php`, `operations_helper.php`)

Implication: application correctness depends on both PHP config metadata and generated DB procedure state.

## 10. End-to-end workflow architecture
### 10.1 Authentication and landing
1. User hits `user/login`.
2. `User_dataAccess->check_user_credentials` calls stored procedure with MD5-hashed password.
3. Session is populated with identity + runtime flags.
4. Redirect to `home`.

### 10.2 Project selection
1. `Project/projects_list` resets context to `project_db=default`.
2. User selects project.
3. Session stores active `project_db`, `project_id`, title, perspective.
4. Subsequent model calls switch to that DB.

### 10.3 Project creation / reconfiguration
1. Configuration source from uploaded PHP config or editor-generated file.
2. Install flow parses config and cleans previous installation if override.
3. Creates reference and generated tables.
4. Regenerates stored procedures for relevant entities.
5. Updates project metadata and module flags (screening/qa/class settings).

### 10.4 Paper ingestion
- Paper import supports BibTeX/EndNote/CSV/manual pathways.
- BibTeX parsing delegated through `Biblerproxy_lib` HTTP calls to `bibler` service.

### 10.5 Screening and QA
- Assignment workflows generate assignment rows and operation logs.
- Screening/QA completion and conflicts computed from assignment/decision tables + config flags.
- Validation modes are enabled/disabled by project config values.

### 10.6 Reporting/export
- Reporting module reads from project DB and emits CSV/BibTeX and derived metrics.
- Additional Python/R export template artifacts exist under `cside/`.

## 11. Library package map (`relis_app/libraries`)
Subdirectories indicate module-oriented internal architecture.

- `paper/`: paper/bibtex-specific libraries (`Biblerproxy_lib.php`)
- `screening/`: screening config and management libs
- `quality_assessment/`: QA manager/config libraries
- `data_extraction/`: classification/data extraction libraries
- `project/`: project table/config logic
- `user/`: user and usergroup config/table definitions
- `entity_config/`: static entity configuration declarations
- `table_config/`: generated/static table SQL configs
- `debug/`, `logs/`, `entity_lib/`: support utilities

## 12. Helper architecture
Key helpers in `relis_app/helpers/`:

- `bm_helper.php`
  - broad utility surface: session context, permissions, top messages/buttons, project config reads/writes, language helpers, etc.
- `operations_helper.php`
  - operation registry + generated operation merge from module files
- `install_project_helper.php`
  - installation/update helper logic
- `operations/*.php`
  - operation catalogs by domain module (project/paper/screening/qa/etc.)

Architectural note: helpers contain significant business and authorization logic, not only utility code.

## 13. Views and frontend
- Views in `relis_app/views/` are server-rendered templates.
- Shared layout wrappers:
  - `relis_app/views/shared/body.php`
  - `relis_app/views/shared/h_body.php`
- Domain view groups:
  - `screening/`, `general/`, `project/`, `quality_assessment/`, etc.
- Static frontend assets and vendor libraries are under `cside/`.

## 14. Testing and CI architecture
### 14.1 In-app test orchestrator
- Controller: `relis_app/controllers/test/Unit_test.php`
- Loads many helper-based test suites from `relis_app/helpers/tests/`
- Endpoint:
  - `/test/unit_test/relis_unit_test`
  - `/test/unit_test/relis_unit_test/last_result`

### 14.2 GitHub Actions
Workflow: `.github/workflows/relisUnitTest.yml`

- Builds compose stack from `deployment/`
- Runs test endpoint via HTTP call
- Interprets result token (`successful` / `failed`)

## 15. Security-relevant architecture notes
Current architecture includes legacy risks:

- CSRF protection disabled (`config['csrf_protection'] = FALSE`).
- `Apiquery/run` accepts SQL from query string and executes through model utility.
- Multiple direct SQL concatenations in helpers/models/controllers.
- Password flow uses MD5 hash in credential check call.
- Session-based auth checks are distributed and mostly enforced via autoloaded `user_lib`, not framework middleware.

These are architecture traits, not isolated bugs.

## 16. Configuration reference (core)
From `relis_app/config/config.php`:

- URL and routing behavior:
  - `index_page=''`
  - `url_suffix='.html'`
- session:
  - `sess_driver='files'` (overrides previous `database` line)
  - `sess_save_path='/u/relis/public_html/cside/sessions'`
- app runtime:
  - `rec_per_page=50`
  - `free_controllers=['auth','api','apiquery','user','unit_test']`
- integration endpoints:
  - `editor_url`, `tomcat_api_url`, `biblerproxy_url`
- dynamic project config root:
  - `project_specific_config_folder='relis_app/libraries/table_config/project/'`
- DB naming convention:
  - `project_db_prefix='relis_dev_correct_'`

## 17. Component inventory snapshot
Current file-level inventory in `relis_app/`:

- Controllers: 17 top-level PHP controllers (+ nested `controllers/relis/`, `controllers/test/`)
- Models: 9
- Libraries: 89
- Helpers: 49
- Views: 104

This reflects a broad, feature-rich but tightly coupled monolith.

## 18. Typical failure modes (architectural)
1. Project DB selected in session but missing in `database.php` group map.
2. Generated config and DB stored procedures out of sync.
3. Upgrade/reinstall path partially applies schema/procedure changes.
4. External service dependency (`bibler` or `tomcat`) unavailable.
5. Permission issues on mounted writable folders (`workspace`, sessions, exports).

## 19. Architectural strengths
- Supports multi-project review workflows in one deployment.
- Highly configurable domain behavior for screening/QA/classification.
- Rich feature breadth (import, assignment, validation, reporting, export).
- Containerized local setup for reproducible development/testing.

## 20. Architectural constraints and tradeoffs
- High coupling between controllers/helpers/models and global state.
- Heavy dependence on dynamic SQL/stored-procedure generation.
- Mixed concerns (presentation + business + SQL + integration logic) in same layers.
- Security posture reflects legacy defaults.
- Behavior is difficult to reason about without both PHP config and DB generated artifacts.

## 21. File map for deeper reading
- Entrypoint/bootstrap:
  - `index.php`
  - `relis_app/config/{routes.php,autoload.php,config.php,database.php}`
- Dynamic config and generation:
  - `relis_app/libraries/Entity_config_lib.php`
  - `relis_app/libraries/Manage_stored_procedure_lib.php`
  - `relis_app/helpers/operations_helper.php`
  - `relis_app/libraries/table_config/project/init_sql/project_initial_query.sql`
- Core workflows:
  - `relis_app/controllers/{User.php,Home.php,Project.php,Install.php,Paper.php,Screening.php,Quality_assessment.php,Data_extraction.php,Reporting.php}`
- DB seed:
  - `deployment/db/initial_db.sql`
- Runtime infra:
  - `deployment/docker-compose.yml`
- Tests:
  - `relis_app/controllers/test/Unit_test.php`
  - `.github/workflows/relisUnitTest.yml`


## 22. End-to-end sequence (request-to-db)
Below is the dominant execution sequence for authenticated CRUD/list flows:

1. Browser requests route (for example `element/entity_list/<operation>.html`).
2. `index.php` boots CodeIgniter and resolves controller via `routes.php`.
3. Autoloaded `user_lib` checks authentication unless controller is in `free_controllers`.
4. Controller resolves operation/config metadata (often via `operations_helper.php` and entity config libs).
5. `project_db()` resolves active DB alias from session.
6. Model (`DBConnection_mdl` or domain dataAccess model) invokes stored procedure using `CALL ...`.
7. DB returns result set; model clears next result (`mysqli_next_result`).
8. Controller assembles `data` payload + top buttons + view choice.
9. View is rendered through shared wrapper (`shared/body` or `shared/h_body`).
10. Browser receives server-rendered HTML; JS assets enhance interactions.

## 23. Component dependency map
ASCII map of the dominant dependency direction:

```text
Browser
  -> Apache/PHP (relis-application)
    -> index.php
      -> CodeIgniter core (relis_sys)
        -> Controller (relis_app/controllers/*)
          -> Helpers (bm_helper, operations_helper, ...)
          -> Libraries (user_lib, manager_lib, entity_config_lib, ...)
          -> Models (DBConnection_mdl, *_dataAccess)
            -> MariaDB (default or project DB)
              -> Stored procedures + views + tables

Controller
  -> Biblerproxy_lib -> bibler service (HTTP)
Controller
  -> tomcat_api_url endpoints (HTTP) for editor-generated project configs
```

Critical coupling nodes:
- Session context (`project_db`, `user_id`, `working_perspective`)
- Dynamic entity configuration files
- Generated stored procedures in project databases

