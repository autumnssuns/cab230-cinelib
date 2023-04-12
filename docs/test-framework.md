# Test Plans

This document lists the test plans for the Cinehub project. Each test consists of the following:
- Name: The name of the test
- Description: A longer description of the test
- Pre-condition: What needs to be done before the test can be run
- Post-condition: What needs to be done after the test has been run
- Test Plan: The steps to follow to run the test
- Expected Result: The expected result of the test
- Actual Result: The actual result of the test
- Pass/Fail: Whether the test passed or failed
- Notes: Any additional notes

## `client` Test Plan

| Name | Description | Pre-condition | Post-condition | Test Plan | Expected Result | Actual Result | Pass/Fail | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | Tests the `Button` component | The `Button` component should be rendered | The `Button` component should be unmounted | 1. Click the button.<br> 2. Hover over the button. | The button should change color when clicked and when hovered over. | The button changes color when clicked and when hovered over. | Pass |  |


## `server` Test Plan