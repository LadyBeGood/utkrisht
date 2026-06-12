
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
