## Utkrisht - the Utkrisht programming language
## Copyright (C) 2025 LadyBeGood
##
## This file is part of Utkrisht and is licensed under the AGPL-3.0-or-later.
## See the license.txt file in the root of this repository.


import macros

macro shout*(args: varargs[untyped]): untyped =
    result = newStmtList()
    for arg in args:
        result.add(quote do:
            echo `arg`.astToStr, " = ", `arg`
        )


macro bench*(name: string, body: untyped): untyped =
    quote do:
        let start = cpuTime()
        `body`
        let duration = cpuTime() - start
        echo "Benchmark '", `name`, "' took ", duration, " seconds"
