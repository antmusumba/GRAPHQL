# GraphQL Profile Page

## Description

This project is a simple profile page that fetches data from a GraphQL endpoint and displays it using SVG charts. It includes a login page to obtain a JWT for accessing the GraphQL API.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Open `scripts.js` and configure the API endpoints:**

    *   Replace `https://((DOMAIN))/api/graphql-engine/v1/graphql` with your GraphQL endpoint.
    *   Replace `https://((DOMAIN))/api/auth/signin` with your authentication endpoint.

3.  **Open `index.html` in your browser.**

## Usage

1.  Enter your username/email and password in the login form.
2.  If the credentials are valid, you will be redirected to your profile page.
3.  The profile page displays basic user information, XP, grades, and two SVG charts:
    *   XP earned over time.
    *   Projects PASS and FAIL ratio.

## GraphQL Queries

The project uses the following GraphQL queries:

*   **User data:**

    ```graphql
    {
      user {
        id
        login
      }
    }
    ```

*   **XP data:**

    ```graphql
    {
      transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
        amount
        createdAt
        path
      }
    }
    ```

*   **Progress data:**

    ```graphql
    {
      progress {
        grade
        path
        createdAt
      }
    }
    ```