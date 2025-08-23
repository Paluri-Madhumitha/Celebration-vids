// script.js

// Wait for the entire page to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements we want to interact with
    const heading = document.getElementById('mainHeading');
    const button = document.getElementById('myButton');

    // Add a click event listener to the button
    button.addEventListener('click', () => {
        // Change the text of the heading when the button is clicked
        if (heading.textContent === 'Welcome to My Website!') {
            heading.textContent = 'You clicked the button!';
            // Change the button text as well
            button.textContent = 'Click to go back';
        } else {
            heading.textContent = 'Welcome to My Website!';
            // Change the button text back
            button.textContent = 'Click Me';
        }
    });
});
