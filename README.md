# Shipping Hazards

This project is forked from an original [Spring 2024 CS 347 (Advanced Software Design) project](https://github.com/GiseleN523/CS347-ShippingHazards) from Carleton College. The game is a web-based implementation of Battleship created by Cece Che Tita, Gisele Nelson, Willow Gu, Kendra Winhall, Ryan Dunn, and myself (Josh Meier). This version, modernizes the technology stack, enhances security and gameplay, and deploys the application to the web.

**You can check out the live game at [shippinghazards.com](https://shippinghazards.com).**

---

### Demo

<img width="1440" alt="login" src="./assets/demo.gif"></img>

---

### What I Did

After the initial class project, I wanted to update the game and deploy it in a production environment.

*   **Deployment:** The first step was to get the existing application running on a Hostinger VPS. This involved configuring the production environment to use Nginx as a reverse proxy and Daphne to handle Django's Websocket connections, setting up DNS to point to the `shippinghazards.com` domain, and ensuring the Docker containers worked correctly outside of a local development context. 
*   **Upgraded the Frontend:** The original frontend was a bit difficult to maintain and lacked the structure of modern web frameworks. I decided to migrate the entire frontend to Next.js and TypeScript. This was the most significant part of the overhaul, involving a complete rewrite of the UI. This migration introduced a proper component-based architecture, improved responsiveness, and made the codebase much cleaner and more scalable.
*   **Enhanced Security:** I implemented proper security measures for a public-facing app. This included adding an SSL certificate (via Let's Encrypt), redirecting all traffic to HTTPS, and refactoring the login flow to use POST requests and a secure, session-based authentication system instead of putting credentials in GET request logs.
*   **Improved Gameplay:** I added some quality-of-life features that were missing from the original, like buttons to easily rotate and randomize ship placements, and a join link/QR code for playing with a friend which makes getting into a game much faster. I also added a guest login feature to reduce friction.

---

### Tech Stack & Key Decisions

Here’s a look at the tech I used and why I chose it.

*   **Containerization (Docker):** The whole app is containerized. This was a no-brainer because it keeps the development and production environments consistent and makes deployment way simpler. Everything is orchestrated with `docker-compose`.
*   **Backend (Django & Nginx):**
    *   **Nginx** serves as the reverse proxy. It handles all incoming web traffic, serves the Next.js frontend, and routes API and WebSocket traffic to the right place. It also handles the SSL certificate for HTTPS.
    *   **Django** and **Django Channels** power the backend API and the real-time gameplay. Channels is perfect for the WebSocket connections needed for a live, interactive game.
*   **Frontend (Next.js & TypeScript):**
    *   I chose **Next.js** because it provides a great structure for a React app with its file-based routing. 
    *   Using **TypeScript** was key to making the frontend more robust and preventing common JavaScript errors

---

### Project Structure

The project is a monorepo with a few key services:

*   `/battleship/`: The **Django** backend.
    *   `accounts/`: Handles user sign-up, login, and guest access.
    *   `shdatabase/`: Manages all the real-time game logic and WebSocket connections via Django Channels (`consumers.py`).
*   `/frontend-next/`: The new **Next.js** and **TypeScript** frontend.
    *   `pages/`: All the pages and API routes for the app.
    *   `components/`: Reusable React components used throughout the site.
*   `/ai_server/`: A separate Python server for the AI opponent logic.
*   `/nginx/`: Nginx configuration, including the `prod.conf` file that routes all the production traffic.
*   `docker-compose.prod.yml`: Defines how all these services run together in the production environment.

---

### Future Improvements

My next steps to continue working on are...

*   **Refining the UI/UX**: Add stats directly to the home page for logged-in users instead of having a separate page.
*   **CI/CD Pipeline:** I'd set up GitHub Actions to automatically test and deploy the application when I push updates as well as more unit and integration tests
*   **Container Registry:** I'd push the Docker images to Docker Hub instead of building them on the server, which would speed up deployments by using something like Docker Stack.


