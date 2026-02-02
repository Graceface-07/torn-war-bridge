# API Cheatsheet for Torn War Bridge

## Overview
This cheatsheet provides a comprehensive outline of all API endpoints for the Torn War Bridge application, detailing request and response formats, field mappings, and data flow.

---

## API Endpoints

### 1. Endpoint: **/api/v1/user**  
**Method:** GET  
**Description:** Retrieves user information.  

#### Request Format  
```json
{
   "user_id": "1234"
}
```

#### Response Format  
```json
{
   "user_id": "1234",
   "username": "Graceface-07",
   "email": "grace@example.com",
   "status": "active"
}
```

### 2. Endpoint: **/api/v1/report**  
**Method:** POST  
**Description:** Submits a report.  

#### Request Format  
```json
{
   "title": "War Report",
   "content": "Summary of the war events...",
   "date": "2026-02-01T13:33:43Z"
}
```

#### Response Format  
```json
{
   "report_id": "5678",
   "status": "submitted",
   "timestamp": "2026-02-01T13:33:43Z"
}
```

---

## Field Mappings
| API Field       | Description                 |
|------------------|-----------------------------|
| user_id          | Unique identifier for user  |
| username         | User's login name           |
| email            | User's email address        |
| status           | Current status of user      |
| title            | Title of the report         |
| content          | Content of the report       |
| report_id        | Unique identifier for report |
| timestamp        | Time when report was created|

---

## Data Flow
1. **User Input**: The user inputs data via the interface, such as their ID for retrieving user information or the content of a report.
2. **API Request**: The application sends a formatted request to the relevant API endpoint based on user actions.
3. **Server Processing**: The server processes the request, communicates with databases (if needed), and prepares a response.
4. **API Response**: The application receives the response, which is then displayed back to the user, often including confirmation messages or data visualizations.
5. **Final Report**: All relevant information is compiled for reporting back to the user, completing the transaction cycle.

---

## Conclusion
This cheatsheet is your guide to efficiently interacting with the Torn War Bridge API, encompassing all necessary endpoint details and data mapping required for effective utilization and integration.
