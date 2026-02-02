# Comprehensive API Documentation

## Torn API User Profile
- **Endpoint:** /user/profile
- **Description:** Fetches user profile information.
- **Required Fields:** user_id, fields
- **Response Mapping:** user_id → User ID, name → User Name, status → User Status

## Torn API Faction Basic
- **Endpoint:** /faction/basic
- **Description:** Retrieves information about a faction.
- **Required Fields:** faction_id
- **Response Mapping:** faction_id → Faction ID, name → Faction Name, members → Member List

## FF Scouter API Get Stats
- **Endpoint:** /scouter/get_stats
- **Description:** Gets statistics for a specific player or faction.
- **Required Fields:** id
- **Response Mapping:** id → ID, stats → Player Stats

## Google Apps Script Webhook
- **Description:** Used to send data to Google Apps Script.
- **Implementation:** A URL is provided to which data can be sent via POST requests.

## Discord API Slash Command
- **Description:** Allows users to interact with Discord via slash commands.
- **Implementation:** A command format (e.g., /command_name) leads to specific interactions.

## Data Flow Summary
- **Description:** Illustrates the flow of data between APIs and systems.

## API Key Locations
- **Notes:** Ensure API keys are stored securely, not hardcoded.

## Error Handling
- **Description:** Steps and actions to take when an error occurs, including retry strategies.

## Tier Logic
- **Description:** Explanation of the tier system.
- **Logic:** Metrics that define different tiers within the application.

## Respect Calculation
- **Calculations:** 
  - 1.5x for green tier
  - 1x for blue tier

## Required Fields and Mappings
- **User Profile:** user_id, user_name, status
- **Faction:** faction_id, faction_name, members
- **Scouter:** id, stats