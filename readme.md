
<div align="center">

# Utkrisht

[![Build Status](https://img.shields.io/badge/build-passing-22c55e)]()
![Repo Size](https://img.shields.io/github/repo-size/LadyBeGood/utkrisht?color=3b82f6)
![Last Commit](https://img.shields.io/github/last-commit/LadyBeGood/utkrisht?color=8b5cf6)

*A unified language for the web*

</div>



## Overview

**Utkrisht** (uki) is a **source-to-source compiled programming language** under active development that targets **HTML, CSS, and JavaScript**, with the long-term objective of evolving into a **full-featured, unified web framework**.



## Installation
> [!WARNING]
> Do not install this now, everything is broken and has errors.


### Prerequisites
[Install Nim](https://nim-lang.org/install.html)

### Steps
Clone this repository
```
git clone https://github.com/LadyBeGood/utkrisht.git
```

Compile the compiler

```bash
nim c --d:release --opt:speed --passC:-flto --out:uki --verbosity:0 ./utkrisht/compiler/uki.nim
```

(Optional) Clean up the repository after successful compilation:
```bash
rm -rf utkrisht
```

### Example usage
Compile a input.uki file to output.js file:

```bash
./uki input.uki output.js
```

## Tutorial

### Hello, World
```
write "Hello World"
```

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
divide a, b: {
    exit a / b
}
```


> [!NOTE]
> Notation in this tutorial (used wherever necessary):
> - `#>` is the message logged in the console.
> - `#->` is the value of the preceding expression.
> - `#` is a regular comment.


### Data types
Utkrisht has 5 data types.

| Data Type | Passed by | Clonable | iterable | Mutable | Callable |
|-----------|-----------|----------|----------|---------|----------|
| String    | Value     | Yes      | Yes      | No      | No       |
| Number    | Value     | Yes      | No       | No      | No       |
| Boolean   | Value     | Yes      | No       | No      | No       |
| Procedure | Reference | No       | No       | No      | Yes      |
| Structure | Reference | Yes      | Yes      | Yes     | No       |


#### String
A string represents a sequence of UTF-16 code units, identical to JavaScript strings.

```
write length "😼"       #> 2
write "😼".1            #> \ud83d

write length "é"        #> 1 (é)
write length "é"        #> 2 (e + "́")
write "é" = "é"         #> wrong (no normalization)
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
1 / 0          #-> infinity
-1 / 0         #-> -infinity
1 / -0         #-> -infinity
-1 / -0        #-> infinity

nan            # stands for "not a number", but this is also a number
-nan           # same as above
0 / 0          #-> nan
-0 / 0         #-> nan
0 / -0         #-> nan
-0 / -0        #-> nan
```

```
write 123 = 123.0             #> right

write 0 = 0                   #> right
write -0 = -0                 #> right
write 0 = -0                  #> right

write infinity = infinity     #> right
write infinity = -infinity    #> wrong
write -infinity = -infinity   #> right

write nan = nan               #> wrong (This is not a typo)
write nan != nan              #> right (This is also not a typo)

write is-finite 123           #> right
write is-finite infinity      #> wrong
write is-finite -infinity     #> wrong
write is-nan nan              #> right
```

```
write 0.1 + 0.2 = 0.3         #> wrong
write 0.1 + 0.2               #> 0.30000000000000004

write 0.1 * 10                #> 1
write 0.14 * 100              #> 14.000000000000002

write 1.0000000000000001      #> 1
write 9999999999999999        #> 10000000000000000
```

#### Boolean
Boolean literals are represented by the keywords `right` and `wrong`. There are no *truthy* or *falsy* values.

#### Procedure



### Keywords

Keywords are predefined words used by the language to perform internal operations or represent built-in behavior. 

Utkrisht has **13 keywords**. None of them are reserved and may also be used as [identifiers](#identifiers).

| Keywords                          | Description                                   |
|-----------------------------------|-----------------------------------------------|
| `right`, `wrong`                  | Boolean literals                              |
| `when`, `else`                    | Conditional branching                         |
| `loop`, `with`, `stop`, `skip`    | Looping and loop control                      |
| `try`, `fix`                      | Error handling                                |
| `exit`                            | Exiting from a procedure                      |
| `import`, `export`                | Module import and export                      |



### Symbols

Symbols are non-alphanumeric tokens that have special meaning in the language syntax.  

Symbols are context sensitive.

In Utkrisht, symbols are grouped by their role into **operators**, **separators**, **delimiters** and **terminators**.



#### Operators

Operators are symbols used to perform operations on values.

| Operator                              | Type                                      | Description                                             |
|---------------------------------------|-------------------------------------------|---------------------------------------------------------|
| `:` `=`                               | Infix                                     | Variable declaration and reassignment                   |
| `+` `-` `*` `/`                       | Infix                                     | Arithmetic operations                                   |
| `=` `<` `>` `!=` `!<` `!>`            | Infix                                     | Comparison operations                                   |
| `&`, `\|`, `!`                        | Infix (except `!`, which is prefix)       | Logical operations                                      |
| `_`                                   | Infix                                     | Range construction                                      |
| `.`                                   | Infix                                     | Access operator                                         |
| `;`                                   | Postfix                                   | Procedure call                                          |
| `/`                                   | Prefix                                    | Module access operator                                  |
| `@`                                   | Prefix                                    | Async operator                                          |
| `$`                                   | Prefix                                    | Reactivity operator                                     |
| `~`                                   | Infix                                     | Default values for parameters and named arguments       |
| `\`                                   | Prefix                                    | Escape operator                                         |



#### Separators

Separators are symbols used to divide syntactic elements without performing an operation.

| Separator | Separates                                                    |
|-----------|--------------------------------------------------------------|
| `,`       | Arguments, Parameters, Properties                            |
| `~,`      | Arguments  (use default value for the parameter)             |
| Newline   | Arguments, Parameters, Properties (non-terminating contexts) |



#### Delimiters

Delimiters mark the beginning and end of syntactic constructs.

| Delimiter                    | Delimits                                       |
|------------------------------|------------------------------------------------|
| `(` ... `)`                  | Expression groups                              |
| `{` ... `}`                  | Procedures                                     |
| `[` ... `]`                  | Structures                                     |
| `"` ... `"`                  | Strings                                        |
| `/` ... `/`                  | Regular expressions                            |
| `\(` ... `)`                 | String Interpolation                           |
| `#` ... NewLine or EndOfFile | Comments                                       |
| Indent ... Dedent            | Expressions, Procedures, Arguments, Parameters |


#### Terminators
Terminators mark the end of a statement or declaration.

| Terminator | Terminates                                  |
|------------|---------------------------------------------|
| Newline    | Statements, Comments (terminating contexts) |
| EndOfFile  | Statements, Comments                        |



### Identifiers
Identifiers are names given to different entities in Utkrisht to uniquely identify them within the source code. Identifiers can be used in various places:

```
# variables
message: "hi"

# structure keys
[name = "Uki"]

# modules
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
user-1
user1
file-path
data-set-3
a1-b2
```

Invalid Identifiers
```
myName       # contains uppercase letter
1value       # starts with a number
-value       # starts with a hyphen, will be interpreted as negation
value-       # ends with a hyphen
my--var      # contains consecutive hyphens
user_name    # contains underscore, will be interpreted as a range
```

### Variables
Variables are identifiers used to store data. All variables are mutable and can be reassigned.



Declare a variable using `:`
```
message: "Hello World"
```
Reassign a value using `=`
```
quantity: 34

quantity = 65
quantity = "high" # Data type of the value does not matter
```

### Control Flow
Control flow determines how execution proceeds through a program.  

#### Conditionals
Conditionals control which procedure will be invoked based on a **condition**. The condition must be a boolean value, Utkrisht does not have truthy or falsy values. 
```
# Statement conditionals
when age > 18
    write "You're an adult"
else age < 18
    write "You're a child"
else
    write "You're no longer a child, you became an adult!"


# Expression conditionals
status: when age < 18 "minor" else "adult"
```
#### Loops
Loop is a data type sensitive construct. Therefore the behaviour of the loop depends upon the data type of the data following it.
```
# loop keyword followed directly by a procedure
# loops infinitely
loop
    write "hello"

# loop keyword followed by a boolean
# loops infinitely if right
loop right
    write "hello"

# doesn't loop if wrong
loop wrong
    write "hello"


# loop keyword followed by a number
# loops that many times
loop 5 # loops 5 times
    write "hello"


# loop keyword followed by a string or structure
# loops `length iterable` times 
loop "uki" # loops 3 times because there are 2 characters in "uki": "u", "k" and "i"
    write "hello"

loop [id = 567, right, "orange"] # loops 3 times
    write "hello"


# with statement
# declares a iterator/counter
loop 5 with i 
    write i

    # here 
    # `i` is the iterator
    # `i` starts a 1 and ends at 5

    #> 1
    #> 2
    #> 3
    #> 4
    #> 5

fruits: ["apple", "mango", "banana"]
loop fruits with fruit
    write "I love \(fruit)"
    
    #> I love apple
    #> I love mango
    #> I love banana

# multiple iterators can be declared
loop fruits with [i, fruit]
    write "\(i). I love \(fruit)"
    
    #> 1. I love apple
    #> 2. I love mango 
    #> 3. I love banana


loop "hi" with [index, character]
    write "The character at position \(index) is \(character)"

    #> The character at position 1 is h
    #> The character at position 2 is i



```


> [!NOTE]
> Some looping constructs are still under consideration and not included here.


```
# stop statement, stops the loop
loop 50 with i
    when i = 4
        stop
    write i
    
    #> 1 
    #> 2 
    #> 3

# skip statement, skips the iteration 
loop 4 with i
    when i = 2
        skip
    write i
    
    #> 1
    #> 3
    #> 4


# iterators can be used as labels in nested loops for skip and stop statements
loop 3 with i
    loop 3 with j
        when i = 2
            skip i
        write "\(i) \(j)"
    
    #> 1 1
    #> 1 2
    #> 1 3
    #> 3 1
    #> 3 2
    #> 3 3
```



### Modules

A module is a reusable unit of code that organizes logic into separate files and folders. 

A module can *import* other modules and *export* its variables to share them with other module that import them.

> [!NOTE]
> In an Utkrisht project, in order to be imported and compiled
> - all file and folder names must be valid identifiers.
> - a folder must not contain a file and folder of same name.

There are two types of modules:
1. **File Module**: Any Utkrisht file which is not inside a folder module.
2. **Folder Module**: Any folder having a Utkrisht file of same name as a direct child.

#### Import
A module can be imported using the `import` keyword followed by its path:
```
import utilities 
import components/footer
import ../assets/icons
import routes/[home, notifications, profile]
```
When you write an import like `import abc`, the compiler looks for:
- a file named `abc.uki`, or
- a folder named `abc` that contains a file named `abc.uki`.

#### Export
Use the `export` keyword available to other modules:
```
export message: "hi"
```

