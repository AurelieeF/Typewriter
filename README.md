Typewriter ✨ https://typewriter-mu-drab.vercel.app/
A cozy interactive typewriter web app with both 2D and 3D modes, built as a portfolio project.
The goal of the project is to recreate the feeling of writing on a typewriter while adding a soft, magical atmosphere through sound, animation, ambient music, custom cursors, and saved notes.
Features
- 2D typewriter mode
  - Interactive on-screen keyboard
  - Physical keyboard support
  - Animated paper (movement for change of line)
  - Character limit and dynamic paper height
- 3D typewriter mode
  - Built with Three.js
  - Interactive 3D typewriter
  - Text rendered directly onto the 3D paper
  - Paper animations when saving or starting a new note
- Typing sounds
  - Multiple randomized key sounds
  - Separate sounds for Space, Enter, Backspace, and Caps Lock
- Ambient music player
  - Previous track
  - Play / pause
  - Next track
  - Volume slider
  - Starts at 50% volume
  - Automatically moves to the next ambience track
- Saved Notes
  - Save notes to a PostgreSQL database
  - Display saved notes in a side panel
  - Filter notes by date
  - Open and read individual notes
  - Navigate between notes from the same day
  - Delete notes
- Visual details
  - Glass-style magical notes panel
  - Gold sparkles and glowing particles
  - Custom princess-style cursors
  - Cursor trail effects
  - Separate backgrounds for 2D and 3D modes
Tech Stack
Frontend
- HTML
- CSS
- JavaScript
- Three.js
Backend
- Python
- Flask
- Flask-CORS
- psycopg
Database
- PostgreSQL
Project Structure
Typewriter/
│
├── public/
│   ├── images/
│   ├── Sounds/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── three-scene.js
│
├── app.py
└── README.md
Running the Project
1. Clone the repository
git clone YOUR_REPOSITORY_URL
cd Typewriter
2. Install the Python dependencies
pip install flask flask-cors psycopg
3. Configure the database
The Flask backend expects a PostgreSQL connection string in the environment variable:
DATABASE_URL
On Windows:
set DATABASE_URL=your_postgresql_connection_string
On macOS/Linux:
export DATABASE_URL=your_postgresql_connection_string
4. Start the Flask server
python app.py
Then open the local address shown by Flask in your browser.
Main API Routes
GET     /api/test
GET     /api/db-test
GET     /api/notes
POST    /api/notes
DELETE  /api/notes/<note_id>
Notes
Browsers may block ambient music from autoplaying until the user interacts with the page. Once the user clicks or interacts with the site, the music player can begin normally.
Why I Built This
I wanted to create something that combines programming with visual design instead of building a standard form-based web app.
This project lets me work with:
- frontend interaction
- JavaScript state
- audio
- animation
- 3D rendering
- backend APIs
- PostgreSQL
- UI/UX design
It is also part of my personal portfolio and an ongoing project, so more themes, animations, and interactions may be added later.
Author
AurelieeF
© 2026 AurelieeF. All rights reserved.
