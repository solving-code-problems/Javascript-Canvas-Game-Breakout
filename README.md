# Creating a canvas based "BREAKOUT" style game using Javascript and HTML

This project is a very bare bones implementation of a "Breakout" style Javascript game
starting from scratch without prior planning. The idea is to show how to approach development
when you are unfamiliar with a task. I have some experience with using the Canvas API
but have never done anything similar to this project.


## Note!
This is merely a introduction to canvas programming and not a show of best practises.

For more info consider reading the links:

`https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API`
`https://developer.mozilla.org/en-US/docs/Games`



```
┌─────────────────────────────────────────────┐
│ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│ └───────────┘ └───────────┘ └───────────┘   │
│ ┌───────────┐                               │
│ └───────────┘                               │
│                                             │
│                                             │
│                   ┌─┐                       │
│                   └─┘                       │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│         ┌──────┐                            │
│         └──────┘                            │
└─────────────────────────────────────────────┘
```
## Controlls

a to move left
d to move right

## Things you can try.

* Instead of hardcoding the canvas, create it using document.createElement('canvas')
* In addition to color and position, consider adding a "power-up" to a brick, when hit, add an additional ball to the game. ( List of balls instead of a single ball )
* Consider adding different shapes rather then just rows of bricks.