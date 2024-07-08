# StockSearch-WebApp-MEAN-Stack

A responsive stock search web application that allows users to search for stock information, display results, and manage their watchlist and portfolio. Built using Angular, Bootstrap, Node.js, and several APIs.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [APIs](#apis)
- [Routes](#routes)
- [Cloud Deployment](#cloud-deployment)


## Features

- **Real-time Stock Search:** Allows users to search for stocks using the Finnhub API.
- **Autocomplete Suggestions:** Provides stock symbol suggestions as users type.
- **Stock Details:** Displays detailed information for searched stocks.
- **Watchlist Management:** Users can add stocks to their watchlist.
- **Portfolio Management:** Users can manage their stock portfolio, including buying and selling stocks.
- **Responsive Design:** Ensures usability across various devices with Bootstrap.
- **Cloud Deployment:** Supports deployment on Google App Engine, AWS, and Microsoft Azure.

## Technologies

- **Frontend:**
  - HTML5
  - Bootstrap
  - Angular

- **Backend:**
  - Node.js
  - Express.js

- **Database:**
  - MongoDB Atlas (NoSQL)

- **APIs:**
  - Finnhub API
  - Polygon.io API
  - Highcharts API

## Installation

### Prerequisites

- Node.js (v18 or later recommended)
- npm (Node Package Manager)
- Angular CLI (optional for development)

### Steps

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/stock-search-app.git
    ```
2. Navigate to the project directory:
    ```bash
    cd stock-search-app
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Usage

1. **Start the Backend Server:**
    ```bash
    npm run start-server
    ```
2. **Start the Frontend Development Server:**
    ```bash
    npm start
    ```

3. Open your browser and navigate to `http://localhost:4200` to view the application.

## APIs

- **Finnhub API**: Used for retrieving stock data.
  - **Endpoints:**
    - `/search` - Autocomplete search for stock symbols.
    - `/quote` - Fetch stock quotes.

- **Polygon.io API**: For additional stock data and market information.
- **Highcharts API**: For rendering charts in the application.

## Routes

- **Home Route [`/`]**: Redirects to the search page.
- **Search Details Route [`/search/<ticker>`]**: Displays details for the searched ticker.
- **Watchlist Route [`/watchlist`]**: Shows the user's watchlist.
- **Portfolio Route [`/portfolio`]**: Displays the user's stock portfolio.

## Cloud Deployment

This application can be deployed on various cloud platforms:

- **Google App Engine (GAE)**:
  - Documentation: [GAE Node.js](https://cloud.google.com/appengine/docs/standard/nodejs/)

- **Amazon Web Services (AWS)**:
  - Documentation: [AWS Node.js](https://aws.amazon.com/getting-started/projects/deploy-nodejs-web-app/)

- **Microsoft Azure**:
  - Documentation: [Azure Node.js](https://docs.microsoft.com/en-us/javascript/azure/?view=azure-node-latest)

### Deployment Steps

1. **GAE**:
    ```bash
    gcloud app deploy
    ```

2. **AWS Elastic Beanstalk**:
    ```bash
    eb deploy
    ```

3. **Azure**:
    ```bash
    az webapp up --sku F1 --name <your-app-name>
    ```
