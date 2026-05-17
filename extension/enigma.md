

I am a javascript developer.

I hate how javascript has so many implicit type conversions.

But I also hate the verbosity of solutions to this problem like JSDoc, typescript, flow etc.

I basically want the language to be type safe without having to write ANY types. 
My intuition is that, when I look at the code, I can clearly see if the parameter / variable,
is of type string or number etc, then why cant a program do i form me.

This is why I came up with this form of static analysis called "Enigma type checking". 

It type checks your code, but you dont need to write a single type annotations.

It only cares about type safety (is type compatible) and not type accuracy (is this what the dev wants).

I am not a computer scientist or some reowned compiler design.

But here is a rough idea of how the analyser/checker should work. Keep in mind that there might be many
question marks and possibly ambiguities in my theory.

I will try to demonstrate the type system using a javascript like pseudosyntax.



let a; // This is a symbol and it needs a type
       // The type of a is set of all existing type in the universe
       // [0, 3.1415, {name: String}, -100, "hehe", "🎊", String, Boolean, true, false, ... ]
       // This is the universal level 

const a = 123;  // The checker infers the type of a is [`123`] (NOT [`Number`])
                // Checker tries to narrow the type as much as possible
                // This level of absraction is called literal level, because its a literal type
                // exact value type



The types are further expanded OR narrowed based on how the symbol is used

let a; // Universal type
a = 10 // Narrowed to [10]
a + 1  // Expanded to [Number], because type signature of `+` operator is (left: Number, right: Number) => Number

// So the type of `a` is infered to be [Number]


Similarly
const a = 1; // Type of a is [1]
a * 20       // Expanded to [Number], because type signature of `*` operator is (left: Number, right: Number) => Number

Narrowing and Expanding wont always work
let a = 1; // Type of a is [1]
uppercase(a) // Error, type [1] cannot be expanded to [String] in any logical sense where this program is valid


let a = 1; // Type of a is [1]
a = -1      // Type of a is expanded to [1, -1]
toFixed(1.234, a) // Error type [1, -1] cannot be expanded to type [1, 2, 3, ... 100]. Note that toFixed only accepts `digits` arguments to be between 1 to 100



let a; // Universal type
write(a) // Type narrowed to [String, Boolean, Number, Object], image this pseudolanguage cant log functions
a + a // Type narrowed to [String, Number], Its either addition or concatenation.
a - a // Type narrowed to [Number]

// So type of `a` was inferred to be Number


Functions and operators expand the type: replace current type with broader type OR narrow the type: Remove types from the set

But assignment can also push more types in the type set

let a = 10; // a is inferred to be [10]
// here `a` is [10]
a = "hello" // a is expanded to be [10, "hello"]
// here `a` is "hello"
a = true // a is expanded to be [10, "hello", true]
// here `a` is true

// hence the type of a is inferred to be [10, "hello", true], in typescript terms it would be a union of these values

You can similarly expand them to parameters

function double(x) { // type of x is inferred to be universal type set
    return x * 2;    // type of x is narrowed to be [Number] because `*` operator accepts Numbers as operands
}


function log(value, base = 10) { // type of value is inferred to be universal type set, and type of base is inferred to be [10]
    return math.log(value) / math.log(base) // type of value narrowed to be Number and type of base is expanded to be Number
}





transform = { # transform is a procedure
    return arguments.1 * 2 # transform's first argument is a [Number]
}

apply fn, value = { # apply is a procedure
                    # apply takes 2 arguments
                    # fn is infered to be Universal set
                    # value is inferred to be Universal set
    return fn value    # fn is narrowed to [Procedure] which takes 1 argument
}

apply transform, 10   # apply as you know is a procedure which takes 2 arguments: Correct
                      # argument 1 is a procedure: Correct
                      # argument 2 is universal set: Correct (compatible)