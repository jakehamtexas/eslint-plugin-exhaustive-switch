# Require unreachable default case (`exhaustive-switch/require-unreachable-default-case`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

> Require a `switch` statement to always have a `default` case, and for that `default` case to call an unreachable assertion function.

```json
{
  "rules": {
    "exhaustive-switch/require-unreachable-default-case": "error"
  }
}
```

## Why?

In some languages with a pattern matching paradigm, like Rust, OCaml, and F#, a common convention for branching logic
is to define some algebraic type that encodes information about different varieties of a base type. In Typescript, we
can use an `enum` for this:

```typescript
enum Animal {
  Cat = "cat",
  Dog = "dog",
}
```

Other languages, using their pattern matching convention, will have a way of exhaustively checking an algebraic type,
so that there are no missed cases. In Typescript, we have a `switch` statement that we can use for this, but it doesn't
have a way to ensure that we are accounting for every branch of our `enum`.

```typescript
const someAnimal = Animal.Cat as Animal;

// This compiles just fine, and for now, it will cover every possible variation of `Animal`.
switch (someAnimal) {
  case Animal.Cat: {
    console.log("meow");
    break;
  }
  case Animal.Dog: {
    console.log("woof");
    break;
  }
}
```

What will happen if we add another variant to `Animal`, like `.Frog`? The above code will still compile, and we will
not have received an error from the compiler telling us to handle the `.Frog` case.

However, since Typescript 2.0, and the introduction of the `never` type, there is a way to check `switch` statements
for exhaustiveness at compile time - by adding a `default` case with an unreachable code block. If the compiler can
infer that every case of the discriminant (the value in parens) is handled in each `case` clause of the `switch`
statement, adding a `default` block that has unreachable code will still pass compilation. When there is another
case added to the type of the discriminant, but there is not a matching `case` clause, we will be warned safely by
the compiler.

```typescript
// This function can be imported from `eslint-plugin-exhaustive-switch`
function assertUnreachable(x: never): void {
  throw new Error(`Unreachable block reached! x: ${x}`);
}

const someAnimal = Animal.Cat as Animal;

switch (someAnimal) {
  case Animal.Cat: {
    console.log("meow");
    break;
  }
  case Animal.Dog: {
    console.log("woof");
    break;
  }
  default: {
    // The type of `someAnimal` is `never` here, so this function invocation is legal to the compiler.
    // If we add `.Frog` to `Animal`, and forget to add a `case` for it, there will be a compiler error
    // on the following line, triggering us to add the missing `case`.
    assertUnreachable(someAnimal);
  }
}
```

## Options

The package includes its own "unreachable default case assertion function", but you're free to specify your own with
options, when working in a large codebase that has already embraced this pattern.

```typescript
interface RequireUnreachableDefaultCaseOptions {
  unreachableDefaultCaseAssertionFunctionName?: string; // defaults to `assertUnreachable` when not specified
}
```

## When Not To Use It

- If you prefer to use [`@typescript-eslint/switch-exhaustiveness-check`](https://typescript-eslint.io/rules/switch-exhaustiveness-check/) and have another enforcement mechanism for avoiding `default`
- If you prefer to use `default` case for its usual purpose
