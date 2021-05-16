# To Do List

Basic website built as JavaScript practice.

## Reflection

This mini-project was intended to be practice for developing better OOP habits. Separation of code that handles the UI,
code that handles user input, and code that handles the data was implemented via ES6 modules, and I tried to limit
coupling between modules via an events module.

There were quite a few difficulties that arose in the process of making this mini-project, much of them organizational.
The data emitted with events was often inconsistently typed and / or formatted, leading to a lot of times where I had to
look at the actual code to see what I could use. Some additional thought on this would be much appreciated the
next time I use events.

Similarly, typing was often an issue, with the DOM-facing module often using Strings when Numbers were expected.

There were also far too many very minor commits relating to minor style changes. Writing the commit messages
likely took me longer than actually making the changes. Next time I should just note down the changes
and make them in one go, given they are not urgent and are simply aesthetic tweaks.

Lastly, better testing of individual components and functions before moving on would have saved me
a lot of time. There were many such functions that had to be tweaked later on, a hassle that
could have been avoided with more thorough testing.
