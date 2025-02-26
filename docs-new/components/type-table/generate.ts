import { getProject } from 'fumadocs-typescript';
import prettier, { RequiredOptions } from 'prettier';
import {
  Node,
  SourceFile,
  ts,
  type ExportedDeclarations,
  type Project,
  type Symbol as TsSymbol,
  type Type,
} from 'ts-morph';

export interface TypescriptConfig {
  files?: string[];
  tsconfigPath?: string;
  /** A root directory to resolve relative path entries in the config file to. e.g. outDir */
  basePath?: string;
}

export interface GeneratedDoc {
  name: string;
  description: string;
  entries: DocEntry[];
}

export interface DocEntry {
  name: string;
  description: string;
  type: string;
  typeDescription?: string;
  tags: Record<string, string>;
  link?: string;
}

interface EntryContext {
  program: Project;
  transform?: Transformer;
  type: Type;
  declaration: ExportedDeclarations;
}

type Transformer = (
  this: EntryContext,
  entry: DocEntry,
  propertyType: Type,
  propertySymbol: TsSymbol,
) => void;

const prettierConfig: Partial<RequiredOptions> = {
  parser: 'typescript',
  printWidth: 40,
  arrowParens: 'always',
};

export interface GenerateOptions {
  /**
   * Allow fields with `@internal` tag
   *
   * @defaultValue false
   */
  allowInternal?: boolean;

  /**
   * Modify output property entry
   */
  transform?: Transformer;
}

export interface GenerateDocumentationOptions extends GenerateOptions {
  /**
   * Typescript configurations
   */
  config?: TypescriptConfig;
  project?: Project;
}

/**
 * Generate documentation for properties in an exported type/interface
 */
export async function generateDocumentation(
  file: string,
  name: string | undefined,
  content: string,
  options: GenerateDocumentationOptions = {},
): Promise<GeneratedDoc[]> {
  // Changed return type to Promise<GeneratedDoc[]>
  const project = options.project ?? getProject(options.config);
  const sourceFile = project.createSourceFile(file, content, {
    overwrite: true,
  });
  const out: GeneratedDoc[] = [];
  for (const [k, d] of sourceFile.getExportedDeclarations()) {
    if (name && name !== k) continue;

    if (d.length > 1) console.warn(`export ${k} should not have more than one type declaration.`);

    out.push(await generate(project, k, d[0], options, sourceFile));
    break;
  }

  return out;
}

export async function generate(
  program: Project,
  name: string,
  declaration: ExportedDeclarations,
  { allowInternal = false, transform }: GenerateOptions,
  sourceFile: SourceFile,
): Promise<GeneratedDoc> {
  const entryContext: EntryContext = {
    transform,
    program,
    type: declaration.getType(),
    declaration,
  };

  const comment = declaration
    .getSymbol()
    ?.compilerSymbol.getDocumentationComment(program.getTypeChecker().compilerObject);

  let awaitedEntries = await Promise.all(
    declaration
      .getType()
      .getProperties()
      .map((prop) => getDocEntry(prop, entryContext, sourceFile)),
  );

  const res = {
    name,
    description: comment ? ts.displayPartsToString(comment) : '',
    entries: (
      awaitedEntries.filter(
        (entry) =>
          entry &&
          (allowInternal ||
            (!('internal' in entry.tags) &&
              !('private' in entry.tags) &&
              !('ignore' in entry.tags))),
      ) as DocEntry[]
    )
      // if tags.required, keep the , otherwise sort alphabetically
      .sort((a, b) => {
        if (a.tags.required === 'true' && b.tags.required !== 'true') {
          return -1;
        }

        if (a.tags.required !== 'true' && b.tags.required === 'true') {
          return 1;
        }

        return a.name.localeCompare(b.name);
      }),
  };

  return res;
}

