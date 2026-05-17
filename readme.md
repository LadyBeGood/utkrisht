
<div align="center">

# Utkrisht

![Build Status](https://img.shields.io/badge/build-passing-22c55e)
![Repo Size](https://img.shields.io/github/repo-size/LadyBeGood/utkrisht?color=3b82f6)
![Last Commit](https://img.shields.io/github/last-commit/LadyBeGood/utkrisht?color=8b5cf6)

*A unified language for the web*

</div>

## Table of contents
- [What is Utkrisht?](#what-is-utkrisht)
- [Installation](#installation)
    - [Example usage](#example-usage)
- [Reference](#reference)
    - [Comments](#comments)
        - [Regular Comments](#regular-comments)
        - [Documentation Comments (Under review)](#documentation-comments-under-review)
    - [Keywords](#keywords)
    - [Symbols](#symbols)
        - [Operators](#operators)
        - [Separators](#separators)
        - [Delimiters](#delimiters)
        - [Terminators](#terminators)
    - [Identifiers](#identifiers)
    - [Data types](#data-types)
        - [String](#string)
        - [Number](#number)
        - [Boolean](#boolean)
        - [Procedure](#procedure)
        - [Structure](#structure)
    - [Variables](#variables)
    - [Conditionals](#conditionals)
        - [Conditional statement](#conditional-statement)
        - [Conditional expression](#conditional-expression)
        - [Conditional comprehension](#conditional-comprehension)
    - [Loops](#loops)
    - [Error Handling](#error-handling)
    - [Packages](#packages)
        - [Import](#import)
        - [Export](#export)
- [Frequently Asked Questions](#frequently-asked-questions)
    - [Why 1-based indexing?](#why-1-based-indexing)
    - [Why use | ... | for string interpolation instead of ${ ... }, { ... } or \( ... )?](#why-use----for-string-interpolation-instead-of-------or---)
    - [Why no Truthy or Falsy values?](#why-no-truthy-or-falsy-values)
    - [Why does Utkrisht use kebab-case and not camelCase or snake_case?](#why-does-utkrisht-use-kebab-case-and-not-camelcase-or-snake_case)
    - [Why rename popular keywords like if, break and catch?](#why-rename-popular-keywords-like-if-break-and-catch)
    - [Why no const (unreassignable variables)?](#why-no-const-unreassignable-variables)
    - [Why did Utkrisht decide to not support functional or OOP paradigms?](#why-did-utkrisht-decide-to-not-support-functional-or-oop-paradigms)
- [Acknowledgements](#acknowledgements)
    - [Credits](#credits)
    - [Inspirations](#inspirations)
    - [Resources](#resources)
- [License](#license)

## What is Utkrisht?

Utkrisht (uki) is a source-to-source compiled programming language under active development that targets HTML, CSS, and JavaScript, with the long-term objective of evolving into a full-featured, unified web framework.



## Installation

```bash
npm install -g utkrisht
```

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

#### Documentation Comments (Under review)
Placed directly above declarations to describe variables. They use standard text and Markdown without any special tag syntax.

```
# The unique identifier for the active user session.
session-id = "usr_9x82j1"


# Divide 2 numbers
# 
# ### Parameters
# - `a`: Numerator
# - `b`: Denominator
#
# ### Returns
# Result of the division
#
# ### Crashes
# When denominator is `0`
divide a, b = {
    when b = 0
        crash "Division by zero"
    return a / b
}
```

### Keywords

Keywords are predefined words used by the language to perform internal operations or represent built-in behavior. 

Utkrisht has **14 keywords**. None of them are reserved and may also be used as [identifiers](#identifiers).

| Keywords                    | Description                |
|-----------------------------|----------------------------|
| `yes` `no`                  | Boolean literals           |
| `when` `else`               | Conditional branching      |
| `loop` `with` `exit` `skip` | Looping and loop control   |
| `try` `fix` `crash`         | Error handling             |
| `return`                    | Returning from a procedure |
| `import` `export`           | Package import and export  |



### Symbols

Symbols are non-alphanumeric tokens that have special meaning in the language syntax.  

Symbols are context sensitive.

In Utkrisht, symbols are grouped by their role into **operators**, **separators**, **delimiters** and **terminators**.



#### Operators

Operators are symbols used to perform operations on values.


| Operator          | Position | Description     |
|-------------------|----------|-----------------|
| `=`               | Infix    | Declaration     |
| `~`               | Infix    | Assignment      |
| `=`               | Infix    | Equal           |
| `<`               | Infix    | Less Than       |
| `>`               | Infix    | More Than       |
| `!=`              | Infix    | Not Equal       |
| `<=`              | Infix    | Less Than Equal |
| `>=`              | Infix    | More Than Equal |
| `+`               | Infix    | Addition        |
| `-`               | Infix    | Subtraction     |
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
message = "hi"

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



### Data types
Utkrisht has **5 data types**.

| Data Type     | Passed by | Clonable | Accessible | Mutable | Callable | Hashable          |
|---------------|-----------|----------|------------|---------|----------|-------------------|
| **String**    | Value     | Yes      | Yes        | No      | No       | Yes               |
| **Number**    | Value     | Yes      | No         | No      | No       | Yes<sup>[1]</sup> |
| **Boolean**   | Value     | Yes      | No         | No      | No       | Yes               |
| **Procedure** | Reference | No       | No         | No      | Yes      | Yes               |
| **Structure** | Reference | Yes      | Yes        | Yes     | No       | Yes               |

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

To get the number of characters in a string, use the count procedure:
```
count "hi"          # 2
count "goodbye"     # 7
count ""            # 0
```

To get a character at a specific position, use `.` operator. Indexing starts from **1**:
```
"webapp".1        # w
"webapp".4        # a
```

Strings are immutable and cannot be changed:
```
name = "uki"
name.1 = "n"    # Error
```

Strings allow you to embed expressions inside them, by wrapping them in `|`...`|`:
```
name = "Jane"
age = 20

write "My name is |name|, I am |age| years old."  
      # My name is Jane, I am 20 years old.
      # Note how age, a number, was automatically converted to string for embedding.
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
write count "😼"       # 2
write "😼".1           # \ud83d

write count "é"        # 1 (é)
write count "é"        # 2 (e and "́")
write "é" = "é"        # no (no normalization)

write count "👨‍👩‍👧‍👦"       # 11
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
show-message = {
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
divide numerator, denominator = {
    return numerator / denominator
}

divide 10, 5        # 2
divide 9, 6         # 1.5
```
You can also add default values for parameters
```
# `message` parameter has the default value of "Good morning"
# The procedure will use this value when no argument is passed to message parameter
greet name, message: "Good morning" = {
    write "|message|, |name|"
}

greet "Dmitri"                    # Good morning, Dmitri
greet "Ilya", "Happy holidays"    # Happy holidays, Ilya
```

#### Structure

A Structure is an ordered collection of key-value pairs and standalone values. 

It can act as both, a dynamic array and a hash map.

```
# Empty structure
empty-struct = []

# A structure acting as a dynamic array
fruits = ["apple", "banana", "mango"]

# A structure acting as a hashmap
user = [
    id = 101,
    name = "Alex",
    is-admin = yes
]

# A mixed structure containing both positional values and named properties
mixed = ["first-item", status = active, 42]
```

You can access values using the . operator. Positional elements are accessed using 1-based index numbers.
```
# Accessing named properties
write user.name       # Alex

# Accessing positional elements
write fruits.1        # apple

# Modifying elements
user.is-admin = no
fruits.2 = "orange"
```


To find out how many elements (both values and properties) exist in a structure, use the count procedure:

```
user = [id = 1, name = "Sam"]
write count user      # 2
```


### Variables
Variables are identifiers used to store data. All variables are mutable and can be reassigned.



Declare a variable using `=`
```
message = "Hello World"
```
Reassign a value using `~`
```
quantity = 34

quantity ~ 65
quantity ~ "high" # Data type of the value does not matter
```
 

### Conditionals
Conditionals control which block will be executed based on a **condition**. The condition must be a boolean value, Utkrisht does not have truthy or falsy values. 


#### Conditional statement
```
when age < 13 
    write "You're a child"
else age > 19
    write "You're an adult"
else
    write "You're a teen"
```

#### Conditional expression
Multiline
```
status = 
    when age < 13 
        "child"
    else age > 19
        "adult"
    else
        "teen"
```
Single line
```
status = when (age < 13) "child" else (age > 19) "adult" else "teen"
```

#### Conditional comprehension
```
user = [
    id = 123
    name = "Alex"
    when age < 13 
        role = "child"
        restricted = yes
    else age > 19
        role = "adult"
        restricted = no
    else
        role = "teen"
        restricted = yes
]
```


### Loops
Loop is a type sensitive construct. Therefore the behaviour of the loop depends upon the type of the data following it.

Loop keyword not followed by any data type loops infinitely:
```
loop
    write "hello"

    # hello
    # hello
    # hello
    # ...
```

Loop keyword followed by a boolean loops infinitely if `yes`, doesn't loop if `no`:
```
loop yes
    write "hello"
    
    # hello
    # hello
    # hello
    # ...


loop no
    write "hello"
```

Loop keyword followed by a number loops that many times:
```
loop 5
    write "hello"

    # loops 5 times

    # hello
    # hello
    # hello
    # hello
    # hello
```

Loop keyword followed by a string or structure loops `count iterable` times 
```
loop "uki"
    write "hello"

    # loops 3 times 
    # because there are 3 characters in "uki": 
    # "u", "k" and "i"

    # hello
    # hello
    # hello


loop [id = 567, "orange"] 
    write "hello"

    # loops 2 times 
    # because there are 2 entries inside the structure:
    # `id = 567` and `"orange"`

    # hello
    # hello
```

Loop keyword followed by a procedure (Still under consideration)
```

```


with statement declares a iterator/counter
```
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

fruits = ["apple", "mango", "banana"]

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



# exit statement, exits the loop
loop 50 with i
    when i = 4
        exit
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


# Iteration variables can be used as labels in nested loops for skip and exit statements
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

### Error Handling
Utkrisht uses explicit try, fix, and crash blocks to manage runtime errors. Errors do not silently fail; they must be intercepted or thrown explicitly.
```
# Intentional disruption using crash
divide a, b = {
    when b = 0
        crash "Division by zero"
    return a / b
}

# Catching anomalies using try and fix
try 
    result = divide 10, 0
    write result
fix error
    write "An error occurred: |error|"
```
The fix block exposes an identifier containing the payload passed to the crash statement.

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
# in colours.uki file

export colour-palette = [
    red = "F00"
    green = "0F0"
    blue = "00F"
]
```

```
import colours

colour-palette.red = "EE4B2B"  # Works fine
colour-palette ~ []            # Error
```

#### Export
Use the `export` keyword to make the variable available to other packages that import it:
```
export message = "hi"
export multiply a, b = {
    return a * b
}
```

## Frequently Asked Questions
### Why 1-based indexing?
Humans start counting at 1.

### Why use `|` ... `|` for string interpolation instead of `${` ... `}`, `{` ... `}` or `\(` ... `)`?
It provides a clean, high-visibility delimiter that is rarely used in standard text, reducing the need for complex escape sequences inside strings.

### Why no Truthy or Falsy values?
Utkrisht, unlike Javascript, prioritizes explicit logic over "magic" coercion to prevent common bugs.

### Why does Utkrisht use `kebab-case` and not `camelCase` or `snake_case`?
`kebab-case` is highly readable and easy to write, and aligns with HTML/CSS naming conventions.

### Why rename popular keywords like `if`, `break` and `catch`?
The keywords in Utkrisht were chosen based on visual symmetry and linguistic clarity:

- **Visual symmetry**: `when` and `else` have the same character count (4). 
    This creates a perfectly aligned vertical "gutter" in your code, making blocks easier for the eyes to scan compared to the uneven `if`, `else` and `else if`. 
    Similarly, `try` and `fix` share the same 3-letter width.

- **Linguistic clarity**: Traditional keywords like `break`, `continue`, `throw` and `catch` are abstract. 
    Utkrisht uses `exit`, `skip`, `crash` and `fix` because they describe exactly what is happening: You 
    - "exit" a loop 
    - "skip" an iteration
    - "crash" the program, or
    - "fix" the error

### Why no `const` (unreassignable variables)?
As a long-time JavaScript developer who faithfully follows "everything is `const` by default" philosophy, I've found it to be pretty useless in practice. 

I have never, not even once in my life, "accidently" reassigned a variable I wasn't supposed to. 
On the contrary, nearly every time I code in JS, I mistakenly declare a variable as `const`, realize it needs to change as my logic evolves, and have to back up and rewrite it to `let`.

Utkrisht saves you from this guessing game.

### Why did Utkrisht decide to not support functional or OOP paradigms?
Both paradigms promise cleaner code but deliver complexity. OOP makes you learn classes, inheritance, interfaces, and design patterns before writing anything meaningful. FP trades that for currying, composition, immutability, and referential transparency, different complexity, not less. 

OOP and FP introduce abstractions that work against Utkrisht's goal of being simple and immediately usable. The language constructs it provides, expressions, closures, structures, comprehensions, are expressive enough that the abstractions OOP and FP offer simply are not needed.

## Acknowledgements

### Credits
- **Robert Nystrom's Crafting Interpreters**: The definitive blueprint for anyone building a language from scratch.
- **Microsoft's Typescript Compiler**

### Inspirations
A lot of syntax and semantics of the language were inspired by features in different languages.



### Resources
- [Syntax across all language](https://rigaux.org/language-study/syntax-across-languages.html#FnctnFnctCall)
- [regex101](https://regex101.com/)
- 

## License
Licensed under AGPL-3.0. See [license.txt](./license.txt).