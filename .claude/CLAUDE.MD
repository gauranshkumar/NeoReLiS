# Project Overview


## always use bun instead of npm and always refer to the /docs folder for all the context of the app 


This project is complete rewrite of a already exisitng tool called ReLis (https://relis.iro.umontreal.ca/go )

<<current implemented stack>>
## ReLiS (Revue Littéraire Systématique) is a web-based tool for conducting systematic literature reviews and mapping studies README.md:3-5 . The application supports the complete research workflow from protocol development through data extraction to statistical analysis and reporting README.md:11-27 .

## Architecture
### Technology Stack
Backend: PHP 7.4+ with CodeIgniter 3.x MVC framework
Database: MariaDB 11.4 with dynamic schema generation
Frontend: PHP-generated HTML with JavaScript components
Configuration: Custom DSL (.relis files) compiled to PHP
Deployment: Docker containers with docker-compose
Multi-Tenant Architecture
ReLiS implements database-per-project isolation where each research project gets its own dedicated database with dynamically generated schema config.php:315-316 . The system uses an administrative database (relis_db) for user management and project registry, while project databases follow the naming pattern relis_dev_correct_[project_name] config.php:315-316 .

Core Controllers
Project - Project lifecycle management and installation
Screening - Paper review and inclusion/exclusion decisions
Element - Data extraction and classification management
Manager - Assignment and exclusion management
Reporting - Export and statistics functionality

Configuration System
ReLiS uses a domain-specific language approach where projects are defined in .relis files that specify:

Screening criteria and phases
Quality assessment questions
Data classification schemas
Reporting configurations
These configurations are compiled into PHP installation files that drive dynamic database schema generation config.php:313 .

Core Workflows
Screening Process
The screening system supports multiple phases with conflict resolution and inter-rater agreement calculation using Cohen's Kappa Screening.php:2551-2603 .

Quality Assessment
QA assignments and validation are managed through dedicated functions for assignment saving, result recording, and validation functions_helper.php:804-928 .

Data Classification
The classification system supports various category types (Simple, List, DynamicList, Dependent DynamicList) with sub-categories and reference management initial_db.sql:515-557 .

Development Workflow
Branch Strategy
prod - Production branch
prod-testing - Final testing branch
main - Primary development branch
feature-X - Feature branches for individual tasks README.md:119-123
Development Process
Create feature branch from main
Implement changes and update documentation
Create pull request to main triggering CI/CD pipeline
Automated tests verify code integrity
Merge after tests pass and review approval README.md:125-136
Testing
Unit Testing Framework
ReLiS uses CodeIgniter 3's built-in Unit Testing library with cURL-based HTTP testing README.md:30-42 . Test helpers are organized by controller (e.g., screening_ut_helper.php, reporting_ut_helper.php).

CI/CD Pipeline
GitHub Actions workflow automatically runs tests on pull requests to main branch . The pipeline builds Docker containers, executes tests, and blocks merges if tests fail README.md:126-150 .

Deployment
Docker Setup
The application is deployed using Docker Compose with services for:

relis-application - Main PHP app (port 8083)
db - MariaDB database (port 3306)
tomcat - Text editor and APIs (ports 8088, 8089)
phpmyadmin - Database management (port 8080)
bibler - Bibliography processing (port 8000)
Installation Commands
cd deployment/  
docker-compose build  
docker-compose up -d
Access the application at http://localhost:8083 with default credentials: admin/123 README.md:49-59 .

Key Configuration Files
relis_app/config/config.php - Main application configuration including database settings and service URLs config.php:330-336
deployment/docker-compose.yml - Docker service definitions
deployment/db/initial_db.sql - Database initialization and help content
.relis files - Project-specific domain-specific configurations
External Services Integration
ReLiS integrates with external services:

Tomcat Server - Text editor and project APIs (editor_url, tomcat_api_url) config.php:334-335
Bibler Service - Bibliography processing (biblerproxy_url) config.php:336
Important Concepts
Multi-tenancy: Database-per-project isolation with dynamic schema generation
Configuration-driven: Projects defined by DSL files compiled to PHP
Screening phases: Multi-stage review process with conflict resolution
Quality Assessment: Structured evaluation of included papers
Data Classification: Flexible extraction forms with various field types
Inter-rater agreement: Kappa statistics for reviewer consistency
Notes
This documentation covers the core aspects of ReLiS architecture and development. For specific implementation details, refer to the relevant controller files and configuration files mentioned throughout this document. The system is designed to be highly configurable and supports iterative protocol development throughout the review process.

Wiki pages you might want to explore:

ReLiS Overview (geodes-sms/relis)
Project Management (geodes-sms/relis)
CI/CD Pipeline (geodes-sms/relis)