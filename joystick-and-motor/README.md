# Stepper Motors
![Picture of Stepper Motor](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmarket.samm.com%2F28byj-48-stepper-motor-uln2003-driver-card-general-in-428-25-B.png&f=1&nofb=1&ipt=9e360999f220cf6ae74d7b7262930771a561bb962c39c2d437c464a418213d2b&ipo=images)

Code is for controlling 28BYJ-48 stepper motors, but you can change the `STEPS_PER_REVOLUTION` env var to controll other 4 phase stepper motors.

## Setup
- Have Node.js installed
- Run `npm i`
- Connect stepper motor controller to raspberry pi
- Copy `example.env` to `.env` and edit your GPIO pins.
- Connect a gamepad to raspberry pi (I connected a Xbox wireless controller with bluetooth)

## Start
```bash
node index.js
```

## Logging / Debugging
`steps` logs every step of the stepper motor, and when it is not being moved. Useful for figuring out if the problem is with your stepper motor connection, this program, or your joystick connection.
```bash
NODE_DEBUG=steps node index.js
```
