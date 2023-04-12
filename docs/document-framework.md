# Documentation Framework

## Components

- The documentation is written in a structured format that looks like a `yaml` file.

- The documentation includes the component's name, a brief description of what it does, and a list of its props and state:
    ```yaml
    name: Button
    description: A simple button component with customizable text and styles.

    props:
    - text (string): The text to display on the button.
    - color (string): The color of the button.

    states:
    - isActive (boolean): Whether the button is currently active.
    ```

- The documentation also includes a list of the component's methods, with each method listed by name, parameters and followed by a description of what it does.
    ```yaml
    methods:
    - handleClick: Toggles the active state of the button when it is clicked.

    - handleHover: Updates the button's style when the user hovers over it.
    ```

- The document also include the `useEffect` and their dependencies if needed, with each dependency bound to a description of what it does.
    ```yaml
    useEffect:
        - isActive: Updates the button's style when the button is active.
    ```

### Example:

```yaml
name: Button
description: A simple button component with customizable text and styles.

props:
- text (string): The text to display on the button.
- color (string): The color of the button.

states:
- isActive (boolean): Whether the button is currently active.

methods:
- handleClick: Toggles the active state of the button when it is clicked.

- handleHover: Updates the button's style when the user hovers over it.

useEffect:
    - isActive: Updates the button's style when the button is active.
```

This is the documentation for the following `Button` component:

```jsx
import React, { useState, useEffect } from 'react';

const Button = ({ text, color }) => {
    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        if (isActive) {
            setIsActive(false);
        } else {
            setIsActive(true);
        }
    };

    const handleHover = () => {
        if (isActive) {
            return 'red';
        } else {
            return 'blue';
        }
    };

    useEffect(() => {
        if (isActive) {
            button.style.color = 'red';
        } else {
            button.style.color = 'blue';
        }
    }, [isActive]);

    return (
        <button
            onClick={handleClick}
            onMouseOver={handleHover}
            style={{ color: handleHover() }}
        >
            {text}
        </button>
    );
};
```