### Usage ###

`./index.js "7+(6-5)*4.3/2^1.0" [--skip-sanitize] [--skip-validate]`

Supported operands: `+`, `-`, `/`, `*`, `%`, `^`, `sqrt`, `abs`

The following input flags can be used to control the behaviour of the equation parser:

    --skip-sanitize: skip input sanitization
    --skip-validate: skip input validation

For less complex equations (trees) the performance gain of skipping sanitization & validation can be up to 40-50% (see [benchmark.js](benchmark.js) for more).

### TODO ###

* improve input validation (e.g. check for leading/trailing operand & parentheses balance)
