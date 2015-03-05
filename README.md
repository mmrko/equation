### Usage ###

`./index.js "7+6-5*4.3/2^1.0" [--skip-sanitize] [--skip-validate]`

Supported operands: `+`, `-`, `/`, `*`, `%`, `^`

The following input flags can be used to control the behaviour of the equation parser:

    skip-sanitize: skip input sanitization
    skip-validate: skip input validation

For less complex equations (trees) the performance gain of skipping sanitization & validation can be upto 40-60% (see [benchmark.js](benchmark.js) for more).

### TODO ###

* support parentheses
* support unary operations (e.g. `sqrt` and `abs`)
* improve input validation (e.g. check for leading/trailing operand)
