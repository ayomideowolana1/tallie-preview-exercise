

# Tallie Reservation System

A simple REST API for a restaurant table reservation system using Node.js

## Table of Contents

- [Design Decisions and Assumptions](#design-decisions-and-asssumptions)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Limitations & Future Improvements ](#limitations-and-future-improvements)

#

## Design Decisions 

- ### Overall Architecture

    The application follows a modular, layered architecture designed to keep responsibilities explicit and business logic easy to reason about.

    Each core domain (Restaurant, Table, Reservation) is implemented as a self-contained module with its own:

    - **Routes** - Define HTTP endpoints and delegate work to controllers.
    - **Controllers** - Handle request/response mapping and validation.
    - **Services** - Encapsulate all business rules
    - **Repositories** - Abstract database access 

    This structure makes the system easy to extend without introducing tight coupling across domains.
    
- ### Database & Schema Design

    A relational schema is used to model real-world relationships using ```Knex js``` +  ```Objection```. Schema evolution is managed via migrations
    
- ### Validation Strategy 

    - Input validation is handled using ```DTOs``` + ```class-validator``` and enforced through a shared validation middleware. This ensures invalid requests never reach the business layer.

- ### Error Handling & Response

    - A centralized ```AppError``` abstraction is used to distinguish different errors
    - HTTP responses are standardized using shared response utilities, making API behavior predictable for clients.

- ### Identifiers & Security

    - Public-facing identifiers use UUIDs, avoiding exposure of sequential database IDs.

    - This choice supports safer APIs and future multi-tenant or distributed scenarios.
    

- ### Assumptions
    - A restaurant can have different operating hours for different days of the week
    - Each reservation is assigned to exactly one table.
    - A table can host multiple parties at the same time as long as capicity constraints are met.
    - Restaurants operate in a single timezone.
    - Availability is calculated dynamically, not cached.
    - Availability checks take into account the following factors:
        - **Date**: the reservation date is converted to a day of the week and validated against the restaurant’s configured operating hours. 
        - **Start time**: the requested reservation start time.
        - **Duration**: the reservation length in minutes, used to dynamically compute the reservation end time and detect overlaps.
        - **Party size**: the number of guests, used to filter tables that can accommodate the request based on capacity.


#
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

<!--
You will need [Node.js](https://nodejs.org/) installed in your environment. Check the `package.json` file for the required Node.js version.
-->

- Node.js (`22.21.0`)
- MySQL (`8.0.42`)

### Installation

1.  Clone the repository:

    ```bash
    git clone git@github.com:ayomideowolana1/tallie-preview-exercise.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd tallie
    ```

3.  Install dependencies using npm or Yarn:

    ```bash
    npm install
    # or
    yarn install
    ```

4.  Create a `.env` file using the `env.example` template found in the root directory. 
    Starting the application without a complete env file will cause the error below
    ```bash
    Your .env is missing the following variables: 
    PORT,DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,DB_POOL_MIN,DB_POOL_MAX 
    ```
5. Run the application 
    ```bash
        //run development 
        yarn run dev

        OR

        // run build
        yarn run start

        
    ```

#
## API Documentation

- [Restaurant](#restaurant)
  - [Create a restaurant](#create-a-restaurant)
  - [Get all restaurants ](#get-all-restaurant)
  - [Get restaurant details](#get-restaurant-details)
  - [Add tables to a restaurant](#add-table-to-a-restaurant)
- [Table](#tables)
    - [Create a table](#create-a-table)
    - [Check table availability](#check-table-availability)
- [Reservation](#reservation)
  - [Check time slot availability](#check-time-slot-availabilty)
  - [Create a reservation](#create-a-reservation)
  - [Get restaurant reservations](#get-restaurant-reservations)

#

### Restaurant

#### Create a restaurant

This endpoint allows you to create a restaurant and define specific operating hours for each day of the week. All 7 days of the week must be specified. Set `isOpen` to disable bookings for that day of the week.

**POST** `{{base_url}}/api/restaurant `

```json
{
    "name":"Brunch Palace",
    "businessHours":[
        {
            "dayOfWeek":"monday",
            "isOpen":true,
            "openTime":"08:00",
            "closeTime":"10:00"
        },
        ...
        {
            "dayOfWeek":"sunday",
            "isOpen":false,
            "openTime":"00:00",
            "closeTime":"00:00"
        }
    ]

}
```

**Response**

```json
{
  "status": true,
  "message": "Restaurant created successfully",
  "data": {
    "name": "Levis 10",
    "id": "ec6b1d7a-d315-49f0-a88d-690454c826aa"
  }
}
```

#

#### Get all restaurants

Retrieve all existing restaurants

**GET** `{{base_url}}/api/restaurant`

**Response**

```json
{
  "status": true,
  "message": "Restaurants fetched successfully",
  "data": [
    {
      "id": "46351651-443a-4f7f-84c2-aac51c71bd82",
      "name": "Levis 10",
      "businessHours": [
        {
          "dayOfWeek": "monday",
          "isOpen": 1,
          "openTime": "10:00:00",
          "closeTime": "22:00:00"
        }
        ...
        {
            "dayOfWeek": "sunday",
            "isOpen": 1,
            "openTime": "10:00:00",
            "closeTime": "22:00:00",
        },
      ]
    }
  ]
}
```

#

#### Get restaurant details

This endpoints retrieves an individual restaurant details with its tables and operating hours

**GET** `{{base_url}}/api/restaurant/{restaurantId}`

**Response**

```json
{
  "status": true,
  "message": "Restaurant fetched successfully",
  "data": {
    "id": "46351651-443a-4f7f-84c2-aac51c71bd82",
    "name": "Levis 10",
    "businessHours": [
      {
        "dayOfWeek": "monday",
        "isOpen": 1,
        "openTime": "10:00:00",
        "closeTime": "22:00:00"
      },
        ...
      {
        "dayOfWeek": "sunday",
        "isOpen": 0,
        "openTime": "00:00:00",
        "closeTime": "00:00:00",
      }
    ],
    "tables": [
      {
        "id": "e6cf4213-b1b7-4cac-835d-d0e1e3410297",
        "tableNumber": 1,
        "capacity": 10,
      }
    ]
  }
}
```

#

### Table

#### Create a table

This endpoint adds a table to a restaurant

**POST** `{{base_url}}/api/table/add-table `

```json
{
  "restaurantId": "46351651-443a-4f7f-84c2-aac51c71bd82",
  "capacity": 10
}
```

**Response**

```json
{
  "status": true,
  "message": "Table added to restaurant successfully",
  "data": {
    "restaurantId": "46351651-443a-4f7f-84c2-aac51c71bd82",
    "capacity": 10,
    "tableNumber": 1,
    "id": "e6cf4213-b1b7-4cac-835d-d0e1e3410297"
  }
}
```

#

#### Check table availability

This endpoint can be used to check the availability of a table for a specific date, time slot and duration combination.
It also returns other open time slots that are compatible with the request time slot, capacity and duration

**POST** `{{base_url}}/api/table/check-availability `

```json
{
  "tableId": "e6cf4213-b1b7-4cac-835d-d0e1e3410297", //id of the table
  "date": "2026-01-12", // reservation date
  "time": "13:00", // reservation start time
  "capacity": 4, // no of seats
  "duration": 60 // reservation duration in minutes
}
```

**Response** - table available

```json
{
  "status": true,
  "message": "Table availability checked successfully",
  "data": {
    "available": true,
    "availableSeats": 5,
    "timeSlot": "13:00 - 14:00",
    "message": "",
    "openTimeSlots": [
      {
        "start": "11:00",
        "end": "12:00",
        "availableSeats": 10,
        "canFitParty": true
      },
      ...
      {
        "start": "21:00",
        "end": "22:00",
        "availableSeats": 10,
        "canFitParty": true
      }
    ]
  }
}
```

**Response** - table unavailable

```json
{
  "status": true,
  "message": "Table availability checked successfully",
  "data": {
    "available": false,
    "availableSeats": 0,
    "timeSlot": "10:00 - 11:00",
    "message": "No seats available for this time slot: 10:00 - 11:00",
    "openTimeSlots": [
      {
        "start": "11:00",
        "end": "12:00",
        "availableSeats": 10,
        "canFitParty": true
      },
      ...
      {
        "start": "21:00",
        "end": "22:00",
        "availableSeats": 10,
        "canFitParty": true
      }
    ]
  }
}
```

**Response** - incompatible request parameters

```json
// incompatible request capacity
{
	"status": false,
	"message": "Table capacity is 10, which is less than requested capacity of 20"
}

// incompatible request time
{
	"status": false,
	"message": "Restaurant is closed during the requested time slot 23:00 - 24:00. Operating hours are 10:00:00 - 22:00:00"
}

```

#

### Reservation

#### Get restaurant reservations

This endpoint fetches all restaurant reservations.
Add a date query to fetch reservations for the specified date

**POST** `{{base_url}}/api/reservation/:restaurantId?date=2026-01-11 `

**Response**

```json
{
  "status": true,
  "message": "Reservations fetched successfully",
  "data": [
    {
      "id": "ca347c75-eeb6-11f0-b479-7c2a31c69ee5",
      "restaurantId": "46351651-443a-4f7f-84c2-aac51c71bd82",
      "tableId": "e6cf4213-b1b7-4cac-835d-d0e1e3410297",
      "date": "2026-01-12T00:00:00.000Z",
      "startTime": "10:00:00",
      "duration": 60,
      "endTime": "11:00:00",
      "customerName": "Seyi Macks",
      "phone": "09114346539",
      "partySize": 5
    }
  ]
}
```

#

#### Create reservation

This endpoint fetches all restaurant reservations.
Add a date query to fetch reservations for the specified date

**POST** `{{base_url}}/api/reservation/:restaurantId?date=2026-01-11 `

**Request**

```json
{
  "tableId": "e6cf4213-b1b7-4cac-835d-d0e1e3410297",
  "date": "2026-01-12",
  "startTime": "10:00",
  "duration": 60, //duration in minutes
  "customerName": "Ayomide Owolana",
  "phone": "09113146539",
  "partySize": 3
}
```

**Response** - success

```json
{
  "status": true,
  "message": "Reservation created successfully",
  "data": {
    "id": "0312e27b-e110-4802-89c2-869ff9656b23"
    "tableId": "e6cf4213-b1b7-4cac-835d-d0e1e3410297",
    "restaurantId": "46351651-443a-4f7f-84c2-aac51c71bd82",
    "date": "2026-01-12",
    "startTime": "12:00",
    "duration": 60,
    "customerName": "Ayomide Owolana",
    "phone": "09113146539",
    "partySize": 3,
    "endTime": "13:00",
  }
}
```

**Response** - seats unavailable

```json
{
  "status": false,
  "message": "No seats available for this time slot: 10:00 - 11:00"
}
```



#

## Limitations & Future Improvements

### Limitations
- Each reservation is assigned to a single table. This simplifies availability checks and overlap detection but prevents seating larger groups that could be accommodated by combining tables.
- Availability is calculated in real time by evaluating existing reservations. Without caching or advanced indexing, performance may degrade as the number of tables and reservations increases.
- The API does not currently protect against excessive or automated requests, which could impact performance or lead to misuse in a production environment.
- No reservation lifecycle states are currently implemented
- Conflict prevention relies on application-level checks. Under high concurrency, this could allow race conditions without additional safeguards.


### Future Improvements
    
- Implement reservation lifecycle states to support more realistic restaurant workflows and better reporting.
- Add admin and customer notifications for confirmation, cancellation, and reminders to improve user experience.
- Support partial or full payments to enable deposits for peak hours.
- Table combination and intelligent seating optimization to allow larger parties to be seated by combining tables.
- Enable customers or admins to manage existing reservations and  status tracking.
- Expose analytics endpoints for demand, occupancy, and peak-hour trends.
- Cache computed availability to reduce repeated overlap calculations and improve response times.
- Implement rate limiting to prevent excessive or automated requests that could degrade system performance.
- Introduce role-based access control for restaurant administrators.
- Expadn test suite to cover endpoints