# API Cheatsheet

## Torn API
### Endpoints
- **GET /users**
  - **Description**: Fetch user details.
  - **Request**: `{ user_id: "string" }`
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "user_id": "string",
        "username": "string",
        "status": "string"
      }
    }
    ```
  - **Required Fields**: `user_id`

### FF Scouter API
### Endpoints
- **POST /scout**
  - **Description**: Submit scouting report.
  - **Request**: `{ "location": "string", "details": "string" }`
  - **Response**:
    ```json
    {
      "success": true,
      "report_id": "string"
    }
    ```
  - **Required Fields**: `location`, `details`

## Discord API
### Endpoints
- **POST /messages**
  - **Description**: Send a message to a channel.
  - **Request**: `{ "channel_id": "string", "content": "string" }`
  - **Response**:
    ```json
    {
      "success": true,
      "message_id": "string"
    }
    ```
  - **Required Fields**: `channel_id`, `content`

## Google Apps Script Webhook
### Endpoints
- **POST /webhook**
  - **Description**: Receive data from external services.
  - **Request**: `{ "payload": {} }`
  - **Response**:
    ```json
    {
      "success": true
    }
    ```
  - **Required Fields**: `payload`