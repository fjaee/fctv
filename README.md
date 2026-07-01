# Data Aggregator Pipeline

A personal automated data aggregation and parsing pipeline.

This repository contains a Python script configured to run via GitHub Actions. It fetches standard JSON data from multiple external endpoints, merges them into a single localized structure, applies custom deduplication logic, and outputs a formatted text payload.

## Architecture

* **Multi-Source Fetching:** Iterates over a predefined list of modular JSON endpoints to prevent single-source failure.
* **Data Normalization:** Maps generic IDs to custom dictionaries located in `logos.json`.
* **State Management:** Uses a local JSON backup and SHA-256 hashing to determine if a material state change occurred before writing to disk, saving compute cycles.
* **Automation:** CI/CD pipeline runs on a scheduled weekly cron job.

*Note: This is a private educational project built for personal infrastructure. Issues and PRs are not monitored.*