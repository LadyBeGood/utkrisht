
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

```
# This is a comment
```
Only single line comments are allowed.


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
These are the keywords in Utkrisht. None of them are reserved words and can be used as identifiers.


`else` `exit` `export` `fix` `import` `loop` `right` `skip` `stop` `try` `when` `with` `wrong`
