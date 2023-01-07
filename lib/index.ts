/**
 * @__PURE__
 * @fileoverview Rules for making switch/case expressions for union type values exhaustively checkable at compile time.
 * @author Jake Hamilton
 */

// export all rules in lib/rules
import requireUnreachableDefaultCase from "./rules/require-unreachable-default-case";

/**
 * @__PURE__
 * The rules for the plugin, which are hardly useful in most application code.
 */
export const rules = {
  "require-unreachable-default-case": requireUnreachableDefaultCase,
};

/**
 * @__PURE__
 * Use this function to assert that your `switch` statement is exhaustive by calling it in a `default` block. When you
 * pass the discriminant, compilation will fail when the type of the discriminant is not `never`. In other words,
 * compilation will only succeed if every case of the value in the discriminant is handled in the `switch`.
 *
 * @example
 * enum Animal {
 *   Cat = "cat",
 *   Dog = "dog",
 * }
 *
 * const someAnimal = Animal.Cat as Animal;
 *
 * switch (someAnimal) {
 *   case Animal.Cat: {
 *     console.log("meow");
 *     break;
 *   }
 *   case Animal.Dog: {
 *     console.log("woof");
 *     break;
 *   }
 *   default: {
 *      // This passes because we handle both `.Cat` and `.Dog`.
 *      assertUnreachable(someAnimal);
 *   }
 * }
 *
 * enum LordsOfLordran {
 *   GravelordNito = 'ravelord-nito',
 *   WitchOfIzalith = 'witch-of-izalith',
 *   Gwyn = 'gwyn',
 *   FurtivePygmy = 'furtive-pygmy',
 * }
 *
 * const someLord = LordsOfLordran.FurtivePygmy as LordsOfLordran;
 *
 * switch (someLord) {
 *   case LordsOfLordran.GravelordNito:
 *   case LordsOfLordran.WitchOfIzalith:
 *   case LordsOfLordran.Gwyn: {
 *     console.log('not so easily forgotten');
 *     break;
 *   }
 *   default: {
 *     // This fails because we didn't handle the `.FurtivePygmy` case (so easily forgotten).
 *     assertUnreachable(someLord);
 *   }
 * }
 */
export function assertUnreachable(x: never): void {
  throw new Error(`Unreachable block reached! x: ${x}`);
}
