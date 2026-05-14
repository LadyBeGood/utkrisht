
<div align="center">

# Utkrisht

![Build Status](https://img.shields.io/badge/build-passing-22c55e)
![Repo Size](https://img.shields.io/github/repo-size/LadyBeGood/utkrisht?color=3b82f6)
![Last Commit](https://img.shields.io/github/last-commit/LadyBeGood/utkrisht?color=8b5cf6)

*A unified language for the web*

</div>



## Overview

**Utkrisht** (uki) is a **source-to-source compiled programming language** under active development that targets **HTML, CSS, and JavaScript**, with the long-term objective of evolving into a **full-featured, unified web framework**.



## Installation

### Using npm (recommended)
```bash
npm install -g utkrisht
```

### Using bun
```bash
bun add -g utkrisht
```
> [!NOTE]
> You may need to add the global bun's bin folder to `$PATH`.

### Example usage
Compile a input.uki file to output.js file:

```bash
uki input.uki output.js
```

## Reference

### Comments

#### Regular Comments
Used for notes. They can be placed anywhere.
```
# This is a regular comment
when 10 > 5  
# This is also a comment
    write "Condition is correct" # This is also a valid comment
```

#### Documentation Comments
You can document a variable by directly placing comments above it. These comments are **directly** copied into the generated JavaScript as JSDoc comments, without any special syntax.

```
# Divide 2 numbers
# - `a`: Numerator
# - `b`: Denominator
divide a, b ~ {
    exit a / b
}
```


### Data types
Utkrisht has **5 data types**.

| Data Type     | Passed by | Clonable | iterable | Mutable | Callable | Hashable          |
|---------------|-----------|----------|----------|---------|----------|-------------------|
| **String**    | Value     | Yes      | Yes      | No      | No       | Yes               |
| **Number**    | Value     | Yes      | No       | No      | No       | Yes<sup>[1]</sup> |
| **Boolean**   | Value     | Yes      | No       | No      | No       | Yes               |
| **Procedure** | Reference | No       | No       | No      | Yes      | Yes               |
| **Structure** | Reference | Yes      | Yes      | Yes     | No       | Yes               |

> [!NOTE]
> [1] All numbers including `nan` are hashable and can be used as keys. 
> Structure uses the algorithm [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero) to test keys for equivalnce. 
> So here `nan` is considered equal to `nan`.

#### String
Strings are used to store textual data. 

Strings can be created using double quotes:
```
# Single line strings
"This is a single line string."

# Multi line string
"
    This is a multiline string.
    * These strings are allowed to span multiple lines.
    * They need to be properly indented.
    * Indentation spaces, spaces and the newline after starting quote and the newline after ending quote are all ignored.
"
```

Special characters
| Character | Description     |
|-----------|-----------------|
| `\n`      | New Line        |
| `\r`      | Carriage Return |
| `\"`      | Quote           |
| `\\`      | Backslash       |
| `\t`      | Tab             |

A string is represented internally a sequence of UTF-16 code units, identical to JavaScript strings, and thus share the same quirks.
```
write length "😼"       # 2
write "😼".1            # \ud83d

write length "é"        # 1 (é)
write length "é"        # 2 (e + "́")
write "é" = "é"         # no (no normalization)
```
#### Number
Number is represented in the double-precision 64-bit floating point format (IEEE 754), just like JavaScript's number type.
```
123            # one hundred and twenty three
123.0          # same as above

0              # zero
-0             # same as above

infinity
-infinity    
1 / 0          # infinity
-1 / 0         # -infinity
1 / -0         # -infinity
-1 / -0        # infinity

nan                   # stands for "not a number", but this is also a number 
-nan                  # same as above
0 / 0                 # nan
-0 / 0                # nan
0 / -0                # nan
-0 / -0               # nan
infinity / infinity   # nan
infinity - infinity   # nan
0 * infinity          # nan
-0 * infinity         # nan
```

```
(123 = 123.0)             # yes

(0 = 0)                   # yes
(-0 = -0)                 # yes
(0 = -0)                  # yes

(infinity = infinity)     # yes
(infinity = -infinity)    # no
(-infinity = -infinity)   # yes

(nan = nan)               # no (This is not a typo)
(nan != nan)              # yes (This is also not a typo)

is-finite 123             # yes
is-finite infinity        # no
is-finite -infinity       # no
is-nan nan                # yes
```

```
write 0.1 + 0.2 = 0.3         # no
write 0.1 + 0.2               # 0.30000000000000004

write 0.1 * 10                # 1
write 0.14 * 100              # 14.000000000000002

write 1.0000000000000001      # 1
write 9999999999999999        # 10000000000000000
```

#### Boolean
Boolean literals are represented by the keywords `yes` and `no`. There are no *truthy* or *falsy* values.

#### Procedure
Procedures are callable units of code. A procedure body is delimited by `{` ... `}`.

```
# A procedure literal
{write "Hello, World"}

# Call it using `()` 
{write "Hello, World"}()    # Hello, World
```
Procedures can accept arbitrary data called *arguments*.

When a procedure is called with arguments, the call is implicit and does not require `()` operator.
```
{write "Hi |arguments.1|"} "Happy"          # Hi Happy 
{write arguments.1 + arguments.2} 2, 3      # 5 
```



Storing them inside variables allows for code reuse. 
```
show-message ~ {
    write "Hello, World"
}

show-message()     # Hello, World
show-message()     # Hello, World
show-message()     # Hello, World
```

It also allows giving names to arguments the procedure accepts. These names are called parameters.

```
# Here `divide` is the name of procedure
# and `numerator` and `denominator` are its parameters
divide numerator, denominator ~ {
    exit numerator / denominator
}

divide 10, 5        # 2
divide 9, 6         # 1.5
```
You can also add default values for parameters
```nim
# `message` parameter has the default value of "Good morning"
# The procedure will use this value when no argument is passed to message parameter
greet name, message: "Good morning" ~ {
    write "|message|, |name|"
}

greet "Dmitri"                    # Good morning, Dmitri
greet "Ilya", "Happy holidays"    # Happy holidays, Ilya
```

### Keywords

Keywords are predefined words used by the language to perform internal operations or represent built-in behavior. 

Utkrisht has **14 keywords**. None of them are reserved and may also be used as [identifiers](#identifiers).

| Keywords                    | Description              |
|-----------------------------|--------------------------|
| `yes` `no`                  | Boolean literals         |
| `when` `else`               | Conditional branching    |
| `loop` `with` `stop` `skip` | Looping and loop control |
| `try` `fix`                 | Error handling           |
| `exit` `give`               | Exiting from a procedure |
| `import` `export`           | Package import and export |



### Symbols

Symbols are non-alphanumeric tokens that have special meaning in the language syntax.  

Symbols are context sensitive.

In Utkrisht, symbols are grouped by their role into **operators**, **separators**, **delimiters** and **terminators**.



#### Operators

Operators are symbols used to perform operations on values.


| Operator          | Position | Description     |
|-------------------|----------|-----------------|
| `~`               | Infix    | Declaration     |
| `=`               | Infix    | Assignment      |
| `=`               | Infix    | Equal           |
| `<`               | Infix    | Less Than       |
| `>`               | Infix    | More Than       |
| `!=`              | Infix    | Not Equal       |
| `<=`              | Infix    | Less Than Equal |
| `>=`              | Infix    | More Than Equal |
| `+`               | Infix    | Addition        |
| `-`               | Infix    | Substraction    |
| `*`               | Infix    | Multiplication  |
| `/`               | Infix    | Division        |
| `-`               | Prefix   | Unary Minus     |
| `+`<sup>[1]</sup> | Prefix   | Unary Plus      |
| `&`               | Infix    | And             |
| `\|`              | Infix    | Or              |
| `!`               | Prefix   | Not             |
| `.`               | Postfix  | Accessor        |
| `()`              | Postfix  | Call            |
| `/`               | Prefix   | Specifier       |
| `\`               | Prefix   | Escape          |
| `$`               | Prefix   | Reactivity      |
| `@`               | Prefix   | Async           |
| `#`               | Prefix   | Meta            |
| `:`               | Infix    | Label           |
| `..`              | Infix    | Range           |
| `...`             | Prefix   | Spread          |

> [1] Unary Plus does not perform any operation. It is simply there for symmetry with unary minus.  

#### Separators

Separators are symbols used to divide syntactic elements without performing an operation.

| Separator | Separates                                                    |
|-----------|--------------------------------------------------------------|
| `,`       | Arguments, Parameters, Properties                            |
| NewLine   | Arguments, Parameters, Properties (non-terminating contexts) |



#### Delimiters

Delimiters mark the beginning and end of syntactic constructs.

| Delimiter                    | Delimits                                       |
|------------------------------|------------------------------------------------|
| `(` ... `)`                  | Expression groups                              |
| `{` ... `}`                  | Procedures                                     |
| `[` ... `]`                  | Structures                                     |
| `"` ... `"`                  | Strings                                        |
| `/` ... `/`                  | Regular expressions                            |
| `\|` ... `\|`                | String Interpolation                           |
| `#` ... NewLine or EndOfFile | Comments                                       |
| Indent ... Dedent            | Expressions, Procedures, Arguments, Parameters |


#### Terminators
Terminators mark the end of a statement or declaration.

| Terminator | Terminates                                  |
|------------|---------------------------------------------|
| NewLine    | Statements, Comments (terminating contexts) |
| EndOfFile  | Statements, Comments                        |



### Identifiers
Identifiers are names given to different entities in Utkrisht to uniquely identify them within the source code. Identifiers can be used in various places:

```
# variables
message ~ "hi"

# structure keys
[name = "Uki"]

# packages
import components/footer
```

A valid identifier:

- contains only lowercase letters (`a–z`), numbers (`0–9`), and `-`
- starts with a lowercase letter
- ends with a lowercase letter or number
- does not contain consecutive hyphens (`--`, `---` etc.)


Valid Identifiers
```
name
user-123
p16
file-path
data-set-3
a1-b2
```

Invalid Identifiers
```
myName       # contains uppercase letter
1080p        # starts with a number
-webkit      # starts with a hyphen, will be interpreted as negation
value-       # ends with a hyphen
my--var      # contains consecutive hyphens
user_name    # contains underscore
```

### Variables
Variables are identifiers used to store data. All variables are mutable and can be reassigned.



Declare a variable using `~`
```
message ~ "Hello World"
```
Reassign a value using `=`
```
quantity ~ 34

quantity = 65
quantity = "high" # Data type of the value does not matter
```

### Control Flow
Control flow determines how execution proceeds through a program.  

#### Conditionals
Conditionals control which block will be executed based on a **condition**. The condition must be a boolean value, Utkrisht does not have truthy or falsy values. 
```
# Conditional statement
when age < 13 
    write "You're a child"
else age > 19
    write "You're an adult"
else
    write "You're a teen"


# Multiline conditional expression
status ~ 
    when age < 13 
        "child"
    else age > 19
        "adult"
    else
        "teen"
    
# Singleline conditional expression
status ~ when (age < 13) "child" else (age > 19) "adult" else "teen"
```
#### Loops
Loop is a data type sensitive construct. Therefore the behaviour of the loop depends upon the data type of the data following it.
```
# loop keyword not followed by any data type
# loops infinitely
loop
    write "hello"

# loop keyword followed by a boolean
# loops infinitely if yes
loop yes
    write "hello"

# doesn't loop if no
loop no
    write "hello"


# loop keyword followed by a number
# loops that many times
loop 5 # loops 5 times
    write "hello"


# loop keyword followed by a string or structure
# loops `length iterable` times 
loop "uki" # loops 3 times because there are 3 characters in "uki": "u", "k" and "i"
    write "hello"

loop [id = 567, yes, "orange"] # loops 3 times
    write "hello"


# with statement
# declares a iterator/counter
loop 5 with i 
    write i

    # here 
    # `i` is the iterator
    # `i` starts at 1 and ends at 5

    # 1
    # 2
    # 3
    # 4
    # 5

fruits ~ ["apple", "mango", "banana"]

loop fruits with fruit
    write "I love |fruit|"
    
    # I love apple
    # I love mango
    # I love banana

# multiple iterators can be declared
loop fruits with [i, fruit]
    write "|i|. I love |fruit|"
    
    # 1. I love apple
    # 2. I love mango 
    # 3. I love banana


loop "hi" with [index, character]
    write "The character at position |index| is |character|"

    # The character at position 1 is h
    # The character at position 2 is i



# stop statement, stops the loop
loop 50 with i
    when i = 4
        stop
    write i
    
    # 1 
    # 2 
    # 3

# skip statement, skips the iteration 
loop 4 with i
    when i = 2
        skip
    write i
    
    # 1
    # 3
    # 4


# Iteration variables can be used as labels in nested loops for skip and stop statements
loop 3 with i
    loop 3 with j
        when i = 2
            skip i
        write "|i| |j|"
    
    # 1 1
    # 1 2
    # 1 3
    # 3 1
    # 3 2
    # 3 3
```



### Packages

A package is a reusable unit of code that organizes logic into separate files and folders. 

A package can *import* other packages and *export* its variables for other packages.

> [!NOTE]
> In an Utkrisht project, in order to be imported and compiled
> - all file and folder names must be valid identifiers.
> - a folder must not contain a file and folder of same name.

There are two types of packages:
1. **File Package**: Any Utkrisht file which is not inside a folder package.
2. **Folder Package**: Any folder having a Utkrisht file of same name as a direct child.

#### Import
A package can be imported using the `import` keyword followed by its path:
```
import utilities 
import components/footer
import ../assets/icons
```
When you write an import like `import abc`, the compiler looks for:
- a file named `abc.uki`, or
- a folder named `abc` that contains a file named `abc.uki`.

Imported variables can be mutated, but not reassigned.
```
# colours.uki
export colour-palette ~ [
    red = "F00"
    green = "0F0"
    blue = "00F"
]
```

```
import colours

colour-palette.red = "EE4B2B"  # Works fine
colour-palette = []            # Error
```

#### Export
Use the `export` keyword to make the variable available to other packages that import it:
```
export message ~ "hi"
export multiply a, b ~ {
    exit a * b
}
```

## License
