/**
 * @__PURE__
 * @fileoverview Rules for making switch/case expressions for union type values exhaustively checkable at compile time.
 * @author Jake Hamilton
 */

// export all rules in lib/rules
import requireUnreachableDefaultCase from "./rules/require-unreachable-default-case";

export const rules = {
  "require-unreachable-default-case": requireUnreachableDefaultCase,
};
