import { TSESTree } from "@typescript-eslint/utils";
import type {
  RuleFunction,
  RuleModule as TSRuleModule,
} from "@typescript-eslint/utils/dist/ts-eslint/Rule";
import _ from "lodash";
import { assertUnreachable } from "../assert-unreachable";
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

type IdentifierNodeResult =
  | {
      type: "found";
      discriminant: TSESTree.Expression;
      argument: TSESTree.Expression;
    }
  | { type: "not-found" }
  | { type: "unfixable" };
function getMaybeIdentifierNode(
  node: TSESTree.Node | undefined
): IdentifierNodeResult {
  if (!node) {
    return { type: "not-found" };
  }

  if (node.type === TSESTree.AST_NODE_TYPES.SwitchStatement) {
    switch (node.discriminant.type) {
      case TSESTree.AST_NODE_TYPES.ArrayPattern:
      case TSESTree.AST_NODE_TYPES.ArrowFunctionExpression:
      case TSESTree.AST_NODE_TYPES.AssignmentExpression:
      case TSESTree.AST_NODE_TYPES.AwaitExpression:
      case TSESTree.AST_NODE_TYPES.BinaryExpression:
      case TSESTree.AST_NODE_TYPES.CallExpression:
      case TSESTree.AST_NODE_TYPES.ChainExpression:
      case TSESTree.AST_NODE_TYPES.ClassExpression:
      case TSESTree.AST_NODE_TYPES.ConditionalExpression:
      case TSESTree.AST_NODE_TYPES.FunctionExpression:
      case TSESTree.AST_NODE_TYPES.ImportExpression:
      case TSESTree.AST_NODE_TYPES.JSXElement:
      case TSESTree.AST_NODE_TYPES.JSXFragment:
      case TSESTree.AST_NODE_TYPES.Literal:
      case TSESTree.AST_NODE_TYPES.TemplateLiteral:
      case TSESTree.AST_NODE_TYPES.LogicalExpression:
      case TSESTree.AST_NODE_TYPES.MetaProperty:
      case TSESTree.AST_NODE_TYPES.NewExpression:
      case TSESTree.AST_NODE_TYPES.ObjectExpression:
      case TSESTree.AST_NODE_TYPES.ObjectPattern:
      case TSESTree.AST_NODE_TYPES.SequenceExpression:
      case TSESTree.AST_NODE_TYPES.TSAsExpression:
      case TSESTree.AST_NODE_TYPES.TSSatisfiesExpression:
      case TSESTree.AST_NODE_TYPES.Super:
      case TSESTree.AST_NODE_TYPES.TaggedTemplateExpression:
      case TSESTree.AST_NODE_TYPES.ThisExpression:
      case TSESTree.AST_NODE_TYPES.TSInstantiationExpression:
      case TSESTree.AST_NODE_TYPES.TSNonNullExpression:
      case TSESTree.AST_NODE_TYPES.TSTypeAssertion:
      case TSESTree.AST_NODE_TYPES.UnaryExpression:
      case TSESTree.AST_NODE_TYPES.UpdateExpression:
      case TSESTree.AST_NODE_TYPES.YieldExpression:
      case TSESTree.AST_NODE_TYPES.ArrayExpression: {
        return { type: "unfixable" };
      }
      case TSESTree.AST_NODE_TYPES.MemberExpression: {
        return {
          type: "found",
          discriminant: node.discriminant,
          argument: node.discriminant.object,
        };
      }
      case TSESTree.AST_NODE_TYPES.Identifier: {
        return {
          type: "found",
          discriminant: node.discriminant,
          argument: node.discriminant,
        };
      }
      default: {
        assertUnreachable(node.discriminant);
      }
    }
  }

  return getMaybeIdentifierNode(node.parent);
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
    const sourceCode = context.getSourceCode();
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

              const identifierNodeResult = getMaybeIdentifierNode(node);
              switch (identifierNodeResult.type) {
                case "found": {
                  break;
                }
                case "not-found":
                case "unfixable": {
                  // eslint-disable-next-line unicorn/no-null
                  return null;
                }
                default: {
                  assertUnreachable(identifierNodeResult);
                }
              }
              const argumentSourceCode = sourceCode.getText(
                identifierNodeResult.argument
              );
              const replacementText = `${exhaustiveFunctionName}(${argumentSourceCode});`;
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
            const identifierNodeResult = getMaybeIdentifierNode(node);
            switch (identifierNodeResult.type) {
              case "found": {
                break;
              }
              case "not-found":
              case "unfixable": {
                // eslint-disable-next-line unicorn/no-null
                return null;
              }
              default: {
                assertUnreachable(identifierNodeResult);
              }
            }
            const argumentSourceCode = sourceCode.getText(
              identifierNodeResult.argument
            );
            const exhaustiveFunctionInvocationText = `${exhaustiveFunctionName}(${argumentSourceCode});`;

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
              `switch (${sourceCode.getText(
                identifierNodeResult.discriminant
              )}) { ${defaultCaseStatement} }`
            );
          },
        });
      }) as RuleFunction<TSESTree.SwitchStatement>,
    };
  },
};

export default ruleModule;
