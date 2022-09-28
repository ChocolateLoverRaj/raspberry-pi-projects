# Stepper Motors
![Picture of Stepper Motor](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmarket.samm.com%2F28byj-48-stepper-motor-uln2003-driver-card-general-in-428-25-B.png&f=1&nofb=1&ipt=9e360999f220cf6ae74d7b7262930771a561bb962c39c2d437c464a418213d2b&ipo=images)

Code is for controlling 28BYJ-48 stepper motors, but it can be modified to controll other stepper motors.

## Setup
- Have Node.js installed
- Run `npm i`
- Copy `example.env` to `.env` and edit your GPIO pins.

## Start
```bash
node index.js
```

## Logging / Debugging
`interval` logs the interval timing error every second.
`rev` logs every time the motor did a revolution (this should match up with the actual motor's revolution)
```bash
NODE_DEBUG=interval,rev node index.js
```