async function getDocEntry(
  prop: TsSymbol,
  context: EntryContext,
  sourceFile: SourceFile,
): Promise<DocEntry | undefined> {
  const { transform, program } = context;

  if (context.type.isClass() && prop.getName().startsWith('#')) {
    return;
  }

  const subType = program.getTypeChecker().getTypeOfSymbolAtLocation(prop, context.declaration);

  if (subType.isNever()) {
    return;
  }

  const tags = Object.fromEntries(
    prop.getJsDocTags().map((tag) => [tag.getName(), ts.displayPartsToString(tag.getText())]),
  );

  const isRequired = !prop.isOptional();
  if (isRequired) {
    tags.required = 'true';
  }

  let typeDescription: string | undefined = undefined;
  let typeName = subType
    .getNonNullableType()
    .getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);

  // Generics, e.g. `R`
  if (subType.isTypeParameter()) {
    typeName = subType
      .getApparentType()
      .getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
  }

  if (subType.getAliasSymbol() && subType.getAliasTypeArguments().length === 0) {
    typeName = subType.getAliasSymbol()?.getEscapedName() ?? typeName;
  }

  if (subType.getNonNullableType().isUnion() && !['boolean'].includes(typeName)) {
    const types = subType
      .getNonNullableType()
      .getUnionTypes()
      .map((t) => {
        const text = t.getText();
        if (
          ['null', 'undefined', 'number', 'string', 'boolean', 'date', 'false', 'true'].includes(
            text,
          )
        ) {
          return text;
        }
        const literalValue = t.getLiteralValue();
        if (literalValue !== undefined) {
          return `"${literalValue}"`; // It's a literal type like 'left' | 'right' | 'center'
        }

        // If it's not a literal, resolve references
        const symbol = t.getSymbol();
        if (symbol) {
          const declarations = symbol.getDeclarations();
          if (declarations?.length === 1) {
            return declarations[0].getText().trim();
          }
          return symbol
            .getDeclaredType()
            .getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
        }

        return 'undefined';
      })
      .filter((t) => t !== 'undefined');
    if (types.length > 1) {
      typeDescription = typeName;
      typeName = types
        .flat()
        .filter((t) => t !== 'undefined')
        .map((t) => {
          if (t.startsWith('(')) {
            return 'function';
          }
          return t;
        })
        .join(' | ')
        .trim();
      if (typeName === typeDescription) {
        typeDescription = undefined;
      }

      if (subType.getNonNullableType().isInterface()) {
        typeDescription = `interface ${typeDescription}`;
      } else {
        typeDescription = typeDescription
          ?.split(' | ')
          .map((t) => {
            if (t.slice(0, 1) === t.slice(0, 1).toLowerCase()) {
              return t;
            }
            return `type ${t}`;
          })
          .join(' | ');

        const hasFunction = typeName.includes('function');
        if (hasFunction) {
          typeDescription += `\n---\n`;
          typeDescription += types
            .flat()
            .filter((t) => t !== 'undefined')
            .map((t) => {
              if (t.startsWith('(')) {
                return `\nfunction ${prop.getName()} ${t}\n`;
              }
              return t;
            })
            .join(' | ')
            .trim();
        }
      }
    }
  }

  if (
    subType.getNonNullableType().isReadonlyArray() ||
    subType.getNonNullableType().getAliasSymbol()?.getDeclaredType().isArray()
  ) {
    const elementType = subType.getNonNullableType().getTypeArguments()[0];
    if (elementType.getLiteralValue() !== undefined) {
      // do nothing
    } else {
      const symbol = elementType.getSymbol();
      if (symbol) {
        typeDescription = `Array<${
          symbol.getDeclarations()?.map((decl) => {
            if (Node.isInterfaceDeclaration(decl)) {
              const properties = decl
                .getProperties()
                .map((prop) => {
                  const name = prop.getName();
                  const type = prop.getType().getNonNullableType().getText(decl);
                  const questionToken = prop.hasQuestionToken() ? '?' : '';
                  return [`${name}${questionToken}`, type];
                })
                .sort(([a], [b]) => {
                  const aRequired = a.endsWith('?');
                  const bRequired = b.endsWith('?');
                  if (aRequired && !bRequired) {
                    return 1;
                  }
                  if (!aRequired && bRequired) {
                    return -1;
                  }
                  if (aRequired && bRequired) {
                    return 0;
                  }
                  return a.localeCompare(b);
                });

              return JSON.stringify(Object.fromEntries(properties), null, 2)
                .replace(/(?<!\\)"/g, '')
                .replace(/\\"/g, '"');
            }
            return decl.getText();
          }) || 'Unknown Type'
        }>`;
        typeName = typeName.replace('readonly ', '');

        if (typeName === 'R[]') {
          typeName =
            symbol
              .getDeclaredType()
              .getApparentType()
              .getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope) + '[]';
        }
        if (Node.isInterfaceDeclaration(symbol.getDeclarations()?.[0])) {
          typeName = `interface ${typeName}`;
        }
      } else {
        const types = elementType
          .getUnionTypes()
          .map((t) => {
            if (t.isTypeParameter()) {
              return t
                .getApparentType()
                .getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
            }
            return t.getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
          })
          .filter((t) => t !== 'undefined');

        typeDescription = `Array<${types.sort().join(' | ') || 'any'}>`;
      }
    }
  }

  let link = '';
  // is function
  const callSignatures = subType.getNonNullableType().getCallSignatures();
  if (callSignatures.length > 0) {
    const aliasSymbol = subType.getNonNullableType().getAliasSymbol();
    if (!aliasSymbol) {
      const fnType = callSignatures[0].getDeclaration().getText();
      const fnForm =
        `function ${prop.getName()}${typeName.startsWith('<') ? '' : ' '}${fnType}`.replace(
          '=>',
          ':',
        );
      const notation = await prettier
        .format(fnForm, prettierConfig)
        .then((formatted) => formatted.replace('FAKEVOID', 'void').trim())
        .catch(() => {
          return fnForm;
        });
      typeDescription = notation;
    } else {
      typeDescription = typeName;
    }
    typeName = `function`;

    if (aliasSymbol) {
      const aliasedType = aliasSymbol.getDeclaredType();

      if (aliasedType) {
        const signature = aliasedType.getCallSignatures()[0];
        const declaration = signature.getDeclaration();
        const delcarationText = declaration.getText();

        /* const name = aliasSymbol.getName();
        const nameWithImport = aliasedType.getText();

        if (nameWithImport.startsWith('import("')) {
          const alias = sourceFile.getTypeAlias(name);
          const sf = alias?.getSourceFile();
          const start = sf?.getTypeAlias(name)?.getStartLineNumber();

          link =
            '/packages/x-data-grid/' +
            nameWithImport.split('packages/x-data-grid/')[1].split('")')[0] +
            '.ts' +
            (start != null ? `#L${start}` : '');
        } */

        const fnForm =
          `function ${prop.getName()}${delcarationText.startsWith('<') ? '' : ' '}${delcarationText}`.replace(
            '=>',
            ':',
          );
        const notation = await prettier
          .format(fnForm, prettierConfig)
          .then((formatted) => formatted.trim())
          .catch(() => {
            return fnForm;
          });
        typeDescription += `\n---\n${notation}`;
      }
    }

    if (typeName === 'function') {
      if (tags.returns) {
        typeDescription += `\n---\nReturns: ${tags.returns.replace(/^\s*\-\s*/, '')}`;
      }
    }
  }

  if (typeName.startsWith('{')) {
    typeDescription = await prettier
      .format(`interface Dummy ${typeName}`, prettierConfig)
      .then((formatted) => formatted.replace('interface Dummy ', '').trim())
      .catch(() => typeName);
    typeName = `object`;
  }

  if (!typeDescription && subType.getNonNullableType().isInterface()) {
    typeName = `interface ${typeName}`;
    typeDescription =
      subType.getNonNullableType().getAliasSymbol()?.getDeclarations()[0]?.getText() ??
      subType.getNonNullableType().getSymbol()?.getDeclarations()[0]?.getText();
  }

  if (
    !typeDescription &&
    !typeName.startsWith('Record<') &&
    subType.getNonNullableType().getAliasSymbol()
  ) {
    let alias = subType.getNonNullableType().getAliasSymbol();
    if (typeName.startsWith('Partial<')) {
      alias = subType.getNonNullableType().getTypeArguments()[0]?.getSymbol();
      typeDescription = subType
        .getNonNullableType()
        .getAliasTypeArguments()[0]
        .getSymbol()
        ?.getDeclarations()[0]
        ?.getText();
    } else {
      typeDescription = alias
        ?.getDeclarations()[0]
        ?.getText()
        ?.replace(/^export /, '');
      if (typeDescription) {
        typeName = `type ${typeName}`;
      }
    }
  }

  if ('remarks' in tags) {
    const remark = /^`(?<name>.+?)`/.exec(tags.remarks)?.[1];
    if (remark) {
      typeName = remark;
      typeDescription = /\^\s?`(?<name>.+?)`/.exec(tags.remarks)?.[1];
    }
  }

  const entry: DocEntry = {
    name: prop.getName(),
    description: ts
      .displayPartsToString(
        prop.compilerSymbol.getDocumentationComment(program.getTypeChecker().compilerObject),
      )
      ?.replace(/\[\[(.*?)\]\]/g, '$1'),
    tags,
    type: typeName,
    typeDescription,
    link,
  };

  transform?.call(context, entry, subType, prop);

  return entry;
}
