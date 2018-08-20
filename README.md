Setup
---

- Ensure you have node.js installed at version >= 6.2.0
- Fork this project
- Clone your forked project to your local environment

Install
---

- Run `npm install` to install dependencies
- Run `npm start` to start the static server
- Open `http://localhost:8080`

Instructions
---

- The full specifications and an example video of a finished test are on the page when you launch your browser.

Submit
---

- Push your changes to a branch in your forked project
- Submit a Pull Request back to this repository with your completed challenge code.
- Please complete ASAP.


Solution
---

The problem, as I understand it, is to produce a web app that allows its user
to select a series tag and a series under that tag, and then view the details
for that series.  Moreover, the task is to do so without the use of a framework
and while exemplifying mastery in:

1. working with a dataset
2. handling templating & DOM manipulation
3. binding events to DOM actions
4. organizing classes

Additionally, it helps to show mastery in implementing:

1. styling
2. animations
3. null-case handling, specifically for if there's no series for tag
4. selectively disabling buttons, specifically the clear button

Approach

1. First things first, load the real data and present it 
2. Then, create event handlers for when data is selected & show selected data
3. Then, create event handlers for when a series is selected & show selected data
4. Then, add null-case handling and selective disabling
5. Spruce up styling
6. Add some animations
7. Create multiple subcomponents (challenge accepted)

Notes from implementing solution:

* 

