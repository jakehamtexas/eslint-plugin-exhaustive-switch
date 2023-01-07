import { TSESTree } from "@typescript-eslint/utils";
import type {
  RuleFunction,
  RuleModule as TSRuleModule,
} from "@typescript-eslint/utils/dist/ts-eslint/Rule";
import _ from "lodash";
import type { RequireUnreachableDefaultCase as RequireUnreachableDefaultCaseOptions } from "./require-unreachable-default-case.schema";
import schema from "./require-unreachable-default-case.schema.json";

export const CASES = {
  addExhaustiveFunctionInvocation: {
    selector: (exhaustiveFunctionName: string): string =>
      `SwitchCase[test=null]:not(SwitchCase:has(CallExpression[callee.name="${exhaustiveFunctionName}"]))`,
    message:
      "Call `{{ exhaustiveFunctionName }}` in the body of the default case.",
  },
  addDefaultCase: {
    selector: (_exhaustiveFunctionName: string): string =>
      "SwitchStatement:not(SwitchStatement:has(SwitchCase[test=null]))",
    message:
      "Add a default case which calls `{{ exhaustiveFunctionName }}` in its body.",
  },
};

export type MessageIds = keyof typeof CASES;
export type Options = [RequireUnreachableDefaultCaseOptions | undefined];
type RuleModule = TSRuleModule<MessageIds, Options>;

function getMaybeDiscriminantIdentifier(node: TSESTree.Node) {
  const discriminant =
    node.parent?.type === TSESTree.AST_NODE_TYPES.SwitchStatement
      ? node.parent.discriminant
      : node.type === TSESTree.AST_NODE_TYPES.SwitchStatement
      ? node.discriminant
      : undefined;
  return discriminant?.type === TSESTree.AST_NODE_TYPES.Identifier
    ? discriminant.name
    : undefined;
}

export const RULE_NAME = "require-unreachable-default-case";

const ruleModule: RuleModule = {
  defaultOptions: [{}],
  meta: {
    type: "problem",
    docs: {
      description: "require unreachable default case",
      recommended: "error",
      url: "https://github.com/jakehamtexas/eslint-plugin-exhaustive-switch/blob/main/docs/rules/require-unreachable-default-case.md",
    },
    fixable: "code",
    schema: [schema],
    messages: _.mapValues(CASES, ({ message }) => message),
  },
  create: (context) => {
    const exhaustiveFunctionName =
      context.options[0]?.unreachableDefaultCaseAssertionFunctionName ??
      schema.properties.unreachableDefaultCaseAssertionFunctionName.default;
    return {
      [CASES.addExhaustiveFunctionInvocation.selector(exhaustiveFunctionName)]:
        ((node) => {
          context.report({
            node,
            data: { exhaustiveFunctionName },
            messageId: "addExhaustiveFunctionInvocation",
            fix: (fixer) => {
              /**
               * ```javascript
               * switch(foo) {
               *   // ...
               *   default:
               *     // ==>HERE<==
               * }
               * ```
               */
              const defaultCaseConsequentFirstNode = node.consequent.at(0);

              if (!defaultCaseConsequentFirstNode) {
                // eslint-disable-next-line unicorn/no-null
                return null;
              }

              const discriminantIdentifier =
                getMaybeDiscriminantIdentifier(node) ?? "";
              const replacementText = `${exhaustiveFunctionName}(${discriminantIdentifier});`;
              if (
                defaultCaseConsequentFirstNode.type ===
                TSESTree.AST_NODE_TYPES.BlockStatement
              ) {
                // If it is a block statement, preserve braces
                return fixer.replaceText(
                  defaultCaseConsequentFirstNode,
                  `{ ${replacementText} }`
                );
              }
              return fixer.replaceText(
                defaultCaseConsequentFirstNode,
                replacementText
              );
            },
          });
        }) as RuleFunction<TSESTree.SwitchCase>,
      [CASES.addDefaultCase.selector(exhaustiveFunctionName)]: ((node) => {
        context.report({
          node,
          data: { exhaustiveFunctionName },
          messageId: "addDefaultCase",
          fix: (fixer) => {
            const lastCaseStatement = _.last(node.cases);
            const discriminantIdentifier =
              getMaybeDiscriminantIdentifier(node) ?? "";
            const exhaustiveFunctionInvocationText = `${exhaustiveFunctionName}(${discriminantIdentifier});`;

            // If other cases use braces, copy style
            if (
              lastCaseStatement?.consequent.at(0)?.type ===
              TSESTree.AST_NODE_TYPES.BlockStatement
            ) {
              return fixer.insertTextAfter(
                lastCaseStatement,
                `default: { ${exhaustiveFunctionInvocationText} }`
              );
            }

            const defaultCaseStatement = `default: ${exhaustiveFunctionInvocationText}`;
            if (lastCaseStatement) {
              return fixer.insertTextAfter(
                lastCaseStatement,
                defaultCaseStatement
              );
            }

            return fixer.replaceText(
              node,
              `switch (${discriminantIdentifier}) { ${defaultCaseStatement} }`
            );
          },
        });
      }) as RuleFunction<TSESTree.SwitchStatement>,
    };
  },
};

export default ruleModule;
