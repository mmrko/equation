### Usage ###

`./index.js "7+6-5*4.3/2^1.0" [--skip-sanitize] [--skip-validate]`

The following input flags can be used to control the behaviour of the equation parser:

    skip-sanitize: skip input sanitization
    skip-validate: skip input validation (to achieve better performance)

Supported operands: `+`, `-`, `/`, `*`, `%`, `^`

### TODO ###

* support parentheses
* support power of power (e.g. `2^2^2`) & modulo of modulo (e.g. `10%30%8`)
* support unary operations (e.g. `sqrt` and `abs`)
* improve input validation (e.g. check for leading/trailing operand)
