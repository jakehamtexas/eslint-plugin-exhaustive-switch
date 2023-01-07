import { TSESLint } from "@typescript-eslint/utils";

export const makeRuleTester = (): TSESLint.RuleTester =>
  new TSESLint.RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
  });

export type TestCase<
  TBaseName extends string,
  TBase,
  TVariant extends { name: string }
> = TVariant extends { name: infer UName }
  ? Omit<
      TBase &
        Omit<TVariant, "name"> & {
          name: `${TBaseName} - ${UName & string}`;
        },
      "baseName"
    >
  : never;
export const testCaseFactory = <
  TBaseName extends string,
  TBase extends { baseName: TBaseName },
  TVariants extends { name: string }[]
>(
  { baseName, ...rest }: TBase,
  ...variants: TVariants
): {
  [K in keyof TVariants]: TestCase<TBaseName, TBase, TVariants[K]>;
} => {
  return variants.map((variant) => ({
    ...rest,
    ...variant,
    name: `${baseName} - ${variant.name}`,
  })) as {
    [K in keyof TVariants]: TestCase<TBaseName, TBase, TVariants[K]>;
  };
};
