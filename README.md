My first ever React project, straight out of training! Practicing the fundamentals, getting a little Tailwind practice in for good measure, and making a little green snake move across the screen and grow as she eats. It was also a chance to dive into coding with AI, since I sure didn't want to do any of this math myself.

[Take a look](awebdragon.github.io/react-snake/) - and feel free to go through the files, too. Beware of self-learner / nerdy comments.

# 🐍 Self-Playing Snake

This started as a “learn React by building something fun” project… and then got wildly out of hand.

I was inspired by another developer who made a snake game and tried to teach a neural learning AI how to play it, before scrapping that and deciding to create a Hamiltonian circuit with built in shortcutting. I don't know exactly what he coded, but I decided to give it a try in React - it gave me a perfect set of pre-made boundaries and goals to hit.

This Snake navigates a Hamiltonian circuit all by itself. With only the ocassional tail-biting. Or you can toggle it to manual mode and play with keyboard controls.

There's also a manual mode if you aren't as fascinated watching the snake zoom herself around as I am.

## Features

Two game modes

Manual mode: traditional keyboard-controlled Snake (WASD / Arrow keys).

Auto mode: a self-playing version that follows a handcrafted Hamiltonian path across a 20×20 grid.
It’s disciplined enough not to eat itself (mostly), but still takes clever shortcuts when it’s safe, starting with a free-running mode and transitioning into the Hamiltonian circuit while looking a short way ahead for any shortcuts it can take and still get closer to the food, and eventually following the curcuit 1:1 perfectly, all based on the length of the snake.

Responsive layout — the board scales smoothly with screen width.

Pause, reset, and mode toggle controls.

Custom color theming (Tailwind + CSS variables).

Snake body gradient that dynamically adjusts length and color for easier visual tracking.

Accessible labels and focus states (screen-reader friendly).

## Tech Stack

React 18 + Vite

Custom Hooks for game logic (useSnakeGame, useHamiltonianSnake)

Tailwind for some light styling (and a couple JS and pseudo-element tricks for some light-but-not-so-simple styling)

Vanilla JavaScript math for grid logic and pathfinding

## What’s Going On Under the Hood

The autoplayer uses a pre-computed Hamiltonian circuit — a path that visits every cell on the grid exactly once — to (kind of) guarantee that it can fill the board without collisions (most of the time).
Early on, when the snake is small, it breaks from the path to take “safe” shortcuts toward food. The hamiltonian circuit isn't used, but is still tracking the snake's head position to prepare for transitioning back onto the predestined path.
As it grows, it transitions into full Hamiltonian mode for survival, with increasingly smaller corner-cutting allowance, until there's no corner-cutting at all.

The result is a snake that behaves almost like it’s thinking… but it’s really just math.

## Design Notes

The gradient body isn’t just pretty; it makes the snake’s movement easier to follow.

Head and tail colors are passed to CSS via custom properties, so pseudo-elements render rounded ends with matching hues.

The palette is built around my project’s primary green (#77B255), the rest of the palette is based on a split complementary (#9E5CBF, #BF5C87), with adjusted variants for better readability and accessibility.

## Why This Project Exists

This project lives in my portfolio as a React fundamentals capstone — a way to experiment with state, effects, custom hooks, and logic separation, while keeping it fun and visual, and keeping my interest by recreating a game.

## Future Ideas (maybe)

Rework the manual mode for mobile controls.

Add score persistence or local storage high scores.

Alternate color themes.
