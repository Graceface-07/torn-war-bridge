# API Cheatsheet

## Torn API
### Endpoints
- **GET /torn/**
  - **Parameters:**
    - `userId`: The user ID.
  - **Response Format:** JSON object containing user details.

### Example Response:
```json
{
  "username": "example_user",
  "level": 5,
  "stats": {
    "strength": 100,
    "defense": 80
  }
}
```

## FF Scouter API
### Endpoints
- **GET /ffscouter/**
  - **Parameters:**
    - `playerId`: The player ID.
  - **Response Format:** JSON object with player stats.

### Example Response:
```json
{
  "playerId": "12345",
  "stats": {
    "attackPower": 200,
    "defensePower": 150
  }
}
```

## Discord API
### Endpoints
- **GET /api/v9/users/@me**
  - **Parameters:**
    - `authorization`: Bearer token.
  - **Response Format:** JSON object with user details.

### Example Response:
```json
{
  "id": "987654321",
  "username": "discord_user",
  "discriminator": "1234"
}
```

## Data Mapping
- **Torn API** to **FF Scouter API**:
  - `userId` in Torn is equivalent to `playerId` in FF Scouter.
- **FF Scouter API** to **Discord API**:
  - `playerId` corresponds to the `id` in Discord API responses.

---

### Additional Info
- Rate limiting and authentication details should also be included in respective sections.