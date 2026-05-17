

// in typescript type system
let a: 1 | "hi";  // type is ALREADY KNOWN

a = 1;

// here a is of type 1

a = "hi";

// here a is of type "hi"


// But in enigma
let a;  // type is UNKNOWN, so we have to sequentially infer it AND also not allow invalid operations
        // type is inferred to be Universal type set

// here a is of type Universal type set

a = 1;  // type is narrowed to be [1]

// here a is of type 1

a = "hi";  // type is expanded to be [1, "hi"]

// here a is of type "hi"