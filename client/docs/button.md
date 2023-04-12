# Button

A simple button component.

## Usage

```jsx
import React from 'react';
import Button from '../components/Button';

const MyComponent = () => (
  <div>
    <Button onClick={() => console.log('Clicked!')}>Click me</Button>
  </div>
);

```

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onClick | function | false | () => {} | The function to call when the button is clicked. |
| disabled | boolean | false | false | Whether the button is disabled. |
| children | node | true |  | The text to display on the button. |