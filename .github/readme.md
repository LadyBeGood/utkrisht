
<div align="center">

# Utkrisht

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Version](https://img.shields.io/badge/version-0.1.0-orange)]()
[![Platform](https://img.shields.io/badge/platform-linux-lightgrey)]()

*A single language for the web*

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

## Language tutorial

### Hello, World
```
write "Hello World"
```

### Comments
Only single line comments are allowed.
```
# This is a comment
```


> [!NOTE]
> Notation in this tutorial (used wherever necessary):
> - `#>` comment means the message logged in the console.
> - `#->` comment means the value of the preceding expression.


### Data types
Utkrisht has 5 data types:

1. String
2. Number
3. Boolean
4. Procedure
5. Structure

```
# String 
"I program in Utkrisht 😼"

# Number 
-10.56

# Boolean 
right
wrong 

# Procedure 
{write "Hello World"}

# Structure 
["src/data.uki", optimise = right]
```

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



### Operators

Operators are symbols used to perform operations on values.  
Utkrisht operators are context-sensitive.

| Operators                 | Type                     | Description                                   |
|---------------------------|--------------------------|-----------------------------------------------|
| `:`                       | infix                    | Variable declaration                          |
| `=`                       | infix                    | Reassignment   |
| `+` `-` `*` `/`        | infix                    | Arithmetic operations                         |
| `=` `<` `>` `!=` `!<` `!>`          | infix                   | Comparison operations                         |
| `&` `\|` `!`                | infix  (except `!` which is prefix)                   | Logical operators                            |
| `_`                       | infix                    | Range construction                            |
| `.`                       | infix                    | Access operator                               |
| `;`                       | postfix                  | Call operator                       |



### Identifiers

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


