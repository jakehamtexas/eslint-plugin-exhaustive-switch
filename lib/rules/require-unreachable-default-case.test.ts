import type {
  InvalidTestCase,
  ValidTestCase,
} from "@typescript-eslint/utils/dist/ts-eslint";
import schema from "./require-unreachable-default-case.schema.json";
import { makeRuleTester, testCaseFactory } from "../test-utils";
import type { MessageIds, Options } from "./require-unreachable-default-case";
import { RULE_NAME } from "./require-unreachable-default-case";
import UnreachableDefaultCase from "./require-unreachable-default-case";

const ruleTester = makeRuleTester();

const assertNeverOptions = [
  {
    unreachableDefaultCaseAssertionFunctionName: "assertNever",
  },
] as const;
const valid: ValidTestCase<Options>[] = [
  { name: "not a switch statement", code: "if (foo) { bar(); }" },
  {
    name: "switch with default case and default exhaustive function name",
    code: `switch (foo) { default: { ${schema.properties.unreachableDefaultCaseAssertionFunctionName.default}(foo); } }`,
  },
  {
    name: "switch with default case and given function name",
    code: "switch (foo) { default: { assertNever(foo); } }",
    options: assertNeverOptions,
  },
];

const invalid: InvalidTestCase<MessageIds, Options>[] = [
  ...testCaseFactory(
    {
      baseName: "switch without any cases",
      code: "switch (foo) { }",
      errors: [{ messageId: "addDefaultCase" }],
    } as const,
    {
      name: "default options",
      output: "switch (foo) { default: assertUnreachable(foo); }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output: "switch (foo) { default: assertNever(foo); }",
    }
  ),
  ...testCaseFactory(
    {
      baseName:
        "switch missing default case - no block statement in existing case",
      code: "switch (foo) { case 'bar': doSomething(); break; }",
      errors: [{ messageId: "addDefaultCase" }],
    } as const,
    {
      name: "default options",
      output:
        "switch (foo) { case 'bar': doSomething(); break;default: assertUnreachable(foo); }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output:
        "switch (foo) { case 'bar': doSomething(); break;default: assertNever(foo); }",
    }
  ),
  ...testCaseFactory(
    {
      baseName:
        "switch missing default case - has block statement in existing case",
      code: "switch (foo) { case 'bar': { doSomething(); break; } }",
      errors: [{ messageId: "addDefaultCase" }],
    } as const,
    {
      name: "default options",
      output:
        "switch (foo) { case 'bar': { doSomething(); break; }default: { assertUnreachable(foo); } }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output:
        "switch (foo) { case 'bar': { doSomething(); break; }default: { assertNever(foo); } }",
    }
  ),
  ...testCaseFactory(
    {
      baseName: "switch with empty default case",
      code: "switch (foo) { default: {} }",
      errors: [{ messageId: "addExhaustiveFunctionInvocation" }],
    } as const,
    {
      name: "default options",
      output: "switch (foo) { default: { assertUnreachable(foo); } }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output: "switch (foo) { default: { assertNever(foo); } }",
    }
  ),
  ...testCaseFactory(
    {
      baseName: "switch with only incorrect default case",
      code: "switch (foo) { default: { doSomethingElse(foo); } }",
      errors: [{ messageId: "addExhaustiveFunctionInvocation" }],
    } as const,
    {
      name: "default options",
      output: "switch (foo) { default: { assertUnreachable(foo); } }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output: "switch (foo) { default: { assertNever(foo); } }",
    }
  ),
  ...testCaseFactory(
    {
      baseName:
        "switch with conventionally located case and incorrect default case",
      code: "switch (foo) { case 'bar': doSomething(); break; default: { doSomethingElse(foo); } }",
      errors: [{ messageId: "addExhaustiveFunctionInvocation" }],
    } as const,
    {
      name: "default options",
      output:
        "switch (foo) { case 'bar': doSomething(); break; default: { assertUnreachable(foo); } }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output:
        "switch (foo) { case 'bar': doSomething(); break; default: { assertNever(foo); } }",
    }
  ),
  ...testCaseFactory(
    {
      baseName:
        "switch with unconventionally located case and incorrect default case",
      code: "switch (foo) { default: { doSomethingElse(foo); } case 'bar': doSomething(); break; }",
      errors: [{ messageId: "addExhaustiveFunctionInvocation" }],
    } as const,
    {
      name: "default options",
      output:
        "switch (foo) { default: { assertUnreachable(foo); } case 'bar': doSomething(); break; }",
    },
    {
      name: "specified options",
      options: assertNeverOptions,
      output:
        "switch (foo) { default: { assertNever(foo); } case 'bar': doSomething(); break; }",
    }
  ),
];

ruleTester.run(RULE_NAME, UnreachableDefaultCase, {
  valid: valid,
  invalid: invalid,
});
